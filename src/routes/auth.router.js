import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// In-memory user storage (replace with database in production)
const users = [{
  id: '1',
  first_name: 'Adrian',
  last_name: 'Malaguti',
  email: 'admin@local',
  age: 25,
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // "password" hashed
}];

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

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      first_name,
      last_name,
      email,
      age: parseInt(age),
      password: hashedPassword
    };
    
    users.push(newUser);

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
        id: newUser.id,
        name: newUser.first_name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    
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
        id: user.id,
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
router.get('/profile', authenticateJWT, (req, res) => {
  res.json({
    user: req.user
  });
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