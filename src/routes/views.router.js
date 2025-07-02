import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, (req, res) => {
  console.log('Login page')
  res.render('login')
})

router.get('/register', optionalAuth, (req, res) => {
  console.log('Register page')
  res.render('register')
})

router.get('/profile', (req, res) => {
  console.log('Profile page')
  res.render('profile')
})

export default router
