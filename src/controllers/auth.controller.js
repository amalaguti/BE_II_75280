import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';
import { sendWelcomeEmail, sendMail, sendPasswordResetEmail } from '../utils/mail.js';

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

    // Send welcome email (always to GSMTP_TO for testing)
    await sendWelcomeEmail({ first_name, last_name });

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

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }
  const user = await userDAO.findByEmail(email);
  // Always respond with success for privacy
  if (!user) {
    return res.json({ message: 'Si el email existe, se ha enviado un correo para restablecer la contraseña.' });
  }
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(expires);
  await user.save();
  // Send email (always to GSMTP_TO for testing)
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/users/reset-password?token=${token}`;
  await sendPasswordResetEmail({ resetUrl });
  return res.json({ message: 'Si el email existe, se ha enviado un correo para restablecer la contraseña.' });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
  }
  const user = await userDAO.findByResetToken(token);
  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }
  // Check new password is different
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la anterior' });
  }
  // Hash and update password
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return res.json({ message: 'Contraseña actualizada exitosamente' });
} 