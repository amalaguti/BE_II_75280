import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { authenticateJWT } from '../middleware/auth.js';
import userModel from '../models/user.model.js';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        error: 'Todos los campos son requeridos'
      });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      return res.status(400).json({
        error: 'La edad debe estar entre 18 y 120 años'
      });
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in MongoDB
    const newUser = new userModel({
      first_name,
      last_name,
      email: email.toLowerCase(),
      age: ageNum,
      password: hashedPassword
    });
    
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Set JWT token in httpOnly cookie
    res.cookie('jwt_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        name: newUser.first_name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email in MongoDB
    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set JWT token in httpOnly cookie
    res.cookie('jwt_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.first_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateJWT, async (req, res) => {
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
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Logout (clear cookie)
router.post('/logout', (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwt_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });
  
  res.json({
    message: 'Logout exitoso'
  });
});

export default router; 