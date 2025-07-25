import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';

export async function getCurrentSessionUser(req, res) {
  try {
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: toUserDTO(user) });
  } catch (error) {
    console.error('Current session error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 