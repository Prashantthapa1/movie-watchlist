import { AuthResult, ROLE } from '../types';
import { User } from '../types';
import * as bcrypt from 'bcrypt';
import * as jwt  from 'jsonwebtoken';
import { JWTPayload } from '../types';
import UserModel from '../models/userModel';

class AuthService {

    private static readonly SALT_ROUNDS = 12;
    private static JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
    private static JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    static generateToken(payLoad: JWTPayload): string {
        return jwt.sign(payLoad, this.JWT_SECRET, {
            expiresIn: '3d' 
        });
    }

    static generateRefreshToken(payLoad: JWTPayload): string {
        return jwt.sign(payLoad, this.JWT_REFRESH_SECRET, {
            expiresIn: '7d' 
        });
    }

    static verifyToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    static verifyRefreshToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.JWT_REFRESH_SECRET) as JWTPayload;
        } catch (error) {
            console.error('Refresh token verification failed:', error);
            return null;
        }
    }

    static validateEmail(email: string): { isValid: boolean; message?: string}{
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if(!emailRegex.test(email)){
            return {
                isValid: false,
                message: "Invalid email format"
            }
        }
        return { isValid: true };
    }

    static validatePasswordStrength(password: string): { isValid: boolean; message?: string}{

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if(password.length < 6 ) {
            return {
                isValid: false,
                message: "Password must be 6 characters long."
            }
        }

        if(!passwordRegex.test(password)){
            return {
                isValid: false,
                message: "Password must contain atleast one lowercase, one uppercase and a number"
            }
        }
        return {isValid: true};
    }

    static async checkUserExists (name: string, email: string): Promise<{ userExists: boolean, message?: string}>{
        try{
            const userByEmail = await UserModel.findByEmail(email);
            if(userByEmail){
                return {
                    userExists: true,
                    message: "User with this email already exists."
                }
            }

            const userByName = await UserModel.findByUsernameOrEmail(name);
            if(userByName){
                return {
                    userExists: true,
                    message: "User with this name already exists."
                }
            }

            return { userExists: false };
        } catch (err) {
            console.error("Unable to check user");
            return {
                userExists: false,
                message: "Error checking user existence."
            };
        }
    }

    static createAuthResponse(user: User): AuthResult{
        const cleanUser = this.cleanUser(user);
        if(!user.user_id || !user.role){
            return { 
                success: false,
                message: "User ID and role are required for authentication."
            }
        }

        const token = this.generateToken({
            user_id: user.user_id,
            email: user.email,
            role: user.role as ROLE
        });

        const refreshToken = this.generateRefreshToken({
            user_id: user.user_id,
            email: user.email,
            role: user.role as ROLE
        });

        return {
            success: true,
            message: "Authentication successful",
            data: {
                user: cleanUser,
                token,
                refreshToken
            }
        }
    }

    static cleanUser(user: User): Omit<User, 'password'>{
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default AuthService;