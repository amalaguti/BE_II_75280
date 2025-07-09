import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import userModel from '../models/user.model.js';

const router = Router();

// Get current session user
router.get('/current', authenticateJWT, async (req, res) => {
  try {
    // Fetch fresh user data from MongoDB
    const user = await userModel.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.first_name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        role: user.role,
        cart: user.cart,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Current session error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

export default router; 