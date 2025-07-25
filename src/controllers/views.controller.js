import userDAO from '../dao/user.dao.js';

export function redirectToLogin(req, res) {
  res.redirect('/users/login');
}

export function renderLogin(req, res) {
  console.log('Login page');
  if (req.user) {
    return res.render('login', {
      loggedInUser: req.user,
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
    const userData = {
      id: user._id,
      name: user.first_name,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      age: user.age,
      role: user.role,
      cart: user.cart,
      created_at: user.created_at
    };
    res.render('current', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.render('current', { user: req.user });
  }
} 