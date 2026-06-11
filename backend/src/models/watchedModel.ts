import { ResultSetHeader, RowDataPacket } from "mysql2";
import dbConnection from "../../database/db";
import { AddWatchedRequest, Watched } from "../types";
import BaseModel from "./BaseModel";

class WatchedModel extends BaseModel{

    static async addToWatched(watchedData: AddWatchedRequest):Promise<Watched | null>{
        try{
            const { user_id, movie_id } = watchedData;

            const isDuplicate = await this.checkDuplicateMovie('watched', user_id, movie_id);
            if(isDuplicate){
                throw new Error("Movie is already in watched list.");
            }

            const query = `INSERT INTO watched (user_id, movie_id, watched_at) VALUES(?, ?, NOW())`;
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [user_id, movie_id]);

            if(result.insertId){
                const newWatched: Watched = {
                    watch_id: result.insertId,
                    ...watchedData,
                    watched_at: new Date()
                }
                return newWatched;
            }
            return null;
        } catch (err){
            console.error("Error adding movie to watched section.", err);
            throw err;
        }
    }

    static async getUsersWatchedMovies(userId: number):Promise<Watched[] | null> {
        try{
            const query = `
            SELECT w.watch_id, w.user_id, w.movie_id, w.watched_at,
                m.year, m.title, m.rating, m.description, m.poster_url,
                GROUP_CONCAT(g.genre_name) as genre_name
            FROM watched w
            JOIN movies m ON w.movie_id = m.movie_id
            LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.genre_id
            WHERE w.user_id =?
            GROUP BY w.watch_id
            ORDER BY w.watched_at DESC
            `;

            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [userId]);

            if(result.length > 0){
                return result as Watched[];
            }
            return null;
        } catch (err){
            console.error("Error fetching watched movies.", err);
            throw err;
        }
    }

    static async checkMovieExists(user_id: number, movie_id: number): Promise<Watched | null>{
        try{
            return await this.getMovieRecord<Watched>('watched', user_id, movie_id);
        } catch(err){
            console.error("Failed to check movie existence.", err);
            throw err;
        }
    }

    static async removeMovieFromWatched(user_id: number, movie_id: number): Promise<boolean> {
        try{
            const isWatched = await this.checkMovieExists(user_id, movie_id);
            if(!isWatched){
                throw new Error("Movie is not in watched list.");
            }

            const [row] = await dbConnection.execute<ResultSetHeader>('DELETE FROM watched WHERE user_id=? AND movie_id=?', [user_id, movie_id]);
            return row.affectedRows > 0;
        } catch(err){
            console.error("Failed to remove movie from watched.", err);
            throw err;
        }
    }


}

export default WatchedModel;