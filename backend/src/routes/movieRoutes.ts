import express from 'express';
import { authenticateUser, authorizeAdmin, authorizeUser } from '../middleware/auth';
import { checkMovieDuplicate, sanitizeMovieInput, validateMovieInput, validateMovieFormData, validateMovieExists, validateMovieId, validateSearchParams } from '../middleware/movieMiddleware';
import { authHandler } from '../middleware/validate';
import { uploadMoviePoster, handleUploadError } from '../middleware/upload';
import MovieController from '../controllers/movieController';

const router = express.Router();

// Upload image endpoint (standalone)
router.post('/upload-poster', 
    authenticateUser,
    authorizeAdmin,
    uploadMoviePoster.single('poster'),
    handleUploadError,
);

// Create movie with image upload
router.post('/create', 
    authenticateUser,
    authorizeAdmin,
    uploadMoviePoster.single('poster'),     // Handle file upload (field name: 'poster')
    handleUploadError,                      // Handle upload errors
    validateMovieFormData,                  // Validate form data fields
    sanitizeMovieInput,
    validateMovieInput,
    checkMovieDuplicate,
    authHandler(MovieController.createMovie)
);

router.get('/', authenticateUser, authorizeUser, authHandler(MovieController.getAllMovies));
// ✅ FIXED: Move /search BEFORE dynamic routes
router.get('/search', authenticateUser, authorizeUser, validateSearchParams, authHandler(MovieController.searchMovies));
router.get('/genre/:genre_id', authenticateUser, authorizeUser, authHandler(MovieController.getMoviesByGenre));
router.get('/year/:year', authenticateUser, authorizeUser, authHandler(MovieController.getMoviesByYear));


router.delete('/:movie_id', authenticateUser, authorizeAdmin, validateMovieId, authHandler(MovieController.deleteMovie));

router.put('/:movie_id', 
    authenticateUser, 
    authorizeAdmin, 
    uploadMoviePoster.single('poster'), 
    handleUploadError, 
    validateMovieId, 
    // validateMovieFormData, 
    sanitizeMovieInput, 
    validateMovieInput, 
    validateMovieExists, 
    authHandler(MovieController.updateMovie)
    );

export default router;