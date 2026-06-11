import api from "./api";

class MovieService {

    // Get all movies with pagination
    static async getMovies(params = {}) {
        try{
            const response = await api.get('/movies', { params });
            console.log("response:", response);
            return response.data;
        } catch (err) {
            throw this.handleError(err);
        }
    }

    // Get movies by genre with pagination
    static async getMoviesByGenre(genreId, params = {}){
        try{
            const response = await api.get(`/movies/genre/${genreId}`, { params });
            console.log("response:", response);
            return response.data;
        } catch (err){
            throw this.handleError(err);
        }
    }

    // Get movies by year with pagination
    static async getMoviesByYear(year, params = {}){
        try{
            const response = await api.get(`/movies/year/${year}`, { params });
           console.log("response:", response);
            return response.data;
        }catch(err){
            throw this.handleError(err);
        }
    }

    // Create movie (Admin only)
    static async createMovie(movieData){
        try{
            // Let axios automatically set the correct Content-Type based on data type
            const response = await api.post('/movies/create', movieData);
            console.log("response:", response);
            return response.data
        }catch (err){
            throw this.handleError(err);
        }
    }

    // Search movies with multiple criteria
    static async searchMovies(searchParams = {}){
        try{
            // ✅ Fix: Correct parameter name (was 'seaerchParams')
            const response = await api.get('/movies/search', {params: searchParams});
            return response.data;
        } catch(err){
            throw this.handleError(err);
        }
    }

    // Update movie (Admin only)
    static async updateMovie(movieId, movieData) {
        try{
            // Let axios automatically set the correct Content-Type
            const response = await api.put(`/movies/${movieId}`, movieData);
            console.log("response:", response);
            return response.data;
        } catch(err){
            throw this.handleError(err);
        } 
    }
    
    // Delete movie (Admin only)
    static async deleteMovie(movieId){
        try{
            // ✅ Fix: Add leading slash
            const response = await api.delete(`/movies/${movieId}`);
            console.log("response:", response);
            return response.data;
        } catch(err){
            throw this.handleError(err);
        }
    }

    // Upload poster (standalone)
    static async uploadPoster(file) {
        try{
            const formData = new FormData();
            formData.append('poster', file);

            // Let axios automatically set Content-Type for FormData
            const response = await api.post('/movies/upload-poster', formData);
            console.log("response:", response);
            return response.data;
        } catch(err){
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

export default MovieService;