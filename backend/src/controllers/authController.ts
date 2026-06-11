import BaseController from "./BaseController";
import { Request, Response } from "express";
import { ApiResponseWithMessage, AuthenticatedRequest, EmailVerificationRequest, LoginRequest, RegisterRequest, ROLE, SendVerificationRequest, User } from "../types";
import AuthService from "../services/auth.service";
import UserModel from "../models/userModel";
import EmailService from "../services/email.service";
import EmailVerificationModel from "../models/EmailVerificationModel";
import dbConnection from "../../database/db";
import { RowDataPacket } from "mysql2";

class AuthController extends BaseController {

    static async sendVerificationCode(
        req: Request<{}, ApiResponseWithMessage<{message: string}>, SendVerificationRequest>, 
        res: Response<ApiResponseWithMessage<{message: string}>>)
        : Promise<void> {
            try{
                const { email, username, password, role } = req.body;

                // Basic validation
                if(!username) return AuthController.sendValidationError(res, "Name is required");
                if(!email) return AuthController.sendValidationError(res, "Email is required");
                if(!password) return AuthController.sendValidationError(res, "Password is required");

                // Email validation using existing service
                const emailValidation = AuthService.validateEmail(email);
                if(!emailValidation.isValid){
                    return AuthController.sendValidationError(res, emailValidation.message || "Invalid Email Format");
                }

                // Password validation using existing service
                const passwordValidation = AuthService.validatePasswordStrength(password);
                if(!passwordValidation.isValid) {
                    return AuthController.sendValidationError(res, passwordValidation.message || "Password doesn't match required criteria.");
                }

                // Check if user exists using existing service
                const checkUser = await AuthService.checkUserExists(username, email);
                if(checkUser.userExists) {
                    return AuthController.sendConflict(res, checkUser.message || "User already exists");
                }

                // Hash password using existing service
                const hashedPassword = await AuthService.hashPassword(password);

                // Generate verification code using static method
                const verificationCode = EmailService.generateVerificationCode();
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

                const userData = {
                    name: username, // Fixed: should be 'name' not 'username' to match User interface
                    email, 
                    password: hashedPassword,
                    role: role || 'user'
                };

                // Create verification record
                await EmailVerificationModel.createVerification({
                    email,
                    verification_code: verificationCode,
                    user_data: userData,
                    expires_at: expiresAt
                });

                // Send verification email
                const emailService = new EmailService();
                const emailSent = await emailService.sendVerificationEmail(email, verificationCode, username);

                if(!emailSent) {
                    return BaseController.sendServerError(res, "Failed to send verification code.");
                }

                return BaseController.sendSuccess(res,
                    { message: "Verification code sent to your email" },
                    "Please check your email for the verification code"
                );
            } catch (err) {
                console.error('Error in sendVerificationCode:', err);
                return BaseController.sendServerError(res, 'Failed to send verification code');
            }
    }

    static async verifyEmailAndRegister(
        req: Request<{}, ApiResponseWithMessage<{user: Omit<User, 'password'>, token: string, refreshToken?: string}>, EmailVerificationRequest>, 
        res: Response<ApiResponseWithMessage<{user: Omit<User, 'password'>, token: string, refreshToken?: string}>>)
        : Promise<void> {
            try{
                const { email, verification_code } = req.body; 

                if(!email || !verification_code) {
                    return BaseController.sendValidationError(res, "Email and verification code are required.");
                }

                // Verify the code using existing model method
                const userData = await EmailVerificationModel.verifycode(email, verification_code);

                if(!userData) {
                    return BaseController.sendValidationError(res, "Invalid or expired verification code.");
                }
            
                const { name, password, role } = userData as any;

                // Register user using existing method
                const newUser = await UserModel.register({ name, email, password, role });

                if(!newUser) {
                    return BaseController.sendServerError(res, "Failed to register user.");
                }

                // Mark email as verified with correct parameter type
                await UserModel.markEmailAsVerified(newUser.user_id!);

                // Create auth response using existing service
                const authResponse = AuthService.createAuthResponse(newUser);
                if(!authResponse.success) {
                    return AuthController.sendServerError(res, authResponse.message);
                }

                return AuthController.sendSuccess(res, authResponse.data!, "User registered successfully.");
                
            } catch (err) {
                console.error('Error in verifyEmailAndRegister:', err);
                return BaseController.sendServerError(res, 'Failed to verify email and register user');
            }
    }

