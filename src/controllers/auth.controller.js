import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';

function validateRequiredFields({ first_name, last_name, email, age, password }) {
  return first_name && last_name && email && age && password;
}

function validateAge(age) {
  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) return false;
  return true;
}

export async function registerUser(req, res) {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!validateRequiredFields({ first_name, last_name, email, age, password })) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (!validateAge(age)) {
      return res.status(400).json({ error: 'La edad debe estar entre 18 y 120 años' });
    }
    const existingUser = await userDAO.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userDAO.create({ first_name, last_name, email: email.toLowerCase(), age: parseInt(age), password: hashedPassword });
    const token = generateToken(newUser);
    res.cookie('currentUser', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: toUserDTO(newUser) });
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
    const user = await userDAO.findByEmail(email);
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
    res.json({ message: 'Login exitoso', user: toUserDTO(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: toUserDTO(user) });
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