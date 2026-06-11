import { ApiResponseWithMessage } from "../types";
import { Response } from "express";


class BaseController{

    protected static sendSuccess<T> (
        res: Response<ApiResponseWithMessage<T>>,
        data: T,
        message: string,
        statusCode: number = 200
    ): void {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    protected static sendSuccessMsg(
        res: Response<ApiResponseWithMessage<never>>,
        message: string,
        statusCode: number = 200
    ) : void{
        res.status(statusCode).json({ 
            success: true,
            message });
    }

    protected static sendError (
        res: Response<ApiResponseWithMessage<never>>,
        message: string = "Internal Server Error",
        statusCode: number = 500
    ) : void{
        res.status(statusCode).json({
            success: false,
            message,
        });
    }

    protected static sendValidationError(
        res: Response<ApiResponseWithMessage<never>>,
        message: string,      
    ): void {
        this.sendError(res, message, 400);
    }

    protected static sendConflict(
        res: Response<ApiResponseWithMessage<never>>,
        message: string,   
    ): void{
        this.sendError(res, message, 409);
    }

    protected static sendUnathorized(
        res: Response<ApiResponseWithMessage<never>>,
        message: string = "Unathorized!",   
    ): void{
        this.sendError(res, message, 401);
    }

    protected static sendNotFound(
        res: Response<ApiResponseWithMessage<never>>,
        message: string,   
    ): void{
        this.sendError(res, message, 404);
    }

    protected static sendServerError(
        res: Response<ApiResponseWithMessage<never>>,
        message: string = "Internal Server Error",   
    ): void{
        this.sendError(res, message, 500);
    }

    protected static validateIDPram(
        res: Response<ApiResponseWithMessage<never>>,
        idParam: string,
        paramName: string = 'ID'
    ): number | null {
        const id = parseInt(idParam);
        if(isNaN(id) || id < 1){
            this.sendValidationError(res, `Invalid ${paramName}`);
            return null;
        }
        return id;
    }
}

export default BaseController;