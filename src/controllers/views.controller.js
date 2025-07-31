import userDAO from '../dao/user.dao.js';
import { toUserDTO } from '../dto/user.dto.js';

export function redirectToLogin(req, res) {
  res.redirect('/users/login');
}

export function renderLogin(req, res) {
  console.log('Login page');
  if (req.user) {
    return res.render('login', {
      loggedInUser: toUserDTO(req.user),
      showLoggedInMessage: true
    });
  }
  res.render('login');
}

export function renderRegister(req, res) {
  console.log('Register page');
  if (req.user) {
    return res.redirect('/users/current');
  }
  res.render('register');
}

export async function renderCurrent(req, res) {
  console.log('Current page');
  if (!req.user) {
    return res.redirect('/users/login');
  }
  try {
    const user = await userDAO.findById(req.user.id);
    if (!user) {
      return res.redirect('/users/login');
    }
    res.render('current', { user: toUserDTO(user), GSMTP_TO: process.env.GSMTP_TO });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.render('current', { user: toUserDTO(req.user), GSMTP_TO: process.env.GSMTP_TO });
  }
} 