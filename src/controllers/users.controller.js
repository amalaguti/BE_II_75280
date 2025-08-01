import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';
import jwt from 'jsonwebtoken';
import { sendAdminRequestEmail } from '../utils/mail.js';
import { sendAdminApprovalEmail } from '../utils/mail.js';

export async function getUsers(req, res) {
  try {
    const users = await userDAO.findAll();
    res.status(200).json(users.map(toUserDTO));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createUser(req, res) {
  let { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const user = await userDAO.create({ first_name, last_name, email });
    res.status(201).json(toUserDTO(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUser(req, res) {
  let { uid } = req.params;
  let { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const user = await userDAO.updateById(uid, { first_name, last_name, email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(toUserDTO(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserRole(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden actualizar roles' });
  }
  const { uid } = req.params;
  const { role } = req.body;
  if (!['user', 'admin', 'premium'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  const user = await userDAO.updateById(uid, { role });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(toUserDTO(user));
}

export async function deleteUser(req, res) {
  let { uid } = req.params;
  try {
    const user = await userDAO.deleteById(uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user: toUserDTO(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function requestAdminRole(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  // Generate secure token (JWT)
  const token = jwt.sign(
    {
      uid: user.id,
      action: 'admin_request',
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  const approveUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/api/users/approve-admin?token=${token}`;
  const denyUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/api/users/deny-admin?token=${token}`;
  await sendAdminRequestEmail({
    to: process.env.GSMTP_ADMIN,
    user,
    approveUrl,
    denyUrl
  });
  return res.json({ message: 'Solicitud enviada al administrador.' });
}

export async function approveAdminRequest(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token requerido');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.action !== 'admin_request' || !payload.uid) {
      return res.status(400).send('Token inválido');
    }
    // Find user
    const user = await userDAO.findById(payload.uid);
    if (!user) return res.status(404).send('Usuario no encontrado');
    if (user.role === 'admin') {
      return res.send('<h2>El usuario ya es administrador.</h2>');
    }
    // Update role
    user.role = 'admin';
    await user.save();
    // Send approval email (to GSMTP_TO for testing)
    await sendAdminApprovalEmail({ to: process.env.GSMTP_TO, user });
    return res.send('<h2>Rol de administrador concedido exitosamente.</h2>');
  } catch (err) {
    return res.status(400).send('Token inválido o expirado');
  }
}

export async function denyAdminRequest(req, res) {
  // For now, just show a message (could notify user, etc.)
  return res.send('<h2>Solicitud de administrador denegada.</h2>');
}

export async function getAllUsers(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden ver usuarios' });
  }
  const users = await userDAO.findAll();
  res.json(users.map(toUserDTO));
} 