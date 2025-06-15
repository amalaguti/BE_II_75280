import { Router } from 'express'

const router = Router()

const users = [{
  first_name: 'Adrian',
  last_name: 'Malaguti',
  email: 'admin@local',
  age: 25,
  password: '123456'
}]

router.post('/register', (req, res) => {
  const { first_name, last_name, email, age, password } = req.body
  users.push({ first_name, last_name, email, age, password })
  res.redirect('/')
})

router.get('/login', (req, res) => {
  // If user is already logged in, redirect to profile
  if (req.session.user) {
    return res.redirect('/profile')
  }
  res.render('login')
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  // Find user by email
  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.log('User not found')
    return res.status(401).render('login', { 
      error: 'Usuario no encontrado' 
    })
  }

  // Check password
  if (user.password !== password) {
    console.log('Invalid password')
    return res.status(401).render('login', { 
      error: 'Contraseña incorrecta' 
    })
  }

  // Login successful
  console.log('Login successful for user:', user)
  req.session.user = {
    name: user.first_name,
    email: user.email
  }

  res.redirect('/profile')
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión')
    }
    // Clear all cookies
    res.clearCookie('user');
    res.clearCookie('location');
    res.clearCookie('connect.sid');
    res.redirect('/login')
  })
})

router.get('/profile', (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/login')
  }
  
  res.render('profile', {
    user: req.session.user
  })
})

export default router
