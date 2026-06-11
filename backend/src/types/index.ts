import { Request } from 'express';
import { RowDataPacket } from 'mysql2';

export interface User {
    user_id?: number;
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface Movie {
    movie_id?: number;
    title: string;
    year: number;
    rating?: number | null;
    poster_url?: string | null;
    description?: string | null;
    genre_id?: number;  // Keep for backward compatibility
    genre_ids?: string; // Comma-separated genre IDs for multiple genres
    genre_name?: string; // Comma-separated genre names for display
    director: string;
}

export interface Favorite {
    favorite_id?: number;
    user_id: number;
    movie_id: number;
    created_at?: Date;
}

export interface Watched {
    watch_id?: number;
    user_id: number;
    movie_id: number;
    watched_at?: Date;
}

export enum ROLE {
    ADMIN = "admin",
    USER = "user",
}

export interface JWTPayload {
    user_id: number;
    email: string;
    role: string;
}

// Standardized API response format
export interface ApiResponseWithMessage<T> {
    success: boolean;
    message: string;
    data?: T;
}

// Type for authenticated requests
export interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number;
        email: string;
        role: ROLE;
    };
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: ROLE;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export type UpdateUserRequest = Partial<Omit<User, 'user_id'>>;

export interface AuthResult {
    success: boolean;
    message: string;
    data?: {
        user: Omit<User, 'password'>;
        token: string;
        refreshToken?: string;
    };
}

// Movie-related request types
export interface CreateMovieRequest {
    title: string;
    year: number;
    rating?: number | null;
    poster_url?: string | null;
    description?: string | null;
    genre_id?: number;  // Single genre for backward compatibility
    genre_ids?: number[]; // Multiple genres
    director: string;
}

export type UpdateMovieRequest = Partial<CreateMovieRequest>;

export interface MovieSearchParams {
    title?: string;
    year?: number;
    genre_id?: number;
    rating?: number;
    director?: string;
    query?: string;  // General search term
    limit?: number;
    offset?: number;
}

export interface Genre {
    genre_id: number;
    genre_name: string;
}

export interface MovieWithGenre extends Omit<Movie, 'genre_id'> {
    genre: Genre;
}

// API Response wrapper for movies
export interface MoviesListResponse {
    movies: Movie[];
    total: number;
    page?: number;
    totalPages?: number;
    limit?: number;
}

export interface AddFavoriteRequest {
    user_id: number;
    movie_id: number;
}

export interface AddWatchedRequest {
    user_id: number;
    movie_id: number;
}

export interface WatchedMoviesResponse{
    movies: Watched[] | null;
    count: number;
}

export interface FavoriteMovieResponse{
    movies: Favorite[];
    count?: number;
}

// Email verification types: 
export interface EmailVerificationRequest {
    email: string;
    verification_code: string;
}

export interface SendVerificationRequest {
    email: string;
    username: string;
    password: string;
    role?:string;
}

export interface VerificationResponse {
    success: string;
    message: string;
    user?: User;
    token?: string;
}

export interface VerificationData {
    email: string;
    verification_code: string;
    user_data: object;
    expires_at: Date;
}

export interface VerificationRecord extends RowDataPacket {
    verfication_id: number;
    email: string;
    verfication_code: string;
    user_dataa: object;
    expires_at: Date;
    created_at: Date;
    is_used: boolean;
}

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    tls?: {
        rejectUnauthorized: boolean;
    };
}