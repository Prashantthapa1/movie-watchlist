
CREATE DATABASE IF NOT EXISTS movies_watchlist;

CREATE TABLE IF NOT EXISTS users(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS movies(
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    rating DECIMAL(2, 1),
    poster_url VARCHAR(500),
    description TEXT,
    director VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS genres(
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE
);

-- Junction table for many-to-many relationship between movies and genres
CREATE TABLE IF NOT EXISTS movie_genres(
    movie_id INT,
    genre_id INT,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
);

-- Insert the genre types you want
INSERT INTO genres (genre_name) VALUES 
('Action'),
('Comedy'),
('Drama'),
('Horror'),
('Sci-Fi'),
('Romance'),
('Thriller'),
('Adventure')
ON DUPLICATE KEY UPDATE genre_name = genre_name;

CREATE TABLE IF NOT EXISTS favorites(
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

CREATE TABLE IF NOT EXISTS watched(
    watch_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

-- backend/src/migrations/create_email_verification_table.sql
-- backend/src/migrations/create_email_verification_table.sql
-- MySQL-compatible email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    user_data JSON NOT NULL, -- Store temporary user data until verified (MySQL JSON type)
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups (on scalar columns)
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_code ON email_verifications(verification_code);
CREATE INDEX idx_email_verifications_expires ON email_verifications(expires_at);

-- Add email_verified column to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;