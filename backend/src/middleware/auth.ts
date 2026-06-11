// import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from "express";
import { ApiResponseWithMessage, AuthenticatedRequest, ROLE } from "../types";
import BaseController from "../controllers/BaseController";
import AuthService from "../services/auth.service";

export const authenticateToken = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try{
        const authHeader = req.headers['authorization'];
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return BaseController['sendUnathorized'](res, "Access token required!");
        }
        
        const token = authHeader.split(' ')[1];
        if(!token){
            return BaseController['sendUnathorized'](res, "Invalid token!");
        }

        const decoded = AuthService.verifyToken(token);
        if(!decoded){
            return BaseController['sendUnathorized'](res, "Invalid or expired token");
        }
        
        req.user = {
            user_id: decoded.user_id,
            email: decoded.email,
            role: decoded.role as ROLE
        }
        next();
    } catch (err) {
        console.error("Error authentication token,", err);
        return BaseController['sendServerError'](res, "Internal Server Error.");
    }
}

export const extractUserFromToken = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try{
        if(!req.user?.user_id){
            return BaseController['sendUnathorized'](res, "User information not found in token.");
        }
        req.body.user_id = req.user.user_id;
        next();
    } catch(err){
        console.error("Error extracting user from token.", err);
        return BaseController['sendServerError'](res, "Internal Server Error");
    }
}

export const requireRole = (requiredRole: ROLE) => {
    return (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction):void => {
        try{
            const currentRole = req.user?.role;
            if(!currentRole) {
                return BaseController['sendUnathorized'](res, "Authentication required");
            }

            if(currentRole !== requiredRole){
                return BaseController['sendUnathorized'](res, "Access denied! Insufficient permissions.");
            }
            
            next();
        } catch(err) {
            console.error("Error verifying required role", err);
            return BaseController['sendServerError'](res, "Internal Server Error.");
        }
    }
}

export const requireAdmin = requireRole(ROLE.ADMIN);

export const authorizeAdmin = requireAdmin;
export const authenticateUser = authenticateToken;

export const authorizeUser = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try{
        if(!req.user){
            return BaseController['sendUnathorized'](res, "Authentication required.");
        }

        if(req.user.role === ROLE.ADMIN || req.user.role === ROLE.USER){
            next();
            return;
        }
        return BaseController['sendUnathorized'](res, "Access denied! User role required.");
    } catch(err) {
        return BaseController['sendServerError'](res, "Internal Server Error");
    }
}

export const verifyResourceOwnership = (req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    try{
        const RequestedUserId = parseInt(req.params.id);
        const currentUserId = req.user?.user_id;

        if(!currentUserId){
            return BaseController['sendUnathorized'](res, "Access denied.");
        }
        
        if(req.user?.role === ROLE.ADMIN){
            next();
            return;
        }

        if(RequestedUserId !== currentUserId){
            return BaseController['sendUnathorized'](res, "Access denied.");
        }
        next();
    } catch(err) {
        console.error("Error verifying resource ownership.", err);
        return BaseController['sendServerError'](res, "Internal Server Error.");
    }
}