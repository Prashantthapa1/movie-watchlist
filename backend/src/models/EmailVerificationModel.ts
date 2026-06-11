import { ResultSetHeader } from "mysql2";
import dbConnection from "../../database/db";
import { VerificationData, VerificationRecord } from "../types";
import BaseModel from "./BaseModel";

class EmailVerificationModel extends BaseModel {

    static async createVerification(data: VerificationData): Promise<number | null> {
        try{
            await this.cleanupExpiredVerifications(data.email);

            const query = ` 
                INSERT INTO email_verifications (email, verification_code, user_data, expires_at)
                VALUES(?,?,?,?) 
            `;
            
            const [result] = await dbConnection.execute<ResultSetHeader>(query, 
                [data.email, data.verification_code, JSON.stringify(data.user_data), data.expires_at]
            );
            return result.insertId;
        }  catch(err) {
            console.error("Error creating verification", err);
            throw err;
        }
    }

    static async verifycode(email: string, code: string): Promise<object | null> {
        try{
            const query =   `
                SELECT * FROM email_verifications
                WHERE email=? AND verification_code=?
                AND expires_at > NOW() AND is_used=FALSE
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const [rows] = await dbConnection.execute<VerificationRecord[]>(query, [email, code]);

            if(rows.length === 0) return null;

            const verification = rows[0];

            await this.markAsUsed(verification.verification_id);

            return verification.user_data;
        } catch(err) {
            console.error("Error verifying code: ", err);
            throw err;
        }
    }

    static async markAsUsed(verificationId: number): Promise<boolean> {
        try{
            const query =  `UPDATE email_verifications SET is_used = TRUE WHERE verification_id=?`;
            const [result] = await dbConnection.execute<ResultSetHeader>(query, [verificationId]);

            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error marking verification as used:', err);
            throw err;
        }
    }

    static async cleanupExpiredVerifications(email: string): Promise<void> {
        try{
            const query = `
                DELETE FROM email_verifications
                WHERE email=? AND (expires_at < NOW() OR is_used = TRUE)
            `;

            await dbConnection.execute(query, [email]);
        } catch (err) {
            console.error('Error cleaning up verifications:', err);
            throw err;
        }
    }

    static async cleanUpAllExpired(): Promise<void> {
        try{
            const query = `DELETE FROM email_verifications WHERE expires_at < NOW() OR is_used = TRUE`;
            await dbConnection.execute(query);
        } catch (err) {
            console.error('Error cleaning up all expired verifications:', err);
            throw err;
        }
    }
}

export default EmailVerificationModel;