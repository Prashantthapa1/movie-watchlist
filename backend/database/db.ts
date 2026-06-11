import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection: Pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "userpassword",
    database: process.env.DB_NAME || "movies_watchlist",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default dbConnection;