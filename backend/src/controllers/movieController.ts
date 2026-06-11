// createMovie() - Handle movie creation with validation
// updateMovie() - Handle movie updates with validation
// deleteMovie() - Handle movie deletion (maybe check if used in favorites/watched)
// searchMovies() - Search by title, genre, year, etc.
// getMoviesByGenre() - Filter movies by genre
// getMoviesByYear() - Filter movies by year range

import { Request, Response } from "express";
import MovieModel from "../models/movieModel";
import MovieService from "../services/movie.service";
import { AuthenticatedRequest, ApiResponseWithMessage, CreateMovieRequest, Movie, MovieSearchParams, MoviesListResponse, UpdateMovieRequest } from "../types";
import BaseController from "./BaseController";

class MovieController extends BaseController{

    static async createMovie(req: Request<{}, ApiResponseWithMessage<Movie>, CreateMovieRequest>, res: Response<ApiResponseWithMessage<Movie>>): Promise<void>{
        try{
            const { title, year, rating, description, genre_id, director } = req.body;

            // Handle uploaded poster image
            let poster_url: string | null = null;
            if (req.file) {
                // Generate URL for the uploaded file
                poster_url = `/uploads/movies/${req.file.filename}`;
                console.log('Poster uploaded, setting poster_url to:', poster_url);
            } else {
                console.log('No file uploaded, poster_url remains null');
            }

            if(!title) return BaseController.sendValidationError(res, "Title is required.");
            if(!year) return BaseController.sendValidationError(res, "Year is required.");
            if(!genre_id) return BaseController.sendValidationError(res, "Genre is required.");
            if(!director) return BaseController.sendValidationError(res, "Director is required.");

            const yearNum = typeof year === 'string' ? parseInt(year) : year;
            const ratingNum = rating !== undefined && typeof rating === 'string' ? parseFloat(rating): rating;

            const validatedYear = MovieService.validateMovieYear(yearNum);
            if(!validatedYear.isValid){
                return BaseController.sendValidationError(res, validatedYear.msg || "Invalid year.");
            }

            // ✅ Only validate rating if it exists and is not null
            if(ratingNum !== undefined && ratingNum !== null){
                const validatedRating = MovieService.validateRating(ratingNum);
                if(!validatedRating.isValid){
                    return BaseController.sendValidationError(res, validatedRating.msg || "Invalid Rating.");
                }
            }

            const validatedGenre = await MovieService.validateGenre(genre_id);
            if(!validatedGenre.isValid){
                return BaseController.sendValidationError(res, validatedGenre.msg || "Invalid Genre.");
            }

            // ✅ Use yearNum instead of year
            const existingMovie = await MovieService.checkDuplicateMovie(title, yearNum, director);
            if(existingMovie.isDuplicate){
                return BaseController.sendConflict(res, existingMovie.msg || "Movie with the same title, year and director already exists.");
            }

            // ✅ Use converted numbers and ensure no undefined values
            const movieData: CreateMovieRequest = { 
                title, 
                year: yearNum, 
                rating: ratingNum ?? null,           // Convert undefined to null
                poster_url: poster_url,              // Use uploaded file URL or null
                description: description ?? null,   // Convert undefined to null
                genre_id, 
                director 
            };

            const sanitizedData = MovieService.sanitizeMovieData(movieData);

            const newMovie = await MovieModel.createMovie(sanitizedData);
            if(!newMovie){
                return BaseController.sendServerError(res, "Error creating movie.");
            }

            BaseController.sendSuccess(res, newMovie, "Movie created successfully.");
        } catch(err) {
            BaseController.sendServerError(res, "Internal Server Error");
        }
    }

    static async getAllMovies(
        req: Request<{}, ApiResponseWithMessage<MoviesListResponse>, {}, {limit?: string, offset?: string}>,
        res: Response<ApiResponseWithMessage<MoviesListResponse>>
    ): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;

            // Validate pagination parameters
            if (limit < 1 || limit > 100) {
                return BaseController.sendValidationError(res, "Limit must be between 1 and 100.");
            }

            if (offset < 0) {
                return BaseController.sendValidationError(res, "Offset must be 0 or greater.");
            }

            // Get all movies from database
            const allMovies = await MovieModel.getAllMovies();
            
            if (!allMovies || allMovies.length === 0) {
                return BaseController.sendNotFound(res, "No movies found.");
            }

            // Calculate pagination
            const total = allMovies.length;
            const totalPages = Math.ceil(total / limit);
            const currentPage = Math.floor(offset / limit) + 1;

            // Apply pagination
            const paginatedMovies = allMovies.slice(offset, offset + limit);

            const response: MoviesListResponse = {
                movies: paginatedMovies,
                total,
                page: currentPage,
                totalPages,
                limit
            };

