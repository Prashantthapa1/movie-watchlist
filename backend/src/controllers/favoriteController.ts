import { Response } from "express";
import { ApiResponseWithMessage, Favorite, AuthenticatedRequest, FavoriteMovieResponse } from "../types";
import BaseController from "./BaseController";
import FavoritesModel from "../models/favoriteModel";
import MovieModel from "../models/movieModel";

class FavoriteController extends BaseController{

    static async addMovieToFavorites(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<Favorite>>):Promise<void> {
        try{
            const { movie_id } = req.body;
            const user_id = req.user?.user_id; // Get user_id from authenticated token

            if (!user_id) {
                return BaseController.sendUnathorized(res, "User authentication required.");
            }

            const validatedMovieId = BaseController.validateIDPram(res, movie_id);
            if(!validatedMovieId) return;

            // Check if movie exists in movies table
            const movieExists = await MovieModel.getMovieById(validatedMovieId);
            if (!movieExists) {
                return BaseController.sendNotFound(res, "Movie not found");
            }

            const favoriteMovie = await FavoritesModel.addToFavorites({ user_id: user_id, movie_id: validatedMovieId });

            if(!favoriteMovie){
                return BaseController.sendServerError(res, "Failed to add movie to favorites.");
            }

            return BaseController.sendSuccess(res, favoriteMovie, "Movie added to favorites successfully.");
        } catch (err){
            if (err instanceof Error && err.message.includes('already in favorites')) {
                return BaseController.sendConflict(res, err.message);
            }
            console.error("Error in addMovieToFavorites controller:", err);
            return BaseController.sendServerError(res, "Internal server error");
        }
    }

    static async getUserFavoritesMovies(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<FavoriteMovieResponse>>): Promise<void> {
        try{
            const userId= req.user?.user_id;

            if(!userId){
                return BaseController.sendUnathorized(res, "User authentication required.");
            }

            const userMovies = await FavoritesModel.getUserFavorites(userId);
            
            if(!userMovies || userMovies.length === 0){
                const emptyMovieResponse: FavoriteMovieResponse ={
                    movies: [],
                    count: 0
                }
                return BaseController.sendSuccess(res, emptyMovieResponse, "No favorite movies found");
            }

            const favoriteMovieResponse: FavoriteMovieResponse = {
                movies: userMovies,
                count: userMovies.length
            }

            return BaseController.sendSuccess(res, favoriteMovieResponse, "User favorite movies fetched successfully.");
        } catch(err){
            console.error("Failed to fetch favorites movies.", err);
            return BaseController.sendServerError(res, "Failed to fetch favorites movies.");
        }
    }

    static async removeFromFavorites(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<{removed: boolean}>>): Promise<void>{
        try{
            const { movie_id } = req.body;
            const user_id = req.user?.user_id;

            if(!user_id){
                return BaseController.sendUnathorized(res, "User authentication required.");
            }

            const validateMovieId = BaseController.validateIDPram(res, movie_id);
            if(!validateMovieId) return;

            const removed = await FavoritesModel.deleteFromFavorites(user_id, validateMovieId);
            if(!removed){
                return BaseController.sendNotFound(res, "Movie not found in favorites.");
            }

            return BaseController.sendSuccess(res, { removed: true }, "Movie removed from favorites.");
        } catch (err) {
            console.error("Error removing from favorites:", err);
            return BaseController.sendServerError(res, "Failed to remove from favorites.");
        }
    }

} 

export default FavoriteController;