    // DEPRECATED: Use sendVerificationCode -> verifyEmailAndRegister flow instead
    // This method registers users without email verification
    static async register( 
        req: Request<{}, ApiResponseWithMessage<{ user: Omit<User, 'password'>; token: string }>, RegisterRequest>, 
        res: Response<ApiResponseWithMessage<{ user: Omit<User, 'password'>; token: string }>>)
        : Promise<void> 
    {
        try{
            const { name, email, password, role = ROLE.USER } = req.body; 
            
            // Basic validation
            if(!name) return AuthController.sendValidationError(res, "Name is required");
            if(!email) return AuthController.sendValidationError(res, "Email is required");
            if(!password) return AuthController.sendValidationError(res, "Password is required");

            // Use existing validation services
            const emailValidation = AuthService.validateEmail(email);
            if(!emailValidation.isValid){
                return AuthController.sendValidationError(res, emailValidation.message || "Invalid Email Format");
            }

            const passwordValidation = AuthService.validatePasswordStrength(password);
            if(!passwordValidation.isValid) {
                return AuthController.sendValidationError(res, passwordValidation.message || "Password doesn't match required criteria.");
            }

            // Use existing service to check if user exists
            const checkUser = await AuthService.checkUserExists(name, email);
            if(checkUser.userExists) {
                return AuthController.sendConflict(res, checkUser.message || "User already exists");
            }

            // Use existing service to hash password
            const hashedPassword = await AuthService.hashPassword(password);
            const userData = { name, email, password: hashedPassword, role };

            // Register user
            const newUser = await UserModel.register(userData);
            if(!newUser) {
                return AuthController.sendServerError(res, "Unable to register user");
            }

            // Use existing service to create auth response
            const authResponse = AuthService.createAuthResponse(newUser);
            if(!authResponse.success) {
                return AuthController.sendServerError(res, authResponse.message);
            }

            // Send success response
            AuthController.sendSuccess(res, authResponse.data!, "User registered successfully");

        } catch(err:any){
            // Enhanced logging: surface underlying SQL or validation errors to console
            const detailed = err?.sqlMessage || err?.message || err;
            console.error('Error in register (detailed):', detailed);
            // Only expose detailed message to client in development to aid debugging
            if(process.env.NODE_ENV === 'development'){
                AuthController.sendServerError(res, detailed as string);
            } else {
                AuthController.sendServerError(res, "Internal Server Error");
            }
        }
    }

