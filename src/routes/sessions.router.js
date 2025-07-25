import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getCurrentSessionUser } from '../controllers/sessions.controller.js';

const router = Router();

router.get('/current', authenticateJWT, getCurrentSessionUser);

export default router; 