import { Router } from "express";
import { authHandler, validateInputField, validateLogin, validateRegister } from "../middleware/validate";
import AuthController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import BaseController from "../controllers/BaseController";

const router = Router();

router.post('/send-verification',
	validateInputField(['email', 'username', 'password']),
	authHandler(AuthController.sendVerificationCode)
);

router.post('/verify-email', 
	validateInputField(['email', 'verification_code']),
	authHandler(AuthController.verifyEmailAndRegister)
);

router.post('/resend-verification',
	validateInputField(['email']),
	authHandler(AuthController.resendVerificationCode)
);

// Public routes (no authentication required)
router.post('/register', validateRegister, authHandler(AuthController.register));
router.post('/login', validateLogin, authHandler(AuthController.Login));
router.post('/logout', (_req, res) => {BaseController['sendSuccessMsg'](res, "Logout successfull.")});

// Protected routes (authentication required)
router.get('/me', authenticateToken, authHandler(AuthController.getCurrentUser));
router.get('/verify', authenticateToken, authHandler(AuthController.verifyToken));

// ✅ Refresh should NOT require authentication (uses refresh token)
router.post('/refresh', authHandler(AuthController.refreshToken));

// Development-only debug route to list users (no passwords)
if(process.env.NODE_ENV === 'development'){
	router.get('/_debug/users', async (_req, res) => {
		try{
			const users = await (await import('../models/userModel')).default.findAll();
			const sanitized = users.map(u => ({ user_id: u.user_id, name: u.name, email: u.email, role: u.role }));
			res.json({ success: true, message: 'Users fetched', data: { users: sanitized } });
		} catch (err:any){
			console.error('[DEBUG USERS] Error:', err);
			res.status(500).json({ success:false, message: err.message || 'Error fetching users' });
		}
	});
}

export default router;