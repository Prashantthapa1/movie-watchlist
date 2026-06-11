import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import movieRoutes from './movieRoutes';
import favoriteRoutes from './favoriteRoutes';
import watchedRoutes from './watchedRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/movies', movieRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/watched', watchedRoutes);

export default router;