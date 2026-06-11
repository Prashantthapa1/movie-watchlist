import MovieModel from "../models/movieModel";
import { Movie, MovieSearchParams } from "../types";

class MovieService{
    
    static validateMovieYear(year: number): { isValid: boolean; msg?: string}{
       const currentYear = new Date().getFullYear();
        if(year < 1800 || year > currentYear){
            return {
                isValid: false,
                msg: "Year must be between 1800 - current year."
            }
        }
        return {isValid: true};
    }

    static validateRating(rating: number): {isValid: boolean; msg?: string}{
        if(rating > 10 || rating < 0){
            return {
                isValid: false,
                msg: "Rating must be between 0 - 10"
            }
        }
        return { isValid: true};
    }

    static async validateGenre(genreId: number): Promise<{isValid: boolean, msg?: string}> {
        try{
            const genre = await MovieModel.getGenreById(genreId);
            if(!genre){
                return { isValid: false, msg: "Invalid genre selected."};
            }
            return { isValid: true};
        } catch (err){
            console.error("Error validating genre.", err);
            return { isValid: false, msg: "Error validating genre."};
        }
    }

    static sanitizeMovieData(movieData: any): any {
        const sanitized: any = {};
        
        // Sanitize title - trim whitespace and remove extra spaces
        if (movieData.title) {
            sanitized.title = movieData.title.toString().trim().replace(/\s+/g, ' ');
        }
        
        // Sanitize director - trim whitespace and remove extra spaces
        if (movieData.director) {
            sanitized.director = movieData.director.toString().trim().replace(/\s+/g, ' ');
        }
        
        // Sanitize description - trim whitespace
        if (movieData.description) {
            sanitized.description = movieData.description.toString().trim();
        }
        
        // Sanitize genre_id - convert to number
        if (movieData.genre_id) {
            sanitized.genre_id = parseInt(movieData.genre_id.toString());
        }
        
        // Sanitize year - convert to number
        if (movieData.year) {
            sanitized.year = parseInt(movieData.year.toString());
        }
        
        // Sanitize rating - convert to number with 1 decimal place
        if (movieData.rating !== undefined) {
            sanitized.rating = parseFloat(parseFloat(movieData.rating.toString()).toFixed(1));
        }
        
        // Sanitize runtime - convert to number (in minutes)
        if (movieData.runtime) {
            sanitized.runtime = parseInt(movieData.runtime.toString());
        }
        
        // ✅ FIX: Include poster_url in sanitized data
        if (movieData.poster_url) {
            sanitized.poster_url = movieData.poster_url;
        }
        
        return sanitized;
    }

    static async checkDuplicateMovie(title: string, year: number, director: string): Promise<{ isDuplicate: boolean; msg?: string}>{
        try{
            const existingMovie = await MovieModel.findByTitleYearDirector(title, year, director);
            if(existingMovie){
                return{
                    isDuplicate: true,
                    msg: "Movie with same title, year, and director already exists"
                }
            }
            return {isDuplicate: false};
        } catch(err){
            console.error("Error checking movie", err);
            return { isDuplicate: false, msg: "Error checking movie"};
        }
    }

    static async checkDuplicateForUpdate(movie_id: number, title: string, year: number, director: string): Promise<{ isDuplicate: boolean; msg?: string}>{
        try{
            const existingMovie = await MovieModel.findByIDTitleYearDirector(movie_id, title, year, director);
            if(existingMovie){
                return{
                    isDuplicate: true,
                    msg: "Movie with same title, year, and director already exists"
                }
            }
            return {isDuplicate: false};
        } catch(err){
            console.error("Error checking movie", err);
            return { isDuplicate: false, msg: "Error checking movie"};
        }   
    }

    static async searchMovies(searchParams: MovieSearchParams): Promise<Movie[] | null> {
        try{
            const { title, year, genre_id, director, rating, limit, offset, query } = searchParams;

            let searchQuery = `
                SELECT m.*, GROUP_CONCAT(g.genre_name) as genre_name
                FROM movies m
                LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.genre_id
                WHERE 1=1
            `;
            const queryParams: any[] = [];

            // Handle general query parameter (searches title, director, and genre)
            if(query){
                searchQuery += ` AND (
                    m.title LIKE ? OR 
                    m.director LIKE ? OR 
                    m.year = ? OR
                    g.genre_name LIKE ?
                )`;
                const searchTerm = `%${query}%`;
                const yearSearch = parseInt(query) || 0;
                queryParams.push(searchTerm, searchTerm, yearSearch, searchTerm);
            }

            // Handle specific field searches
            if(title){
                searchQuery += ` AND m.title LIKE ?`;
                queryParams.push(`%${title}%`);
            }

            if(year){
                const yearNum = parseInt(year.toString());
                searchQuery += ` AND m.year = ?`;
                queryParams.push(yearNum);
            }

            if(genre_id){
                const genreIdNum = parseInt(genre_id.toString());
                searchQuery += ` AND mg.genre_id = ?`;
                queryParams.push(genreIdNum);
            }

            if(director){
                searchQuery += ` AND m.director LIKE ?`;
                queryParams.push(`%${director}%`);
            }

            if(rating){
                const ratingNum = parseFloat(rating.toString());
                searchQuery += ` AND m.rating >= ?`;
                queryParams.push(ratingNum);
            }

            searchQuery += ` GROUP BY m.movie_id ORDER BY m.year DESC, m.title ASC`;

            if(limit){
                const limitNum = parseInt(limit.toString());
                searchQuery += ` LIMIT ${limitNum}`;

                if(offset){
                    const offsetNum = parseInt(offset.toString());
                    searchQuery += ` OFFSET ${offsetNum}`;
                }
            }

            const movies = await MovieModel.executeSearchQuery(searchQuery, queryParams);
            return movies;
        } catch(err) {
            console.error("Error searching movies", err);
            return null;
        }
    }

}

export default MovieService;