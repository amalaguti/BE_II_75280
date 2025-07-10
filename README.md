# Backend II - 75280

A comprehensive Node.js backend application with JWT authentication, MongoDB integration, and role-based access control.

## 🚀 Features

- **JWT Authentication** with Passport.js
- **MongoDB Integration** for persistent data storage
- **Password Hashing** with bcryptjs
- **Role-Based Access Control** (User, Admin, Premium)
- **Shopping Cart System** with MongoDB references
- **Secure httpOnly Cookies** for token storage
- **Express Handlebars** for server-side rendering
- **RESTful API** with comprehensive endpoints

## 📁 Project Structure

```
src/
├── config/
│   └── passport.js          # Passport JWT strategy configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── user.model.js        # User model with cart and role fields
├── routes/
│   ├── auth.router.js       # Authentication endpoints
│   ├── sessions.router.js   # Session management endpoints
│   ├── users.router.js      # User CRUD operations
│   └── views.router.js      # View routes for frontend
├── utils/
│   └── jwt.js               # JWT utility functions
├── views/                   # Handlebars templates
│   ├── current.handlebars   # User profile page
│   ├── home.handlebars      # Home page
│   ├── layouts/
│   │   └── main.handlebars  # Main layout template
│   ├── login.handlebars     # Login form
│   └── register.handlebars  # Registration form
└── app.js                   # Main application file
```

## 🔧 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/profile` | Get user profile (protected) |
| `POST` | `/api/auth/logout` | Logout user |

### Session Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions/current` | Get current session user (protected) |

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users (protected) |

### View Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Home page |
| `GET` | `/users` | Redirects to `/users/login` |
| `GET` | `/users/login` | Login page |
| `GET` | `/users/register` | Registration page |
| `GET` | `/users/current` | Current user profile page (protected) |

## 🗄️ Database Schema

### User Model
```javascript
{
  first_name: String (required, max 100 chars),
  last_name: String (required, max 100 chars),
  email: String (required, max 100 chars, unique, lowercase),
  age: Number (required, min 18, max 120),
  password: String (required, hashed with bcrypt),
  cart: ObjectId (reference to 'carts' collection, default null),
  role: String (enum: ['user', 'admin', 'premium'], default 'user'),
  created_at: Date (default: Date.now),
  updated_at: Date (default: Date.now)
}
```

## 🔐 Authentication & Security

- **JWT Tokens**: 24-hour expiration with HS256 algorithm
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Cookie Security**: httpOnly, sameSite, secure cookies
- **XSS Protection**: httpOnly cookies prevent client-side access
- **CSRF Protection**: sameSite cookie policy
- **Role-Based Access**: User, Admin, Premium roles

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (hosted on MongoDB Atlas)
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **Express Handlebars** - Template engine
- **Cookie Parser** - Cookie handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Environment variables configured

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd repo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set environment variables**:
   ```bash
   export JWT_SECRET=your-secret-key-here
   export MONGODB_USER=your-mongodb-user
   export MONGODB_PASS=your-mongodb-password
   export COOKIE_SECRET=your-cookie-secret
   ```

4. **Seed the database** (optional):
   ```bash
   node seed-database.js
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Test the application**:
   ```bash
   node test-jwt.js
   ```

### Access Points
- **Home**: http://localhost:8080/
- **Login**: http://localhost:8080/users/login
- **Register**: http://localhost:8080/users/register
- **Profile**: http://localhost:8080/users/current (after login)

## 🧪 Testing

The project includes several test files:
- `test-jwt.js` - JWT authentication tests
- `test-age-validation.js` - Age validation tests
- `test-cookies.html` - Cookie functionality tests

## 📝 Recent Updates (v1.0)

### New Features Added:
- ✅ **Enhanced User Model**: Added `cart` and `role` fields
- ✅ **Role-Based System**: User, Admin, Premium roles with visual badges
- ✅ **Shopping Cart Integration**: MongoDB ObjectId references for cart system
- ✅ **Sessions API**: New `/api/sessions/current` endpoint
- ✅ **Enhanced Profile View**: Complete user information display
- ✅ **Improved Security**: Updated passport configuration with new fields
- ✅ **Better UX**: Cleaner profile layout without duplicate information

### Technical Improvements:
- ✅ **Database Integration**: Direct database queries for fresh user data
- ✅ **API Consistency**: Standardized response formats
- ✅ **Error Handling**: Robust fallback mechanisms
- ✅ **Code Organization**: Modular route structure

## 🔒 Security Best Practices

- JWT tokens stored in httpOnly cookies (XSS protected)
- Passwords hashed with bcryptjs (10 salt rounds)
- CSRF protection with sameSite cookies
- Input validation and sanitization
- MongoDB injection protection with Mongoose
- Environment variable configuration
- Secure cookie settings for production

## 📄 License

This project is part of the Backend II course (75280) at Coderhouse.

## 🤝 Contributing

This is an educational project. For questions or issues, please refer to the course materials.

---

**MongoDB**: Hosted by [MongoDB Atlas](https://cloud.mongodb.com/)