            BaseController.sendSuccess(res, response, "Movies retrieved successfully.");

        } catch (err) {
            console.error("Error getting all movies:", err);
            BaseController.sendServerError(res, "Internal Server Error");
        }
    }

    static async getMoviesByGenre(
        req: Request<{genre_id: string}, ApiResponseWithMessage<MoviesListResponse>, {}, {limit?: string, offset?: string }>,
        res: Response<ApiResponseWithMessage<MoviesListResponse>>
    ): Promise<void> {
        try{
            const genreId = parseInt(req.params.genre_id);
            
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;

            if(isNaN(genreId) || genreId < 1) {
                return BaseController.sendValidationError(res, "Invalid genre ID");
            }

            const validatedGenre = await MovieService.validateGenre(genreId);
            if(!validatedGenre.isValid){
                return BaseController.sendValidationError(res, validatedGenre.msg || "Invalid genre.");
            }

            const allMovies = await MovieModel.findMovieByGenreId(genreId);

            if(!allMovies || allMovies.length === 0){
                return BaseController.sendNotFound(res, "No movies found for this genre.");
            }

            const total = allMovies.length;
            const currentPage = Math.floor(offset / limit) + 1;
            const totalPages = Math.ceil(total / limit);

            const paginatedMovies = allMovies.slice(offset, offset + limit);

            // ✅ Match your MoviesListResponse interface
            const response: MoviesListResponse = {
                movies: paginatedMovies,
                total,
                page: currentPage,
                totalPages,
                limit
            };

            BaseController.sendSuccess(res, response, "Movies retrieved successfully.");
        } catch (err) {
            console.error("Failed to fetch movies", err);
            BaseController.sendServerError(res, "Internal server error.");
        }
    }

    static async getMoviesByYear(
        req: Request<{year: string}, ApiResponseWithMessage<MoviesListResponse>, {}, {limit?: string, offset?: string}>,
        res: Response<ApiResponseWithMessage<MoviesListResponse>>
    ): Promise<void> {
        try{
            const yearNum = parseInt(req.params.year);

            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;

            if(isNaN(yearNum)){
                return BaseController.sendValidationError(res, "Invalid year.");
            }

            const validatedYear = MovieService.validateMovieYear(yearNum);
            if(!validatedYear.isValid){
                return BaseController.sendValidationError(res, validatedYear.msg || "Invalid year.");
            }

            const allMovies = await MovieModel.findMovieByYear(yearNum);
            if(!allMovies || allMovies.length === 0){
                return BaseController.sendNotFound(res, "Movies with the given year are not available.");
            }

            const total = allMovies.length;
            const currentPage = Math.floor(offset / limit) + 1;
            const totalPages = Math.ceil(total / limit);
            const paginatedMovies = allMovies.slice(offset, offset + limit);

            // ✅ Match your MoviesListResponse interface
            const response: MoviesListResponse = {
                movies: paginatedMovies,
                total,
                page: currentPage,
                totalPages,
                limit
            };

            BaseController.sendSuccess(res, response, "Movies retrieved successfully.");
        } catch (err){
            console.error("Error finding movies", err);
            BaseController.sendServerError(res, "Internal Server Error");
        }
    }

    static async deleteMovie(req: Request<{movie_id: string}>, res: Response<ApiResponseWithMessage<never>>): Promise<void> {
        try{
             const id = BaseController.validateIDPram(res, req.params.movie_id);

             if(!id){
                return BaseController.sendValidationError(res, "Invalid movie id.");
             }

             const existingMovie = await MovieModel.getMovieById(id);
             if(!existingMovie){
                return BaseController.sendNotFound(res, "Movie with this Id doesn't exist.");
             }

             const deleteMovie = await MovieModel.deleteMovie(id);
             if(!deleteMovie){
                return BaseController.sendServerError(res, "Unable to delete movie");
             }

             BaseController.sendSuccessMsg(res, "Movie deleted successfully.");

        } catch(err){
            console.error("Failed to delete movie.", err);
            return BaseController.sendServerError(res, "Internal Server Error!");
        }
    }

    static async updateMovie(req: Request<{movie_id: string}, ApiResponseWithMessage<Movie>, UpdateMovieRequest>, res: Response<ApiResponseWithMessage<Movie>>): Promise<void> {
        try{
            const { title, year, rating, poster_url, genre_id, director, description } = req.body;

            const id = BaseController.validateIDPram(res, req.params.movie_id);
            if(!id){
                return BaseController.sendValidationError(res, "Invalid movie ID.");
            }

            const existingMovie = await MovieModel.getMovieById(id);
            if(!existingMovie){
                return BaseController.sendNotFound(res, "Movie doesn't exist.");
            }

            if(!title && !year && !director && !rating && !poster_url && !description && !genre_id){
                return BaseController.sendValidationError(res, "At least one field is required");
            }
            
            // if(!title) return BaseController.sendValidationError(res, "Title is required.");
            // if(!year) return BaseController.sendValidationError(res, "Year is required.");
            // if(!genre_id) return BaseController.sendValidationError(res, "Genre is required.");
            // if(!director) return BaseController.sendValidationError(res, "Director is required.");

            let yearNum: number | undefined;
            let ratingNum : number | null | undefined;

            if(year !== undefined){
                yearNum = typeof year === 'string' ? parseInt(year) : year;
                const validatedYear = MovieService.validateMovieYear(yearNum);
                if(!validatedYear.isValid){
                    return BaseController.sendValidationError(res, validatedYear.msg || "Invalid year.");
                }
            }

            if(rating !== undefined){
                ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;
                
                if(ratingNum !== null){
                    const validateRating = MovieService.validateRating(ratingNum);
                    if(!validateRating.isValid){
                        return BaseController.sendValidationError(res, "Invalid rating.");
                    }
                }
            }

            if(genre_id !== undefined){
                const validatedGenre = await MovieService.validateGenre(genre_id);
                if(!validatedGenre.isValid){
                    return BaseController.sendValidationError(res, validatedGenre.msg || "Invalid genre ID.");
                }
            }

            if(title || year || director){
                const checkTitle = title || existingMovie.title;
                const checkYear = yearNum || existingMovie.year;
                const checkDirector = director || existingMovie.director;

                const duplicateCheck = await MovieService.checkDuplicateForUpdate(id, checkTitle, checkYear, checkDirector);
                if(duplicateCheck.isDuplicate){
                    return BaseController.sendConflict(res, duplicateCheck.msg || "Movie with the same details already exists.");
                }
            }

            const updateData : Partial<UpdateMovieRequest> = {};

            if(title !== undefined) updateData.title = title;
            if(yearNum !== undefined) updateData.year = yearNum;
            if(rating !== undefined) updateData.rating = ratingNum ?? null;
            if(poster_url !== undefined) updateData.poster_url = poster_url;
            if(description !== undefined) updateData.description = description;
            if(genre_id !== undefined) updateData.genre_id = genre_id;
            if(director !== undefined) updateData.director = director;

            const sanitizedUpdateData = MovieService.sanitizeMovieData(updateData);

            const updateSuccess = await MovieModel.updateMovie(id, sanitizedUpdateData);
            if(!updateSuccess){
                return BaseController.sendServerError(res, "Failed to update Movie");
            }

            const updatedMovie = await MovieModel.getMovieById(id);
            if(updatedMovie){
                return BaseController.sendSuccess(res, updatedMovie, "Movie updated successfully.");
            } else {
                return BaseController.sendSuccessMsg(res, "Movie updated successfully.");
            }
        } catch (err){
            console.error("Unable to update movie", err);
            return BaseController.sendServerError(res, "Failed to update movie");
        }
    }

    static async searchMovies(
        req: Request<{}, ApiResponseWithMessage<MoviesListResponse>, {}, MovieSearchParams>,
        res: Response<ApiResponseWithMessage<MoviesListResponse>>
    ): Promise<void> {
        try{
            const searchParams: MovieSearchParams = req.query;
            const limit = Number(searchParams.limit) || 10;
            const offset = Number(searchParams.offset) || 0;

            if(searchParams.year) {
                const yearNum = parseInt(searchParams.year.toString());
                if(isNaN(yearNum)){
                    return BaseController.sendValidationError(res, "Invalid year format.");
                }

                const validatedYear = MovieService.validateMovieYear(yearNum);
                if(!validatedYear.isValid){
                    return BaseController.sendValidationError(res, validatedYear.msg || "Invalid year.");
                }
            }

            if(searchParams.genre_id){
                const genreId = parseInt(searchParams.genre_id.toString());
                if(isNaN(genreId)){
                    return BaseController.sendValidationError(res, "Invalid genre.");
                }

                const validateGenre = await MovieService.validateGenre(genreId);
                if(!validateGenre.isValid){
                    return BaseController.sendValidationError(res, validateGenre.msg || "Invalid genre Id.");
                }
            }

           if (searchParams.rating) {
            const ratingNum = parseFloat(searchParams.rating.toString());
            if (isNaN(ratingNum)) {
                return BaseController.sendValidationError(res, "Invalid rating format.");
            }
            
            const validatedRating = MovieService.validateRating(ratingNum);
            if (!validatedRating.isValid) {
                return BaseController.sendValidationError(res, validatedRating.msg || "Invalid rating.");
            }
        }

        const movies = await MovieService.searchMovies(searchParams);
        if(!movies){
            return BaseController.sendServerError(res, "Error searching movies.");
        }

        if(movies.length === 0){
            return BaseController.sendNotFound(res, "No movies found matching your criteria.");
        }

        const total = movies.length;
        const paginatedMovies = movies.slice(offset, offset + limit);
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        const response: MoviesListResponse = {
            movies: paginatedMovies,
            total,
            page: currentPage,
            totalPages,
            limit
        }

        BaseController.sendSuccess(res, response, "Movies found successfully.");
        } catch (err){
            console.error("Error in searchMovies:", err);
            BaseController.sendServerError(res, "Internal Server Error");
        }
    }

    static async posterUpload(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<{imageUrl: string; filename: string}>>): Promise<void>{
            
            const responseData = {
                imageUrl: `/uploads/movies/${req.file!.filename}`,
                filename: req.file!.filename
            };
            
            // ✅ Use BaseController for consistency
            return BaseController['sendSuccess'](res, responseData, 'Image uploaded successfully');
    }

}

export default MovieController;