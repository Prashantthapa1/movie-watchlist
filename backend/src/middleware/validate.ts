import { Request, Response, NextFunction } from "express"
import BaseController from "../controllers/BaseController";
import { ApiResponseWithMessage, AuthenticatedRequest, UpdateUserRequest } from "../types";
import AuthService from "../services/auth.service";

export const validateEmail = (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    const { email } = req.body;

    if(!email){
        return BaseController['sendValidationError'](res, "Email is required.");
    }
    const emailValidation = AuthService.validateEmail(email);
    if(!emailValidation.isValid) return BaseController['sendValidationError'](res, emailValidation.message || "Invalid email format.");
    next();    
}

export const validatePassword = (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    const { password } = req.body;
    if(!password) return BaseController['sendValidationError'] (res, "Password is required.");

    const passwordValidation = AuthService.validatePasswordStrength(password);
    if(!passwordValidation.isValid){
        return BaseController['sendValidationError'](res, passwordValidation.message || "Invalid password format.");
    }
    next();
}

export const validateInputField = ( fields: string[]) => {
    return (req: Request, res:Response<ApiResponseWithMessage<never>>, next: NextFunction) => {
        const missingField = fields.filter(field => !req.body[field]);
        if(missingField.length > 0) {
            return BaseController['sendValidationError'](res, `Missing Fields: ${missingField.join(', ')}.`);
        }
        next();
    }
}

export const checkUserExists = async (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction) => {
    const { name, email } = req.body;
    if(!name || !email) return BaseController['sendValidationError'](res, "Name and email are required.");
    const userValidation = await AuthService.checkUserExists(name, email);
    if(userValidation.userExists){
        return BaseController['sendConflict'](res, userValidation.message || "User with this email or username already exists.");
    }
    next();
}

export const validateRegister = [
    validateInputField(['name', 'email', 'password']),
    validateEmail,
    validatePassword,
    checkUserExists
];

export const validateLogin = [
    validateInputField(['username', 'password']),
];

export const validateIdParam = ( paramName: string = 'ID') => {
    return (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
        const idValidation = BaseController['validateIDPram'](res, req.params.id, paramName);
        if(!idValidation){
            return BaseController['sendUnathorized'](res, "Invalid ID");
        }
        next();
    }
}

export const validateUserUpdate = (req: Request<{}, {}, UpdateUserRequest>, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    const { name, email, password, role } = req.body;
    if(!name && !email && !password && !role) {
        return BaseController['sendValidationError'](res, "At least one field is required for update.");
    }
    next();
}

export const validateUserIdParam = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try{
        const { userId } = req.params;

        if(!userId || isNaN(Number(userId))){
            return BaseController['sendValidationError'](res, "Valid user ID is required.");
        }
        next();
    } catch(err){
        console.error("Error validating userID param.", err);
        return BaseController['sendServerError'](res, "Internal Serever Error.");
    }
}

export const validateMovieIdInBody = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try {
        const { movie_id } = req.body;

        if (!movie_id || isNaN(Number(movie_id))) {
            return BaseController['sendValidationError'](res, "Valid movie_id is required");
        }

        next();
    } catch (err) {
        console.error("Error validating movie_id:", err);
        return BaseController['sendServerError'](res, "Internal Server Error");
    }
};

export const authHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch((error: Error) => {
            console.error("Error in auth handling.", error);
            if(process.env.NODE_ENV === 'development'){
                // Provide more explicit message during development to aid debugging
                return BaseController['sendServerError'](res, error.message || "Internal Server Error");
            }
            return BaseController['sendServerError'](res, "Internal Server Error");
        });
    }
}