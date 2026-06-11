import { Request, Response } from "express";
import BaseController from "./BaseController";
import { ApiResponseWithMessage, AuthenticatedRequest, UpdateUserRequest, User } from "../types";
import UserModel from "../models/userModel";
import AuthService from "../services/auth.service";


class UserController extends BaseController{

    static async getAllUsers(_req: Request, res: Response<ApiResponseWithMessage<{users: User[]; count: number}>>): Promise<void> {
        try{
            const users = await UserModel.findAll();
            return this.sendSuccess(res, { users, count: users.length}, 'Users retrieved successfully');
        } catch(err){
            console.error("Error fetching users.", err);
            return this.sendServerError(res, "Internal Server Error");
        }
    }

    static async getUserById(req: Request<{ id: string}>, res: Response<ApiResponseWithMessage<Omit<User, 'password'>>>): Promise<void>{
        try{
            const userId = this.validateIDPram(res, req.params.id, 'User ID');
            if(!userId){
                return this.sendError(res, "Invalid user Id");
            }
            const user = await UserModel.findById(userId);
            if(!user) {
                return this.sendNotFound(res, "User not found.");
            }
            const userWithoutPassword = AuthService.cleanUser(user);
            return this.sendSuccess(res, userWithoutPassword, "User retrieved successfully.");
        } catch(err) {
            console.error("Error fetching user.", err);
            return this.sendServerError(res, "Internal Server Error");
        }
    }

    static async deleteUser(req: Request<{ id: string}>, res: Response<ApiResponseWithMessage<never>>): Promise<void>{
        try{
            const userId = this.validateIDPram(res, req.params.id, 'User ID');
            if(!userId){
                return this.sendValidationError(res, "Invalid user ID");
            }
            const existingUser = await UserModel.findById(userId);
            if(!existingUser) return this.sendNotFound(res, "User not found.");

            const deleteSuccess = await UserModel.deleteUser(userId);
            if(!deleteSuccess) return this.sendError(res, "Failed to delete user.");

            return this.sendSuccessMsg(res, "User deleted successfully.");
        } catch(err){
            console.error("Error deleting user.", err);
            return this.sendServerError(res, "Internal Server Error");
        }
    }

    static async updateUser(req: Request<{ id: string}, {}, UpdateUserRequest>, res: Response<ApiResponseWithMessage<Omit<User, 'password'>>>): Promise<void> {
        try{ 
            const userId = this.validateIDPram(res, req.params.id, "User ID");
            if(userId === null) return;

            const { name, email, password, role } = req.body;
            if(!name && !email && !password && !role) {
                return this.sendValidationError(res, "At least one field is required for update.");
            }

            const existingUser = await UserModel.findById(userId);
            if(!existingUser) return this.sendNotFound(res, "User not found.");

            const updateData: any = {};
            
            if(email) {
                const emailValidation = AuthService.validateEmail(email);
                if(!emailValidation.isValid) {
                    return this.sendValidationError(res, emailValidation.message || "Invalid email format");
                }

                const checkUserByEmail = await UserModel.findByEmail(email);
                if(checkUserByEmail && checkUserByEmail.user_id !== existingUser.user_id){
                    return this.sendConflict(res, "User with this email already exists.");
                }
                updateData.email = email;
            }

            if(name) {
                const checkUserByName = await UserModel.findByUsernameOrEmail(name);
                if(checkUserByName && checkUserByName.user_id !== existingUser.user_id){
                    return this.sendConflict(res, "User with this username already exists.");
                }
                updateData.name = name;
            }

            if(password) {
                const validatePassword = AuthService.validatePasswordStrength(password);
                if(!validatePassword.isValid){
                    return this.sendValidationError(res, validatePassword.message || "Invalid password format.");
                }
                const hashPassword = await AuthService.hashPassword(password);
                updateData.password = hashPassword;
            }

            if(role) updateData.role = role;

            const updateSuccess = await UserModel.update(userId, updateData);
            if(!updateSuccess) return this.sendServerError(res, "Failed to update user.");

            const updatedUser = await UserModel.findById(userId);
            if(updatedUser){
                const userResponse = AuthService.cleanUser(updatedUser);
                return this.sendSuccess(res, userResponse, "User updated successfully.");
            } else {
                return this.sendSuccessMsg(res, "User updated successfully");
            }
        } catch(err) {
            console.error("Failed to update user.", err);
            return this.sendServerError(res, "Error updating user.");
        }
    }

    static async updateCurrentUser(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<Omit<User, 'password'>>>): Promise<void> {
        try{
            const userID = req.user?.user_id;
            if(!userID) return this.sendUnathorized(res);

            const { name, email, password, role } = req.body;
            if(!name && !email && !password && !role) return this.sendValidationError(res, "At least one field is required.");

            const existingUser = await UserModel.findById(userID);
            if(!existingUser) return this.sendNotFound(res, "User not found.");

            const updateData: any = {};

            if(email){
                const emailValidation = AuthService.validateEmail(email);
                if(!emailValidation.isValid) return this.sendValidationError(res, emailValidation.message || "Invalid email format.");

                const userByEmail = await UserModel.findByEmail(email);
                if(userByEmail && userByEmail.user_id !== existingUser.user_id){
                    return this.sendConflict(res, "Email already exists.");
                }
                updateData.email = email;
            }

            if(name){
                const userByName = await UserModel.findByUsernameOrEmail(name);
                if(userByName && userByName.user_id !== existingUser.user_id){
                    return this.sendConflict(res, "User name already taken.");
                }
                updateData.name = name;
            }

            if(password){
                const validatePassword = AuthService.validatePasswordStrength(password);
                if(!validatePassword.isValid){
                    return this.sendValidationError(res, validatePassword.message || "Invalid password format.");
                }

                const hashPassword = await AuthService.hashPassword(password);
                updateData.password = hashPassword;
            }

            if(role) updateData.role = role;

            const updateSuccess = await UserModel.update(userID, updateData);
            if(!updateSuccess) return this.sendServerError(res, "Error updating profile");

            const updatedUser = await UserModel.findById(userID);
            if(updatedUser){
                const userResponse = AuthService.cleanUser(updatedUser);
                return this.sendSuccess(res, userResponse, "Profile updated successfully.");
            } else {
                return this.sendSuccessMsg(res, "Profile updated successfully.");
            }
        } catch(err){
            console.error("Error updating profile", err);
            return this.sendServerError(res, "Internal Server Error");
        }
    }

}

export default UserController;
 