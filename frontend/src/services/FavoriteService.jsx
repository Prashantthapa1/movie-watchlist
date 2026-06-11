import api from "./api";

class FavoriteService{
    static async addMovieToFavorites(movieData){
        try{
            const response = await api.post('/favorites', movieData);
            return response.data;
        } catch (err){
            console.error("Error adding movie to favorites", err);
            throw this.handleError(err);
        }
    }

    static async getUserFavoritesMovies() {
        try{
            const response = await api.get('/favorites');
            return response.data;
        } catch (err){
            console.error("Error fetching favorite movies", err);
            throw this.handleError(err);
        }
    }

    static async removeFromFavorites(movieId) {
        try{
            const response = await api.delete('/favorites', {
                data: { movie_id: movieId }
            });
            return response.data;
        } catch(err) {
            console.error("Error removing from favorites", err);
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
                message: "Network error - Please check your internet connection",
                status: 0
            };
        } else {
            return{
                message: err.message || "An unexpected error occurred.",
                status: -1
            };
        }
    }
}

export default FavoriteService;