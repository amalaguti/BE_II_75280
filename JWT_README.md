# JWT Authentication System

This project has been refactored to use **JSON Web Tokens (JWT)** with **Passport.js** instead of session-based authentication.

## 🚀 Features

- **JWT-based authentication** using Passport.js
- **Password hashing** with bcryptjs
- **MongoDB integration** for persistent user storage
- **Secure httpOnly cookies** for token storage
- **Automatic token validation** on protected routes
- **XSS protection** with httpOnly cookies
- **CSRF protection** with sameSite cookies

## 📁 Project Structure

```
src/
├── config/
│   └── passport.js          # Passport JWT strategy configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.router.js       # Authentication endpoints (login, register, profile)
│   ├── users.router.js      # User CRUD operations
│   └── views.router.js      # View routes for frontend
├── utils/
│   └── jwt.js               # JWT utility functions
└── views/                   # Handlebars templates
    ├── login.handlebars     # Login form with AJAX
    ├── register.handlebars  # Registration form with AJAX
    └── profile.handlebars   # Profile page with JWT validation
```

## 🔧 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/profile` | Get user profile (protected) |
| `POST` | `/api/auth/logout` | Logout user |

### View Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Redirects to `/users/login` |
| `GET` | `/users/login` | Login page |
| `GET` | `/users/register` | Registration page |
| `GET` | `/users/current` | Current user page (protected) |

## 🔐 Authentication Flow

### 1. Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "age": 25,
  "password": "password123"
}

// Response
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "2",
    "name": "John",
    "email": "john@example.com"
  }
}
```

### 2. Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "2", 
    "name": "John",
    "email": "john@example.com"
  }
}
```

### 3. Protected Routes
```javascript
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response
{
  "user": {
    "id": "2",
    "name": "John", 
    "email": "john@example.com"
  }
}
```

## 🛠️ Middleware

### `authenticateJWT`
Protects routes that require authentication:
```javascript
import { authenticateJWT } from '../middleware/auth.js';

router.get('/profile', authenticateJWT, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

### `optionalAuth`
Allows routes to work with or without authentication:
```javascript
import { optionalAuth } from '../middleware/auth.js';

router.get('/profile', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
    res.render('profile', { user: req.user });
  } else {
    // User is not authenticated
    res.redirect('/users');
  }
});
```

## 🔧 Configuration

### Environment Variables
```bash
JWT_SECRET=your-secret-key-here
MONGODB_USER=your-mongodb-user
MONGODB_PASS=your-mongodb-password
COOKIE_SECRET=your-cookie-secret
```

### JWT Settings
- **Expiration**: 24 hours
- **Algorithm**: HS256
- **Token Storage**: httpOnly cookies (server-side, named 'currentUser')
- **Security**: XSS and CSRF protected

## 🧪 Testing

Run the test script to verify JWT functionality:
```bash
node test-jwt.js
```

## 🔄 Migration from Sessions

### What Changed
- ❌ Removed `express-session` and `connect-mongo`
- ✅ Added `passport`, `passport-jwt`, `jsonwebtoken`, `bcryptjs`
- ❌ Removed session-based authentication
- ✅ Added JWT-based authentication with httpOnly cookies
- ❌ Removed server-side session storage
- ✅ Added secure cookie-based token storage

### Benefits
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across multiple server instances
- **Secure**: XSS and CSRF protection with httpOnly cookies
- **Automatic**: Cookies sent with every request automatically
- **Production-ready**: Secure by default

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export JWT_SECRET=your-secret-key
   export MONGODB_USER=your-mongodb-user
   export MONGODB_PASS=your-mongodb-password
   ```

3. **Seed the database** (optional):
   ```bash
   node seed-database.js
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Test the API**:
   ```bash
   node test-jwt.js
   ```

6. **Access the web interface**:
   - Home: http://localhost:8080/
   - Login: http://localhost:8080/users/login
   - Register: http://localhost:8080/users/register
   - Current User: http://localhost:8080/users/current (after login)

## 🔒 Security Notes

- JWT tokens are stored in httpOnly cookies (XSS protected)
- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire after 24 hours
- CSRF protection enabled with sameSite cookies
- Always use HTTPS in production (set secure: true)
- Consider implementing token refresh mechanism for production use 

// Server sets secure cookie
res.cookie('currentUser', token, { httpOnly: true });

// Passport extracts token from cookies
jwtFromRequest: (req) => {
  return req.cookies.currentUser; // Server can read it
}

// This will NOT show the JWT token
console.log(document.cookie); // JWT token is hidden! 