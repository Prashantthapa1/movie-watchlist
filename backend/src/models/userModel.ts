import { ResultSetHeader, RowDataPacket } from "mysql2";
import dbConnection from "../../database/db";
import { ROLE, User } from "../types";

class UserModel {
    
    static async register(userData: Omit<User, 'user_id'>): Promise<User | null> {
        try{
            const { name, email, password, role = ROLE.USER } = userData;
            const query = 'INSERT INTO users (name, email, password, role) VALUES(?, ?, ?, ?)';
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [
                name, email, password, role
            ]);
            if(result.insertId){
                const newUser = { user_id: result.insertId, ...userData };
                return newUser;
            }
            return null;
        } catch (err) {
            throw err;
        }
    }

    static async markEmailAsVerified(userId: number): Promise<boolean> {
        try{
            const query = 'UPDATE users SET email_verified = TRUE WHERE user_id=?';
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [userId]);

            return result.affectedRows > 0;
        } catch(err) {
            console.error("Error marking email as verified: ", err);
            throw err;
        }
    }

    static async findByUsernameOrEmail(identifier: string): Promise<User | null> {
        try{
            const query = 'SELECT * FROM users WHERE email=? OR name=?';
            const [rows] = await dbConnection.execute<RowDataPacket[]>(query, [identifier, identifier]);
            if(rows.length > 0){
                return rows[0] as User;
            }
            return null;
        } catch(err) {
            console.error("Error finding user.");
            throw err;
        }
    }

    static async findByEmail(email: string): Promise<User | null> {
        try{
            const query = 'SELECT * FROM users WHERE email=?';
            const [rows] = await dbConnection.execute<RowDataPacket[]>(query, [email]);
            if(rows.length > 0){
                return rows[0] as User;
            }
            return null;
        } catch(err) {
            console.error("Error finding user.");
            throw err;
        }
    }

    static async findById(userId: number) : Promise<User | null> {
        try{
            const query = 'SELECT * FROM users WHERE user_id=?';
            const [rows] = await dbConnection.execute<RowDataPacket[]>(query, [userId]);
            if(rows.length > 0) {
                return rows[0] as User;
            }
            return null;
        } catch(err) {
            console.error("Error finding user.");
            throw err;
        }
    }

    static async findAll(): Promise<User[]> {
        try{
            const query = 'SELECT name, email, role FROM users';
            const [result] = await dbConnection.execute<RowDataPacket[]>(query);
            return result as User[];
        } catch(err) {
            console.error("Error fetching users.", err);
            throw err;
        }
    } 

    static async update(user_id: number, userData: Partial<User>): Promise<boolean> {
        try{
            const updateData: Record<string, any> = {};
            if(userData.name !== undefined) updateData.name = userData.name;
            if(userData.email !== undefined) updateData.email = userData.email;
            if(userData.password !== undefined) updateData.password = userData.password;
            if(userData.role !== undefined) updateData.role = userData.role;
       
             if(Object.keys(updateData).length === 0) return false;
       
            const setClause = Object.keys(updateData).map(field => `${field} =?`).join(', ');
            const values = Object.values(updateData);

            const query = `UPDATE users SET ${setClause} WHERE user_id=?`;
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [...values, user_id]);
            return (result as ResultSetHeader).affectedRows > 0;
        } catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    }

    static async deleteUser(user_id: number): Promise<boolean> {
        try{
            await dbConnection.execute<ResultSetHeader>('DELETE FROM watched WHERE user_id=?', [user_id] );
            await dbConnection.execute<ResultSetHeader>('DELETE FROM favorites WHERE user_id=?', [user_id]);
            const query = 'DELETE FROM users WHERE user_id=?';
            const [rows] = await dbConnection.execute<ResultSetHeader>(query, [user_id]);
            return (rows as ResultSetHeader).affectedRows > 0;
        } catch(error){
            console.error("Error deleting user: ", error);
            throw error;
        }
    }

}

export default UserModel;