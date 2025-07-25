import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';

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