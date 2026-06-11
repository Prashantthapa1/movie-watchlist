-- Insert 17 new movies with multiple genres
-- Run this after the migration is complete

USE movies_watchlist;

-- First, let's add the movies (without genre_id since it's removed)
INSERT INTO movies (title, year, rating, poster_url, description, director) VALUES
('Inception', 2010, 8.8, NULL, 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'Christopher Nolan'),
('The Dark Knight', 2008, 9.0, NULL, 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'Christopher Nolan'),
('Pulp Fiction', 1994, 8.9, NULL, 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.', 'Quentin Tarantino'),
('The Lord of the Rings: The Return of the King', 2003, 9.0, NULL, 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', 'Peter Jackson'),
('Fight Club', 1999, 8.8, NULL, 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.', 'David Fincher'),
('Interstellar', 2014, 8.7, NULL, 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', 'Christopher Nolan'),
('Goodfellas', 1990, 8.7, NULL, 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.', 'Martin Scorsese'),
('The Silence of the Lambs', 1991, 8.6, NULL, 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.', 'Jonathan Demme'),
('Saving Private Ryan', 1998, 8.6, NULL, 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.', 'Steven Spielberg'),
('The Green Mile', 1999, 8.6, NULL, 'The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.', 'Frank Darabont'),
('Se7en', 1995, 8.6, NULL, 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.', 'David Fincher'),
('The Prestige', 2006, 8.5, NULL, 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.', 'Christopher Nolan'),
('Gladiator', 2000, 8.5, NULL, 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.', 'Ridley Scott'),
('The Departed', 2006, 8.5, NULL, 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.', 'Martin Scorsese'),
('The Lion King', 1994, 8.5, NULL, 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.', 'Roger Allers'),
('Back to the Future', 1985, 8.5, NULL, 'Marty McFly accidentally sends himself 30 years into the past in a time-traveling DeLorean invented by his friend, eccentric scientist Doc Brown.', 'Robert Zemeckis'),
('The Avengers', 2012, 8.0, NULL, 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.', 'Joss Whedon');

-- Now assign genres to each movie using the movie_genres junction table
-- We need to get the movie_id for each inserted movie

-- Inception: Action, Sci-Fi, Thriller
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Inception' 
AND g.genre_name IN ('Action', 'Sci-Fi', 'Thriller');

-- The Dark Knight: Action, Thriller, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Dark Knight' 
AND g.genre_name IN ('Action', 'Thriller', 'Drama');

-- Pulp Fiction: Drama, Thriller
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Pulp Fiction' 
AND g.genre_name IN ('Drama', 'Thriller');

-- The Lord of the Rings: The Return of the King: Action, Adventure, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Lord of the Rings: The Return of the King' 
AND g.genre_name IN ('Action', 'Adventure', 'Drama');

-- Fight Club: Drama, Thriller
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Fight Club' 
AND g.genre_name IN ('Drama', 'Thriller');

-- Interstellar: Sci-Fi, Drama, Adventure
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Interstellar' 
AND g.genre_name IN ('Sci-Fi', 'Drama', 'Adventure');

-- Goodfellas: Drama, Thriller
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Goodfellas' 
AND g.genre_name IN ('Drama', 'Thriller');

-- The Silence of the Lambs: Horror, Thriller, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Silence of the Lambs' 
AND g.genre_name IN ('Horror', 'Thriller', 'Drama');

-- Saving Private Ryan: Action, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Saving Private Ryan' 
AND g.genre_name IN ('Action', 'Drama');

-- The Green Mile: Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Green Mile' 
AND g.genre_name IN ('Drama');

-- Se7en: Thriller, Horror, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Se7en' 
AND g.genre_name IN ('Thriller', 'Horror', 'Drama');

-- The Prestige: Drama, Thriller, Sci-Fi
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Prestige' 
AND g.genre_name IN ('Drama', 'Thriller', 'Sci-Fi');

-- Gladiator: Action, Drama, Adventure
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Gladiator' 
AND g.genre_name IN ('Action', 'Drama', 'Adventure');

-- The Departed: Drama, Thriller
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Departed' 
AND g.genre_name IN ('Drama', 'Thriller');

-- The Lion King: Adventure, Drama
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Lion King' 
AND g.genre_name IN ('Adventure', 'Drama');

-- Back to the Future: Sci-Fi, Adventure, Comedy
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'Back to the Future' 
AND g.genre_name IN ('Sci-Fi', 'Adventure', 'Comedy');

-- The Avengers: Action, Sci-Fi, Adventure
INSERT INTO movie_genres (movie_id, genre_id)
SELECT m.movie_id, g.genre_id
FROM movies m
CROSS JOIN genres g
WHERE m.title = 'The Avengers' 
AND g.genre_name IN ('Action', 'Sci-Fi', 'Adventure');

-- Verify the insertions
SELECT 
    m.movie_id,
    m.title,
    m.year,
    m.rating,
    GROUP_CONCAT(g.genre_name ORDER BY g.genre_name SEPARATOR ', ') as genres
FROM movies m
LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.genre_id
GROUP BY m.movie_id, m.title, m.year, m.rating
ORDER BY m.movie_id DESC
LIMIT 17;
