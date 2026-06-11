import { ResultSetHeader, RowDataPacket } from "mysql2";
import dbConnection from "../../database/db";
import { AddFavoriteRequest, Favorite } from "../types";
import BaseModel from "./BaseModel";

class FavoritesModel extends BaseModel{

    static async addToFavorites(favoriteData: AddFavoriteRequest): Promise<Favorite | null> {
        try{
            const { movie_id, user_id } = favoriteData;

            const isDuplicate = await this.checkDuplicateMovie('favorites', user_id, movie_id);

            if(isDuplicate){
                throw new Error("Movie is already in favorites list.");
            }

            const query = `INSERT INTO favorites (user_id, movie_id, created_at) VALUES(?, ?, NOW())`;
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [user_id, movie_id]);

            if(result.insertId){
                const newFavorite: Favorite = {
                    favorite_id : result.insertId,
                    ...favoriteData,
                    created_at: new Date()
                }
                return newFavorite;
            }
            return null;
        } catch(err){
            console.error("Error adding favorites", err);
            throw err;
        }
    }

    static async getUserFavorites(userId: number):Promise<Favorite[] | null> {
        try{
            const query = `
                SELECT f.favorite_id, f.user_id, f.movie_id, f.created_at,
                    m.title, m.year, m.director, m.rating, m.poster_url, m.description,
                    GROUP_CONCAT(g.genre_name) as genre_name
                FROM favorites f
                JOIN movies m ON f.movie_id = m.movie_id
                LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.genre_id
                WHERE f.user_id = ?
                GROUP BY f.favorite_id
                ORDER BY f.created_at DESC
            `;
            
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [userId]);

            if(result.length > 0){
                return result as Favorite[];
            }

            return null;
        } catch(err){
            console.error("Errror fetching favoirtes", err);
            throw err;
        }
    }

    static async checkMovieExists(user_id: number, movie_id: number): Promise<Favorite | null>{
        try{
            return await this.getMovieRecord<Favorite>('favorites', user_id, movie_id);
        } catch(err){
            console.error("Failed to check movie existence.", err);
            throw err;
        }
    }

    static async deleteFromFavorites(user_id: number, movie_id: number): Promise<boolean> {
        try{
            const favoriteExists = await this.checkMovieExists(user_id, movie_id);
            if(!favoriteExists){
                throw new Error("Movie is not in favorite List.");
            }

            const query = 'DELETE FROM favorites WHERE user_id=? AND movie_id=?';
            const [row] = await dbConnection.execute<ResultSetHeader>(query, [user_id, movie_id]);

            return row.affectedRows > 0;
        } catch(err){
            console.error("Error removing from favorites.", err);
            throw err;
        }
    }

}

export default FavoritesModel;