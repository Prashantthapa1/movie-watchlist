
import express from 'express';
import { authenticateUser, authorizeUser } from '../middleware/auth';
import { authHandler, validateMovieIdInBody } from '../middleware/validate';
import FavoriteController from '../controllers/favoriteController';

const router = express.Router();

router.post('/',
    authenticateUser,
    authorizeUser,
    validateMovieIdInBody,
    authHandler(FavoriteController.addMovieToFavorites)
);

router.get('/',
    authenticateUser,
    authorizeUser,
    authHandler(FavoriteController.getUserFavoritesMovies)
);

router.delete('/', 
    authenticateUser,
    authorizeUser,
    validateMovieIdInBody,
    authHandler(FavoriteController.removeFromFavorites)
);

export default router;