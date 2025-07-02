import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, (req, res) => {
  console.log('Login page')
  // If user is already logged in, redirect to profile
  if (req.user) {
    return res.redirect('/users/profile')
  }
  res.render('login')
})

router.get('/register', optionalAuth, (req, res) => {
  console.log('Register page')
  // If user is already logged in, redirect to profile
  if (req.user) {
    return res.redirect('/users/profile')
  }
  res.render('register')
})

router.get('/profile', optionalAuth, (req, res) => {
  console.log('Profile page')
  // If user is not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/users')
  }
  res.render('profile', { user: req.user })
})

export default router
