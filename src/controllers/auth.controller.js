import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import userModel from '../models/user.model.js';
import { authenticateJWT } from '../middleware/auth.js';

export async function registerUser(req, res) {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      return res.status(400).json({ error: 'La edad debe estar entre 18 y 120 años' });
    }
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ first_name, last_name, email: email.toLowerCase(), age: ageNum, password: hashedPassword });
    await newUser.save();
    const token = generateToken(newUser);
    res.cookie('currentUser', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: { id: newUser._id, name: newUser.first_name, email: newUser.email } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const token = generateToken(user);
    res.cookie('currentUser', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.json({ message: 'Login exitoso', user: { id: user._id, name: user.first_name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: { id: user._id, name: user.first_name, email: user.email, first_name: user.first_name, last_name: user.last_name, age: user.age, created_at: user.created_at } });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export function logoutUser(req, res) {
  res.clearCookie('currentUser', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });
  res.json({ message: 'Logout exitoso' });
} 