import { ResultSetHeader, RowDataPacket } from "mysql2";
import dbConnection from "../../database/db";
import { CreateMovieRequest, Movie } from "../types";

class MovieModel{

    static async createMovie(movieData: CreateMovieRequest): Promise<Movie | null> {
        const connection = await dbConnection.getConnection();
        try{
            await connection.beginTransaction();
            
            const { title, year, rating, poster_url, description, genre_id, genre_ids, director } = movieData;
            
            // Insert movie without genre_id (removed from movies table)
            const query = `INSERT INTO movies (title, year, rating, poster_url, description, director) 
                            VALUES(?,?,?,?,?,?)`;
            const [result] = await connection.execute<ResultSetHeader>(query, [
                title, 
                year, 
                rating ?? null,
                poster_url ?? null,
                description ?? null,
                director
            ]);
            
            const movieId = result.insertId;
            
            // Handle genres - support both single genre_id and multiple genre_ids
            const genreIdsToInsert = genre_ids || (genre_id ? [genre_id] : []);
            
            if (genreIdsToInsert.length > 0) {
                const genreQuery = `INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)`;
                for (const gId of genreIdsToInsert) {
                    await connection.execute(genreQuery, [movieId, gId]);
                }
            }
            
            await connection.commit();
            
            if(movieId){
                // Fetch the created movie with genre names
                const createdMovie = await MovieModel.getMovieById(movieId);
                if (createdMovie) {
                    return createdMovie;
                }
            }
            return null;
        } catch(err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    static async getAllMovies(): Promise<Movie[] | null> {
        try{
            const query = `
                SELECT 
                    m.movie_id,
                    m.title, 
                    m.year, 
                    m.rating, 
                    m.poster_url, 
                    m.description, 
                    m.director,
                    GROUP_CONCAT(g.genre_name SEPARATOR ', ') as genre_name,
                    GROUP_CONCAT(g.genre_id SEPARATOR ',') as genre_ids
                FROM movies m
                LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.genre_id
                GROUP BY m.movie_id, m.title, m.year, m.rating, m.poster_url, m.description, m.director
            `;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query);
            if(result.length > 0){
                 return result as Movie[];
            }
           return null;
        } catch(err) {
            console.error("Error fetching movies", err);
            throw err;
        }
    }

    static async getMovieById(movie_id: number): Promise<Movie | null>{
        try{
            const query = `
                SELECT 
                    m.movie_id,
                    m.title, 
                    m.year, 
                    m.rating, 
                    m.poster_url, 
                    m.description, 
                    m.director,
                    GROUP_CONCAT(g.genre_name SEPARATOR ', ') as genre_name,
                    GROUP_CONCAT(g.genre_id SEPARATOR ',') as genre_ids
                FROM movies m
                LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.genre_id
                WHERE m.movie_id = ?
                GROUP BY m.movie_id, m.title, m.year, m.rating, m.poster_url, m.description, m.director
            `;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [movie_id]);
            if(result.length > 0) {
               return result[0] as Movie; 
            }
            return null;
        } catch(err) {
            console.error("Error finding movie", err);
            throw err;
        }
    }

    static async getMovieByTitle(title: string): Promise<Movie | null> {
        try{
            const query = `SELECT * FROM movies WHERE title=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [title]);
            if(result.length > 0) {
               return result[0] as Movie; 
            }
            return null;
        } catch(err) {
            console.error("Error finding movie", err);
            throw err;
        }     
    }

    static async deleteMovie(movie_id: number): Promise<boolean> {
        try{
            await dbConnection.execute<ResultSetHeader>(`DELETE FROM favorites WHERE movie_id=?`, [movie_id]);
            await dbConnection.execute<ResultSetHeader>(`DELETE FROM watched WHERE movie_id=?`, [movie_id]);
            const query = `DELETE FROM movies WHERE movie_id=?`;
            const [rows] = await dbConnection.execute<ResultSetHeader>(query, [movie_id]);
            return (rows as ResultSetHeader).affectedRows > 0;
        } catch (err) {
            console.error("Error deleting movie", err);
            throw err;
        }
    }

    static async updateMovie(movie_id: number, movieData: Partial<Movie>): Promise<boolean> {
        try{
            const updateData: Record<string, any> = {};

            if(movieData.title !== undefined) updateData.title = movieData.title;
            if(movieData.year !== undefined ) updateData.year = movieData.year ;
            if(movieData.rating !== undefined ) updateData.rating = movieData.rating ;
            if(movieData.poster_url !== undefined ) updateData.poster_url = movieData.poster_url ;
            if(movieData.director !== undefined ) updateData.director = movieData.director ;
            if(movieData.description !== undefined) updateData.description = movieData.description;
            // Note: genre_id removed as it's no longer in the movies table

            if(Object.keys(updateData).length === 0) return false;

            const setClause = Object.keys(updateData).map(field => `${field}=?`).join(', ');
            const values = Object.values(updateData);

            const query = `UPDATE movies SET ${setClause} WHERE movie_id=?`;
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [...values, movie_id]);
            return (result as ResultSetHeader).affectedRows > 0;

        } catch(err){
            console.error("Error updating movie", err);
            throw err;
        }
    }

    static async findByTitleYearDirector(title: string, year: number, director: string): Promise<Movie | null>{
        try{
            const query = `SELECT * FROM movies WHERE title=? AND year=? AND director=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [
                title, year, director
            ]);

            if(result.length > 0){
                return result[0] as Movie;
            }
            return null;
        }catch(err) {
            console.error("Error finding movie", err);
            throw err;
        }
    }

    static async findByIDTitleYearDirector(movie_id: number, title: string, year: number, director: string): Promise<Movie | null> {
        try{
            const query = `SELECT * FROM movies WHERE movie_id=? AND title=? AND director=? AND year=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [
                movie_id, title, director, year
            ]);
            if(result.length > 0){
                return result[0] as Movie;
            }
            return null;
        } catch(err) {
            console.error("Error finding movie", err);
            throw err;
        }
    }

    static async findMovieByGenreId(genre_id: number): Promise<Movie[] | null> {
        try{
            const query = `SELECT * FROM movies WHERE genre_id=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [genre_id]);
            
            if(result.length > 0){
                return result as Movie[];
            }
            return null;
        } catch (err) {
            console.error("Error finding movie", err);
            throw err;
        }
    }

        static async findMovieByYear(year: number): Promise<Movie[] | null> {
        try{
            const query = `SELECT * FROM movies WHERE year=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [year]);
            
            if(result.length > 0){
                return result as Movie[];
            }
            return null;
        } catch (err) {
            console.error("Error finding movie", err);
            throw err;
        }
    }

    static async getGenreById(genre_id: number): Promise<any | null> {
        try{
            const query = `SELECT * FROM genres WHERE genre_id=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [genre_id]);
            
            if(result.length > 0){
                return result[0];
            }
            return null;
        } catch(err) {
            console.error("Error finding genre", err);
            throw err;
        }
    }

    static async executeSearchQuery(query: string, params: any[]): Promise<Movie[] | null> {
        try{
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, params);

            if(result.length > 0){
                return result as Movie[];
            }
            return [];
        } catch(err){
            console.error("Error executring search query.", err);
            throw err;
        }
    } 

}

export default MovieModel;