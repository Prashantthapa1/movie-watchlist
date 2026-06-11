
import express from 'express';
import { authHandler, validateMovieIdInBody } from '../middleware/validate';
import WatchedController from '../controllers/watchedController';
import { authenticateUser, authorizeUser } from '../middleware/auth';

const router = express.Router();

router.post('/', 
    authenticateUser,
     authorizeUser,
    validateMovieIdInBody,  
    authHandler(WatchedController.addMovieToWatched)
);

router.get('/',
    authenticateUser,
    authorizeUser,
    authHandler(WatchedController.getUsersWatchedMovies)
);

router.delete('/', 
    authenticateUser,
    authorizeUser,
    validateMovieIdInBody,
    authHandler(WatchedController.removeFromWatched)
);

export default router;