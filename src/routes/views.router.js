import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { redirectToLogin, renderLogin, renderRegister, renderCurrent } from '../controllers/views.controller.js';

const router = Router();

router.get('/', redirectToLogin);
router.get('/login', optionalAuth, renderLogin);
router.get('/register', optionalAuth, renderRegister);
router.get('/current', optionalAuth, renderCurrent);

export default router;
