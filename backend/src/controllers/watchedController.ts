import { ApiResponseWithMessage, AuthenticatedRequest, Watched, WatchedMoviesResponse } from "../types";
import { Response } from "express";
import BaseController from "./BaseController";
import MovieModel from "../models/movieModel";
import WatchedModel from "../models/watchedModel";

class WatchedController extends BaseController{

    static async addMovieToWatched(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<Watched>>): Promise<void> {
        try{
            const { movie_id } = req.body;
            const user_id = req.user?.user_id; // Get user_id from authenticated token

            if (!user_id) {
                return BaseController.sendUnathorized(res, "User authentication required.");
            }

            const validatedMovieId = BaseController.validateIDPram(res, movie_id);
            if(!validatedMovieId) return;

            const movieExists = await MovieModel.getMovieById(validatedMovieId);
            if(!movieExists){
                return BaseController.sendNotFound(res, "Movie with the requested ID not found.");
            }

            const watchedMovie = await WatchedModel.addToWatched({ user_id: user_id, movie_id: validatedMovieId});
            if(!watchedMovie){
                return BaseController.sendServerError(res, "Failed to add movie to watched list.");
            }

            return BaseController.sendSuccess(res, watchedMovie, "Movie added to watched list.");
        } catch (err) {
            if (err instanceof Error && err.message.includes('already in watched')) {
                return BaseController.sendConflict(res, err.message);
            }
            console.error("Error adding movie to watched.", err);
            return BaseController.sendServerError(res, "Internal server error.");
        }
    }

    static async getUsersWatchedMovies(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<WatchedMoviesResponse>>): Promise<void> {
        try{ 
            const userId= req.user?.user_id;

            if(!userId){
                return BaseController.sendUnathorized(res, "User authentication required.");
            }

            const userMovies = await WatchedModel.getUsersWatchedMovies(userId);

            if(!userMovies || userMovies.length === 0){
                const emptyMovieResponse: WatchedMoviesResponse = {
                    movies: [],
                    count: 0
                }
                return BaseController.sendSuccess(res, emptyMovieResponse, "No watched movies found.");
            }

            const watchedMoviesResponse: WatchedMoviesResponse = {
                movies: userMovies,
                count:userMovies.length
            }
            return BaseController.sendSuccess(res, watchedMoviesResponse, "Movie fetched successfully.");

        } catch (err){
            console.error("Error fetching user watched movie list.", err);
            return BaseController.sendServerError(res, "Internal server error.");
        }
    }

    static async removeFromWatched(req: AuthenticatedRequest, res: Response<ApiResponseWithMessage<{removed: boolean}>>): Promise<void> {
        try{
            const { movie_id } = req.body;
            const user_id = req.user?.user_id;

            if(!user_id){
                return BaseController.sendUnathorized(res, "User Authentication required.");
            }

            const validateMovieId = BaseController.validateIDPram(res, movie_id);
            if(!validateMovieId) return;

            const removed = await WatchedModel.removeMovieFromWatched(user_id, validateMovieId);
            if(!removed){
                return BaseController.sendNotFound(res, "Movie not found in watched list.")
            }

            return BaseController.sendSuccess(res, { removed: true }, "Movie removed from watched.");
        } catch (err) {
            console.error("Error removing from watched:", err);
            return BaseController.sendServerError(res, "Failed to remove from watched.");
        }
    } 

}

export default WatchedController;