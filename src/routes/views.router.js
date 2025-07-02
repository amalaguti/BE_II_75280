import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Redirect root /users to /users/login
router.get('/', (req, res) => {
  res.redirect('/users/login')
})

router.get('/login', optionalAuth, (req, res) => {
  console.log('Login page')
  // If user is already logged in, redirect to current user page
  if (req.user) {
    return res.redirect('/users/current')
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

router.get('/current', optionalAuth, (req, res) => {
  console.log('Current page')
  // If user is not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/users/login')
  }
  res.render('current', { user: req.user })
})

export default router
