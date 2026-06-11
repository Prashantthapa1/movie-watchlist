import { Router } from "express";
import { authenticateToken, requireAdmin, verifyResourceOwnership } from "../middleware/auth";
import { authHandler, validateIdParam, validateUserUpdate } from "../middleware/validate";
import UserController from "../controllers/userController";

const router = Router();

// Admin-only routes (manage all users)
router.get('/', authenticateToken, requireAdmin, authHandler(UserController.getAllUsers));
router.get('/:id', authenticateToken, requireAdmin, validateIdParam('User ID'), authHandler(UserController.getUserById));
router.put('/:id', authenticateToken, requireAdmin, validateIdParam('User ID'), validateUserUpdate, authHandler(UserController.updateUser));
router.delete('/:id', authenticateToken, requireAdmin, validateIdParam('User ID'), authHandler(UserController.deleteUser));

// User resource management (users can manage their own resources OR admin can manage any)
router.put('/profile/:id', authenticateToken, validateIdParam('User ID'), verifyResourceOwnership, validateUserUpdate, authHandler(UserController.updateCurrentUser));
router.delete('/profile/:id', authenticateToken, validateIdParam('User ID'), verifyResourceOwnership, authHandler(UserController.deleteUser));
router.get('/profile/:id', authenticateToken, validateIdParam('User ID'), verifyResourceOwnership, authHandler(UserController.getUserById));

// User self-management (no ID needed, uses token)
router.put('/profile', authenticateToken, validateUserUpdate, authHandler(UserController.updateCurrentUser));

export default router;