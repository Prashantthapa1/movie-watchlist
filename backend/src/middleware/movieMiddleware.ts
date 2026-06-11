import { NextFunction, Request, Response } from "express";
import { ApiResponseWithMessage } from "../types";
import { validateInputField } from "./validate";
import MovieService from "../services/movie.service";
import BaseController from "../controllers/BaseController";
import MovieModel from "../models/movieModel";

// Custom validation for form-data (file upload)
export const validateMovieFormData = (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    const { title, year, director, genre_id } = req.body;
    
    if (!title) return BaseController['sendValidationError'](res, "Title is required.");
    if (!year) return BaseController['sendValidationError'](res, "Year is required.");
    if (!director) return BaseController['sendValidationError'](res, "Director is required.");
    if (!genre_id) return BaseController['sendValidationError'](res, "Genre is required.");
    
    next();
};

export const validateMovieRequiredFields = validateInputField(['title', 'year', 'director', 'genre_id']);

export const validateMovieInput = async (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): Promise<void> => {
    const { year, rating, genre_id } = req.body;

    if(year) {
        const validatedYear = MovieService.validateMovieYear(year);
        if(!validatedYear.isValid){
            return BaseController['sendValidationError'](res, validatedYear.msg || "Invalid Year!");
        }
    }

    if(rating){
        const validatedRating = MovieService.validateRating(rating);
        if(!validatedRating.isValid){
            return BaseController['sendValidationError'](res, validatedRating.msg || "Invalid Rating!");
        }
    }

    if(genre_id){
        const validateGenre = await MovieService.validateGenre(genre_id);
        if(!validateGenre.isValid){
            return BaseController['sendValidationError'](res, validateGenre.msg || "Invalid genre selected.");
        }
    }
    next();
}

export const validateMovieId = (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    const validatedMovieId = BaseController['validateIDPram'](res, req.params.movie_id);
    if(!validatedMovieId){
        return;
    }
    next();
}

export const validateSearchParams = async (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): Promise<void> => {
    const { year, rating, title, genre_id, query } = req.query;

    if(year){
        const validatedYear = MovieService.validateMovieYear(parseInt(year as string));
        if(!validatedYear.isValid){
            return BaseController['sendValidationError'](res, validatedYear.msg || "Invalid year.");
        }
    }
    if(rating){
        const validatedRating = MovieService.validateRating(parseFloat(rating as string));
        if(!validatedRating.isValid){
            return BaseController['sendValidationError'](res, validatedRating.msg || "Invalid rating.");
        }
    }

    if(title){
        const titleStr = (title as string).trim();
        if(titleStr.length === 0){
            return BaseController['sendValidationError'](res, "Title cannot be empty.");
        }   
        req.query.title = titleStr;
    }
    
    if(query){
        const queryStr = (query as string).trim();
        if(queryStr.length === 0){
            return BaseController['sendValidationError'](res, "Search query cannot be empty.");
        }   
        req.query.query = queryStr;
    }
    
    if(genre_id){
        const genreIdNum = parseInt(genre_id as string);
        if(isNaN(genreIdNum) || genreIdNum < 1){
            return BaseController['sendValidationError'](res, "Invalid genre id.");
        }
        const validatedGenre = await MovieService.validateGenre(genreIdNum);
        if(!validatedGenre.isValid){
            return BaseController['sendValidationError'](res, validatedGenre.msg || "Invalid genre id.");
        }
    }
    next();
}

export const sanitizeMovieInput = (req: Request, _res: Response<ApiResponseWithMessage<never>>, next: NextFunction): void => {
    req.body = MovieService.sanitizeMovieData(req.body);
    next();
}

export const checkMovieDuplicate = async (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): Promise<void> => {
    const { title, year, director } = req.body;
    try{
        const existingMovie = await MovieService.checkDuplicateMovie(title, year, director);
        if(existingMovie.isDuplicate){
            return BaseController['sendConflict'](res, existingMovie.msg || "Movie already exists.");
        }        
    } catch(err){
        console.error("Error checking movie duplication.", err);
        return BaseController['sendServerError'](res, "Internal server error");
    }
    next();
}

export const validateMovieExists = async (req: Request, res: Response<ApiResponseWithMessage<never>>, next: NextFunction): Promise<void> => {
    try{
        const movieId = parseInt(req.params.movie_id);
       const movie = await MovieModel.getMovieById(movieId);
       if(!movie){
        return BaseController['sendNotFound'](res, "Movie not found.");
       }
    } catch(err){
        console.error("Error checking movie existence.", err);
        return BaseController['sendServerError'](res, "Internal server error");
    }
    next();
}