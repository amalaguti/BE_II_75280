import userDAO from '../dao/user.dao.js';

export async function getCurrentSessionUser(req, res) {
  try {
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 