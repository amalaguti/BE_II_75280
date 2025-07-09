import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import userModel from '../models/user.model.js'

const router = Router()

// Redirect root /users to /users/login
router.get('/', (req, res) => {
  res.redirect('/users/login')
})

router.get('/login', optionalAuth, (req, res) => {
  console.log('Login page')
  // If user is already logged in, show message instead of redirecting
  if (req.user) {
    return res.render('login', { 
      loggedInUser: req.user,
      showLoggedInMessage: true 
    })
  }
  res.render('login')
})

router.get('/register', optionalAuth, (req, res) => {
  console.log('Register page')
  // If user is already logged in, redirect to current user page
  if (req.user) {
    return res.redirect('/users/current')
  }
  res.render('register')
})

router.get('/current', optionalAuth, async (req, res) => {
  console.log('Current page')
  // If user is not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/users/login')
  }
  
  try {
    // Fetch fresh user data from database (same as /api/sessions/current)
    const user = await userModel.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.redirect('/users/login')
    }
    
    // Format user data to match the API response
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
    // Fallback to passport user data if database query fails
    res.render('current', { user: req.user });
  }
})

export default router
