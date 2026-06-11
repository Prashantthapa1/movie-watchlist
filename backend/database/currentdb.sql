-- Adminer 5.3.0 MySQL 8.0.43 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `movie_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  KEY `user_id` (`user_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `genres`;
CREATE TABLE `genres` (
  `genre_id` int NOT NULL AUTO_INCREMENT,
  `genre_name` varchar(50) NOT NULL,
  PRIMARY KEY (`genre_id`),
  UNIQUE KEY `genre_name` (`genre_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `genres` (`genre_id`, `genre_name`) VALUES
(1,	'Action'),
(8,	'Adventure'),
(2,	'Comedy'),
(3,	'Drama'),
(4,	'Horror'),
(6,	'Romance'),
(5,	'Sci-Fi'),
(7,	'Thriller');

DROP TABLE IF EXISTS `movie_genres`;
CREATE TABLE `movie_genres` (
  `movie_id` int NOT NULL,
  `genre_id` int NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `movie_genres_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  CONSTRAINT `movie_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(2,	1),
(7,	1),
(8,	1),
(10,	1),
(15,	1),
(19,	1),
(23,	1),
(3,	2),
(22,	2),
(29,	2),
(4,	3),
(8,	3),
(9,	3),
(10,	3),
(11,	3),
(12,	3),
(13,	3),
(14,	3),
(15,	3),
(16,	3),
(17,	3),
(18,	3),
(19,	3),
(20,	3),
(21,	3),
(25,	3),
(26,	3),
(5,	4),
(14,	4),
(17,	4),
(28,	4),
(6,	5),
(7,	5),
(12,	5),
(18,	5),
(22,	5),
(23,	5),
(27,	5),
(7,	7),
(8,	7),
(9,	7),
(11,	7),
(13,	7),
(14,	7),
(17,	7),
(18,	7),
(20,	7),
(10,	8),
(12,	8),
(19,	8),
(21,	8),
(22,	8),
(23,	8),
(24,	8);

DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies` (
  `movie_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `year` int NOT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `poster_url` varchar(500) DEFAULT NULL,
  `description` text,
  `director` varchar(100) NOT NULL,
  PRIMARY KEY (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `movies` (`movie_id`, `title`, `year`, `rating`, `poster_url`, `description`, `director`) VALUES
(2,	'The Matrix',	1999,	8.7,	NULL,	'A computer programmer discovers that reality as he knows it is actually a simulation controlled by machines.',	'The Wachowskis'),
(3,	'The Shawshank Redemption',	1994,	9.3,	NULL,	'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',	'Frank Darabont'),
(4,	'Forrest Gump',	1994,	8.8,	NULL,	'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.',	'Robert Zemeckis'),
(5,	'The Exorcist',	1973,	8.1,	NULL,	'When a teenage girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her daughter.',	'William Friedkin'),
(6,	'Toy Story',	1995,	8.3,	NULL,	'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.',	'John Lasseter'),
(7,	'Inception',	2010,	8.8,	NULL,	'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',	'Christopher Nolan'),
(8,	'The Dark Knight',	2008,	9.0,	NULL,	'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',	'Christopher Nolan'),
(9,	'Pulp Fiction',	1994,	8.9,	NULL,	'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',	'Quentin Tarantino'),
(10,	'The Lord of the Rings: The Return of the King',	2003,	9.0,	NULL,	'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',	'Peter Jackson'),
(11,	'Fight Club',	1999,	8.8,	NULL,	'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',	'David Fincher'),
(12,	'Interstellar',	2014,	8.7,	NULL,	'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',	'Christopher Nolan'),
(13,	'Goodfellas',	1990,	8.7,	NULL,	'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',	'Martin Scorsese'),
(14,	'The Silence of the Lambs',	1991,	8.6,	NULL,	'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',	'Jonathan Demme'),
(15,	'Saving Private Ryan',	1998,	8.6,	NULL,	'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',	'Steven Spielberg'),
(16,	'The Green Mile',	1999,	8.6,	NULL,	'The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.',	'Frank Darabont'),
(17,	'Se7en',	1995,	8.6,	NULL,	'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.',	'David Fincher'),
(18,	'The Prestige',	2006,	8.5,	NULL,	'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.',	'Christopher Nolan'),
(19,	'Gladiator',	2000,	8.5,	NULL,	'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',	'Ridley Scott'),
(20,	'The Departed',	2006,	8.5,	NULL,	'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.',	'Martin Scorsese'),
(21,	'The Lion King',	1994,	8.5,	NULL,	'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',	'Roger Allers'),
(22,	'Back to the Future',	1985,	8.5,	NULL,	'Marty McFly accidentally sends himself 30 years into the past in a time-traveling DeLorean invented by his friend, eccentric scientist Doc Brown.',	'Robert Zemeckis'),
(23,	'The Avengers',	2012,	8.0,	NULL,	'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.',	'Joss Whedon'),
(24,	'One Piece',	1999,	9.0,	NULL,	'The one piece is real.',	'Oda'),
(25,	'adsdf',	1901,	0.3,	NULL,	'fdfe',	'afe'),
(26,	'afsdf',	1900,	0.1,	NULL,	'sdfds',	'sdfs'),
(27,	'avbc',	1900,	0.4,	NULL,	'adfaf',	'adfa'),
(28,	'dsdff',	1901,	0.2,	'/uploads/movies/movie-poster-1761383455162-308182832.png',	'fsafdfef',	'vzsfsd'),
(29,	'fasssi',	1902,	0.3,	'/uploads/movies/movie-poster-1761383824884-899954727.png',	'adfaf',	'asddfd');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`) VALUES
(1,	'admin',	'admin@gmail.com',	'$2b$12$Z9bID3HdyobJ4DnuvTEJU.1DAG4rozTcHAGxGnsnP4mkatBjywC8C',	'admin'),
(10,	'admin2',	'admin1@gmail.com',	'$2b$12$CKGHrit222dMKEK2Mj/f/ePoTgIesx3FobhCU2o0jupy8IYZNSlfe',	'admin'),
(11,	'Prashant',	'thapaprashant765@gmail.com',	'$2b$12$UwGzomHvIdr54/F60T/C6Owj7wGUCMdJbYTVlcYFn0zBmWjyBvelu',	'user'),
(50,	'mrAdmin',	'admin123@gmail.com',	'$2b$12$bxEGBNiq7iwXhXegDCKvlOpLpBE8w/m2muArsEsaNTCrpqaLmauKe',	'admin');

DROP TABLE IF EXISTS `watched`;
CREATE TABLE `watched` (
  `watch_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `movie_id` int DEFAULT NULL,
  `watched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`watch_id`),
  KEY `user_id` (`user_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `watched_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `watched_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2025-10-26 07:37:08 UTC