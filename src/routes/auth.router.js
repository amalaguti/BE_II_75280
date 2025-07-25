import { Router } from 'express';
import { registerUser, loginUser, getProfile, logoutUser } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateJWT, getProfile);
router.post('/logout', logoutUser);

export default router; 