    static async resendVerificationCode(
        req: Request<{}, ApiResponseWithMessage<{message: string}>, {email: string}>, 
        res: Response<ApiResponseWithMessage<{message: string}>>)
        : Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                return BaseController.sendValidationError(res, "Email is required");
            }

            // Check if there's a pending verification using direct query 
            // (since we don't have a dedicated service method for this)
            const query = `
                SELECT user_data FROM email_verifications 
                WHERE email = ? AND expires_at > NOW() AND is_used = FALSE
                ORDER BY created_at DESC LIMIT 1
            `;
            
            const [rows] = await dbConnection.execute<RowDataPacket[]>(query, [email]);
            
            if (rows.length === 0) {
                return BaseController.sendNotFound(res, "No pending verification found for this email");
            }

            const userData = rows[0].user_data;
            const { name } = userData as any; // Fixed: should be 'name' not 'username'

            // Generate new verification code using static method
            const verificationCode = EmailService.generateVerificationCode();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Clean up old verifications and create new one using existing methods
            await EmailVerificationModel.cleanupExpiredVerifications(email);
            await EmailVerificationModel.createVerification({
                email,
                verification_code: verificationCode,
                user_data: userData,
                expires_at: expiresAt
            });

            // Send new verification email
            const emailService = new EmailService();
            const emailSent = await emailService.sendVerificationEmail(email, verificationCode, name);

            if (!emailSent) {
                return BaseController.sendServerError(res, "Failed to send verification email");
            }

            return BaseController.sendSuccess(res,
                { message: "New verification code sent" },
                "Please check your email for the new verification code"
            );

        } catch (err) {
            console.error('Error in resendVerificationCode:', err);
            return BaseController.sendServerError(res, 'Failed to resend verification code');
        }
    }

    static async Login (
        req: Request<{}, ApiResponseWithMessage<{user: Omit<User, 'password'>, token: string}>, LoginRequest>,
        res: Response<ApiResponseWithMessage<{user: Omit<User, 'password'>, token: string}>>
    ): Promise<void> {
    try{
        const { username, password } = req.body;

        if(!username){
            return AuthController.sendValidationError(res, "Username is required.");
        }
        if(!password){
            return AuthController.sendValidationError(res, "Password is required.");
        }

        const dbUser = await UserModel.findByUsernameOrEmail(username);
        if(!dbUser){
            return AuthController.sendNotFound(res, "User with the given username doesn't exist.");
        }

        if(!dbUser.password){
            return AuthController.sendServerError(res, 'Corrupted user record: missing password hash');
        }

        const matchPassword = await AuthService.comparePassword(password, dbUser.password);
        if(!matchPassword){
            return AuthController.sendValidationError(res, "Password doesn't match.");
        }

        if(!dbUser.role){
            return AuthController.sendServerError(res, 'Corrupted user record: missing role');
        }

        const authResponse = AuthService.createAuthResponse(dbUser);
        if(!authResponse.success) return AuthController.sendServerError(res, authResponse.message );

        AuthController.sendSuccess(res, authResponse.data!, "Login successful");
    } catch(err){
        console.error("Error logging in", err);
                return AuthController.sendServerError(res, "Internal Server Error");
      }
    }

    static async getCurrentUser(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<Omit<User, 'password'>>>): Promise<void>{
        try{
            const userId = req.user?.user_id;
            if(!userId){
                return AuthController.sendUnathorized(res);
            }

            const user = await UserModel.findById(userId);
            if(!user) {
                return AuthController.sendNotFound(res, "User not found.");
            }

            const userResponse = AuthService.cleanUser(user);
            if(!userResponse){
                return AuthController.sendServerError(res);
            }

            return AuthController.sendSuccess(res, userResponse, "User profile Retrived successfully.");
        } catch(err){
            console.error("Unable to get user, ", err);
            return AuthController.sendServerError(res, "Internal Server Error");
        }
    }

    static async refreshToken(req: Request, res: Response<ApiResponseWithMessage<{token: string, refreshToken: string}>>): Promise<void>{
        try{
            const { refreshToken } = req.body;
            console.log('[REFRESH] Received refresh token request');
            
            if(!refreshToken){
                console.log('[REFRESH] No refresh token provided');
                return AuthController.sendValidationError(res, "Refresh token is required");
            }

            // ✅ Verify the refresh token
            const decoded = AuthService.verifyRefreshToken(refreshToken);
            if(!decoded){
                console.log('[REFRESH] Invalid or expired refresh token');
                return AuthController.sendUnathorized(res, "Invalid or expired refresh token");
            }

            console.log('[REFRESH] Token verified for user:', decoded.user_id);

            const user = await UserModel.findById(decoded.user_id);
            if(!user) {
                console.log('[REFRESH] User not found:', decoded.user_id);
                return AuthController.sendNotFound(res, "User not found!");
            }

            if(!user.user_id || !user.role) {
                console.log('[REFRESH] Invalid user data');
                return AuthController.sendValidationError(res, "Invalid User");
            }

            // ✅ Generate new access token and refresh token
            const newAccessToken = AuthService.generateToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role as ROLE
            });

            const newRefreshToken = AuthService.generateRefreshToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role as ROLE
            });

            console.log('[REFRESH] New tokens generated successfully');

            AuthController.sendSuccess(res, {
                token: newAccessToken, 
                refreshToken: newRefreshToken
            }, "Token refreshed successfully.");
            
        } catch (err){
            console.error("[REFRESH] Error refreshing token:", err);
            return AuthController.sendServerError(res, "Internal Server Error");
        }
    }

    static async verifyToken(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<{valid: boolean}>>): Promise<void>{
        try{
            const userId = req.user?.user_id;
            if(!userId){
                return AuthController.sendUnathorized(res, "Invalid token");
            }

            const user = await UserModel.findById(userId);
            if(!user) {
                return AuthController.sendNotFound(res, "User not found.");
            }

            return AuthController.sendSuccess(res, {valid: true}, "Token is valid");
        } catch(err){
            console.error("Error verifying token: ", err);
            return AuthController.sendServerError(res, "Internal Server Error");
        }
    }  
}

export default AuthController;