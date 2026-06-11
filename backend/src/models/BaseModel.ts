// import { ResultSetHeader, RowDataPacket } from 'mysql2';
// import dbConnection from '../../database/db';

import { RowDataPacket } from "mysql2";
import dbConnection from "../../database/db";

// /**
//  * Base model class that provides common database operations
//  * to eliminate redundancy across all models
//  */
// abstract class BaseModel {
//     protected static connection = dbConnection;
    
//     /**
//      * Execute a SELECT query and return rows
//      */
//     protected static async executeSelect<T extends RowDataPacket>(
//         query: string, 
//         params: any[] = []
//     ): Promise<T[]> {
//         try {
//             const [rows] = await this.connection.execute<T[]>(query, params);
//             return rows;
//         } catch (error) {
//             console.error('Database SELECT error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Execute a SELECT query and return single row or null
//      */
//     protected static async executeSelectOne<T extends RowDataPacket>(
//         query: string, 
//         params: any[] = []
//     ): Promise<T | null> {
//         try {
//             const [rows] = await this.connection.execute<T[]>(query, params);
//             return rows.length > 0 ? rows[0] : null;
//         } catch (error) {
//             console.error('Database SELECT ONE error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Execute an INSERT query and return result
//      */
//     protected static async executeInsert(
//         query: string, 
//         params: any[] = []
//     ): Promise<ResultSetHeader> {
//         try {
//             const [result] = await this.connection.execute<ResultSetHeader>(query, params);
//             return result;
//         } catch (error) {
//             console.error('Database INSERT error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Execute an UPDATE query and return result
//      */
//     protected static async executeUpdate(
//         query: string, 
//         params: any[] = []
//     ): Promise<ResultSetHeader> {
//         try {
//             const [result] = await this.connection.execute<ResultSetHeader>(query, params);
//             return result;
//         } catch (error) {
//             console.error('Database UPDATE error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Execute a DELETE query and return result
//      */
//     protected static async executeDelete(
//         query: string, 
//         params: any[] = []
//     ): Promise<ResultSetHeader> {
//         try {
//             const [result] = await this.connection.execute<ResultSetHeader>(query, params);
//             return result;
//         } catch (error) {
//             console.error('Database DELETE error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Build dynamic UPDATE query with fields and values
//      */
//     protected static buildUpdateQuery(
//         tableName: string,
//         updateData: Record<string, any>,
//         whereField: string,
//         whereValue: any
//     ): { query: string; params: any[] } {
//         const fields: string[] = [];
//         const values: any[] = [];

//         // Build SET clause
//         for (const [key, value] of Object.entries(updateData)) {
//             if (value !== undefined && value !== null) {
//                 fields.push(`${key} = ?`);
//                 values.push(value);
//             }
//         }

//         if (fields.length === 0) {
//             throw new Error('No valid fields to update');
//         }

//         // Add WHERE parameter
//         values.push(whereValue);

//         const query = `UPDATE ${tableName} SET ${fields.join(', ')} WHERE ${whereField} = ?`;
        
//         return { query, params: values };
//     }

//     /**
//      * Build dynamic INSERT query
//      */
//     protected static buildInsertQuery(
//         tableName: string,
//         insertData: Record<string, any>
//     ): { query: string; params: any[] } {
//         const fields: string[] = [];
//         const placeholders: string[] = [];
//         const values: any[] = [];

//         for (const [key, value] of Object.entries(insertData)) {
//             if (value !== undefined && value !== null) {
//                 fields.push(key);
//                 placeholders.push('?');
//                 values.push(value);
//             }
//         }

//         if (fields.length === 0) {
//             throw new Error('No valid fields to insert');
//         }

//         const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        
//         return { query, params: values };
//     }

//     /**
//      * Check if a record exists by ID
//      */
//     protected static async existsById(
//         tableName: string, 
//         idField: string, 
//         id: number
//     ): Promise<boolean> {
//         const query = `SELECT 1 FROM ${tableName} WHERE ${idField} = ? LIMIT 1`;
//         const result = await this.executeSelectOne(query, [id]);
//         return result !== null;
//     }

//     /**
//      * Get record count from table with optional WHERE clause
//      */
//     protected static async getCount(
//         tableName: string, 
//         whereClause: string = '', 
//         params: any[] = []
//     ): Promise<number> {
//         const query = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
//         const result = await this.executeSelectOne<RowDataPacket & { count: number }>(query, params);
//         return result?.count || 0;
//     }

//     /**
//      * Generic find by field method
//      */
//     protected static async findByField<T extends RowDataPacket>(
//         tableName: string,
//         fieldName: string,
//         fieldValue: any,
//         selectFields: string = '*'
//     ): Promise<T | null> {
//         const query = `SELECT ${selectFields} FROM ${tableName} WHERE ${fieldName} = ?`;
//         return this.executeSelectOne<T>(query, [fieldValue]);
//     }

//     /**
//      * Generic find all with optional conditions
//      */
//     protected static findAllRecords<T extends RowDataPacket>(
//         tableName: string,
//         selectFields: string = '*',
//         whereClause: string = '',
//         orderBy: string = '',
//         limit: string = '',
//         params: any[] = []
//     ): Promise<T[]> {
//         let query = `SELECT ${selectFields} FROM ${tableName}`;
        
//         if (whereClause) query += ` WHERE ${whereClause}`;
//         if (orderBy) query += ` ORDER BY ${orderBy}`;
//         if (limit) query += ` LIMIT ${limit}`;
        
//         return this.executeSelect<T>(query, params);
//     }
// }

// export default BaseModel;

abstract class BaseModel{

    protected static async checkDuplicateMovie(tableName: string, user_id: number, movie_id: number): Promise<boolean> {
        try{
            const query = `SELECT 1 FROM ${tableName} WHERE user_id=? AND movie_id=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [user_id, movie_id]);

            return result.length > 0;
        } catch (err){
            console.error("Error checking movie", err);
            throw err;
        }
    }

    protected static async getMovieRecord<T>(
        tableName: string,
        user_id: number,
        movie_id: number,
    ): Promise<T | null>{
        try{
            const query = `SELECT * FROM ${tableName} WHERE user_id=? AND movie_id=?`;
            const [result] = await dbConnection.execute<RowDataPacket[]>(query, [user_id, movie_id]);

            if(result.length > 0){
                return result[0] as T;
            }
            return null;
        } catch (err){
            console.error("Error getting movie record", err);
            throw err;
        }
    }
}

export default BaseModel;