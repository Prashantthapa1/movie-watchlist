import api from "./api";

class WatchedService{

    static async addToWatchedList(WatchedMovieData){
        try{
            const response = await api.post('/watched', WatchedMovieData);
            return response.data;
        } catch (err){
            console.error("Error adding movie to favorite.");
            throw this.handleError(err);
        }
    }

    static async getUserWatchedMovies(){
        try{
            const response = await api.get('/watched');
            return response.data;
        } catch (err){
            console.error("Error fetching user's watched movies", err);
            throw this.handleError(err);
        }
    }

    static async removeFromWatched(movieId) {
        try {
            const response = await api.delete('/watched', {
                data: { movie_id: movieId }  // Send in request body for DELETE
            });
            return response.data;
        } catch (err) {
            console.error("Error removing from watched", err);
            throw this.handleError(err);
        }
    }

    static handleError(err){
        if(err.response){
            return {
                message: err.response.data?.message || "An error occurred",
                status: err.response.status,
                data: err.response.data
            };
        } else if(err.request){
            return {
                message: "Network error - please check your internet connection",
                status: 0
            };
        } else{
            return {
                message: err.message || "An unexpected error occurred",
                status: -1
            };
        }
    }
}

export default WatchedService;