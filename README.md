# Backend II - 75280

A comprehensive Node.js backend application with JWT authentication, MongoDB integration, and role-based access control.

---

**Environment Variables Setup (now using dotenv)**

This project now uses [dotenv](https://www.npmjs.com/package/dotenv) to manage environment variables. You no longer need to use `direnv` or manually export variables in your shell.

1. **Create a `.env` file** in the `BE_II_75280` directory with the following content (example):

```
MONGODB_USER=your-mongodb-user
MONGODB_PASS=your-mongodb-password
COOKIE_SECRET=your-cookie-secret
SESSION_SECRET=your-session-secret
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

2. **Do not commit your `.env` file to version control.** It is already included in `.gitignore`.

---

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

## 🏗️ Architecture Patterns: DAO & DTO

### Data Access Object (DAO)
- **What:** Encapsulates all database access logic for a given model.
- **Why:** Keeps controllers clean and decouples business logic from data access. Makes it easy to swap databases or add caching.
- **Where:** See `src/dao/user.dao.js`. All user-related DB operations are performed through this DAO.
- **Pattern:** In this project, DAOs are implemented as plain objects (the most common Node.js/Mongoose style). Use a class if you need state, inheritance, or extensibility.

### Data Transfer Object (DTO)
- **What:** Defines the shape of data sent to the client, ensuring sensitive fields (like passwords) are never exposed.
- **Why:** Keeps API responses consistent, secure, and decoupled from the database schema.
- **Where:** See `src/dto/user.dto.js`. All user data sent in API responses is formatted using the DTO.
- **Pattern:** The `toUserDTO(user)` function is used in all controllers before sending user data in responses.

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

## 🛣️ Route Logic & Usage

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
- **Purpose:** Register a new user.
- **Input:** `{ first_name, last_name, email, age, password }` (all required)
- **Logic:**
  - Validates all fields are present.
  - Validates `age` is between 18 and 120.
  - Checks if the email is already registered (case-insensitive).
  - Hashes the password with bcryptjs.
  - Creates a new user in MongoDB.
  - Generates a JWT token and sets it in an httpOnly cookie (`currentUser`).
- **Output:**
  - `201 Created` with `{ message, user: userDTO }` on success (see DTO section).
  - `400 Bad Request` for missing fields, invalid age, or duplicate email.
  - `500 Internal Server Error` for unexpected errors.

#### POST `/api/auth/login`
- **Purpose:** Authenticate a user and start a session.
- **Input:** `{ email, password }`
- **Logic:**
  - Finds user by email (case-insensitive).
  - Compares password with stored hash using bcryptjs.
  - On success, generates a JWT token and sets it in an httpOnly cookie (`currentUser`).
- **Output:**
  - `200 OK` with `{ message, user: userDTO }` on success (see DTO section).
  - `401 Unauthorized` for invalid credentials.
  - `500 Internal Server Error` for unexpected errors.

#### GET `/api/auth/profile`
- **Purpose:** Get the authenticated user's profile.
- **Auth:** Requires valid JWT (httpOnly cookie).
- **Logic:**
  - Fetches user from MongoDB by ID (from JWT).
  - Excludes password from the result.
- **Output:**
  - `200 OK` with `{ user: userDTO }` on success (see DTO section).
  - `404 Not Found` if user does not exist.
  - `401 Unauthorized` if not authenticated.

#### POST `/api/auth/logout`
- **Purpose:** Log out the user.
- **Logic:**
  - Clears the `currentUser` httpOnly cookie.
- **Output:**
  - `200 OK` with `{ message }`.

---

### User Routes (`/api/users`)

#### GET `/api/users`
- **Purpose:** Get all users.
- **Logic:**
  - Fetches all users from MongoDB.
- **Output:**
  - `200 OK` with array of user DTOs (see DTO section).
  - `500 Internal Server Error` for DB errors.

#### POST `/api/users`
- **Purpose:** Create a new user (basic, not for registration).
- **Input:** `{ first_name, last_name, email }` (all required)
- **Logic:**
  - Validates required fields.
  - Creates a new user in MongoDB.
- **Output:**
  - `201 Created` with user DTO (see DTO section).
  - `400 Bad Request` for missing fields.
  - `500 Internal Server Error` for DB errors.

#### PUT `/api/users/:uid`
- **Purpose:** Update an existing user.
- **Input:** URL param `uid`, body `{ first_name, last_name, email }`
- **Logic:**
  - Validates required fields.
  - Updates user in MongoDB by ID.
- **Output:**
  - `200 OK` with updated user DTO (see DTO section).
  - `404 Not Found` if user does not exist.
  - `400 Bad Request` for missing fields.
  - `500 Internal Server Error` for DB errors.

#### DELETE `/api/users/:uid`
- **Purpose:** Delete a user by ID.
- **Input:** URL param `uid`
- **Logic:**
  - Deletes user from MongoDB by ID.
- **Output:**
  - `200 OK` with success message and deleted user DTO (see DTO section).
  - `404 Not Found` if user does not exist.
  - `500 Internal Server Error` for DB errors.

---

### Sessions Route (`/api/sessions/current`)
- **Purpose:** Get the current authenticated user's session info.
- **Auth:** Requires valid JWT (httpOnly cookie).
- **Logic:**
  - Fetches user from MongoDB by ID (from JWT).
  - Excludes password from the result.
- **Output:**
  - `200 OK` with `{ user: userDTO }` on success (see DTO section).
  - `404 Not Found` if user does not exist.
  - `401 Unauthorized` if not authenticated.

---

### View Routes (`/users`)
- **GET `/users/login`**: Renders login page. If already logged in, shows a message.
- **GET `/users/register`**: Renders registration page. If already logged in, redirects to profile.
- **GET `/users/current`**: Renders profile page. If not logged in, redirects to login. Fetches fresh user data from DB.

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

## 🌐 CORS Policy

- **What:** CORS (Cross-Origin Resource Sharing) controls which origins can make requests to your API.
- **How:** Configured in `src/app.js` using the `cors` middleware.
- **Default:** Only requests from `http://localhost:8081` (or whichever origin is set in the code) are allowed.
- **To change allowed origins:** Edit the `origin` property in the `cors` middleware setup in `app.js`.
- **Note:** CORS only affects cross-origin JavaScript requests (fetch/AJAX); direct browser navigation is always allowed.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- **.env file configured (see above)**

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

3. **Set environment variables:**
   - Create a `.env` file as described above. (No need to use `direnv`.)

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