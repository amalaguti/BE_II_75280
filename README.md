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
- **Shopping Cart System** with MongoDB references, dynamic stock checks, and full checkout flow
- **Secure httpOnly Cookies** for token storage
- **Purchase confirmation email sent to user (GSMTP_TO) and stock notification to admin (GSMTP_ADMIN) after checkout**
- **Admin can clean up (delete) any user's cart (except admins) from the user management table**
- **Frontend prevents adding more than available stock to cart, updates stock in real time after add/remove/cleanup, and dynamically updates Carrito ID**
- **Cart is deleted from DB after checkout, and user view shows no cart assigned**
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

## 🏛️ Architecture Overview & Design Patterns

This project follows a modular, layered architecture using several well-known design patterns to ensure maintainability, scalability, and security. Here is an overview of the main patterns and how they interact:

### Main Patterns & Responsibilities

| Layer         | Folder         | Example File(s)                | Responsibility                        |
|---------------|---------------|---------------------------------|----------------------------------------|
| **Model**     | models/        | user.model.js                  | DB schema & validation (Mongoose)      |
| **DAO**       | dao/           | user.dao.js                    | DB access abstraction (see below)      |
| **DTO**       | dto/           | user.dto.js                    | API response formatting (see below)    |
| **Controller**| controllers/   | auth.controller.js             | Business logic                         |
| **Router**    | routes/        | auth.router.js, users.router.js| Route definitions                      |
| **Middleware**| middleware/    | auth.js                        | Auth, cross-cutting concerns           |
| **Utils**     | utils/         | jwt.js                         | Helper functions                       |
| **Views**     | views/         | *.handlebars                   | Server-side HTML rendering             |
| **App Entry** | src/           | app.js                         | App setup, middleware, route mounting  |

### How the Layers Interact

- **Routes** receive HTTP requests and delegate to **controllers**.
- **Controllers** handle business logic, using **DAOs** to interact with the database and **DTOs** to format responses.
- **Models** define the database schema and validation.
- **Middleware** (like authentication) is used to protect routes or add cross-cutting logic.
- **Views** are rendered for browser-based clients, while API endpoints return JSON.
- **Utils** provide shared helper logic (e.g., JWT handling).

### Example Flow: User Registration

1. **Route:**  
   `POST /api/auth/register` (in `auth.router.js`)
2. **Controller:**  
   `registerUser` in `auth.controller.js`
3. **DAO:**  
   Calls `userDAO.create()` to save the user.
4. **DTO:**  
   Uses `toUserDTO()` to format the user for the response.
5. **Model:**  
   `user.model.js` validates and saves the user.
6. **Utils:**  
   `generateToken()` creates a JWT for the new user.
7. **Middleware:**  
   Not used for registration, but used for protected routes.

### Benefits
- **Separation of concerns:** Each layer has a single responsibility.
- **Testability:** DAOs and controllers can be tested independently.
- **Security:** DTOs prevent leaking sensitive data.
- **Scalability:** Easy to add new features by following the same structure.
- **Maintainability:** Clear, modular code organization.

> **For more details on DAO and DTO patterns, see the next section.**

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

### Password Recovery (Forgot/Reset Password)

#### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Body:**
```json
{
  "email": "user@example.com"
}
```
**Logic:**
- If the user exists, generates a secure, random token (expires in 1 hour) and stores it in the user document.
- Sends a password reset email (always to `GSMTP_TO` for testing) with a link to `/users/reset-password?token=...`.
- Always responds with a generic success message for privacy.

#### 2. Reset Password Form

**Frontend:**
- The reset link in the email opens `/users/reset-password?token=...`.
- The form allows the user to enter a new password and submits to the backend.

#### 3. Submit New Password

**Endpoint:** `POST /api/auth/reset-password`

**Body:**
```json
{
  "token": "the-token-from-email",
  "newPassword": "newSecurePassword123"
}
```
**Logic:**
- Validates the token (must exist, not expired).
- Checks that the new password is different from the previous one.
- Hashes and updates the password, invalidates the token.
- Responds with success or error.

#### 4. Frontend Flow
- The login page now includes a "¿Olvidaste tu contraseña?" link to `/users/reset-password`.
- The reset password form is styled and provides user feedback.

#### 5. Security Notes
- Reset tokens expire after 1 hour and are invalidated after use.
- Passwords are hashed with bcrypt.
- The new password must be different from the previous password.
- All reset emails are sent to `GSMTP_TO` for testing.

### Admin Role Request Process

#### 1. Requesting Admin Role
- Logged-in users can request admin role from their profile page (via the profile icon menu).
- When requested, the system sends an email to the address defined in the `GSMTP_ADMIN` environment variable.

#### 2. Admin Approval Email
- The email contains user information and two secure links: **ACEPTAR** and **DENEGAR**.
- These links are single-use and expire after 24 hours.
- The links point to `/api/users/approve-admin?token=...` and `/api/users/deny-admin?token=...`.

#### 3. Approving or Denying
- If the admin clicks **ACEPTAR**, the user’s role is updated to `admin` in the database.
- If the admin clicks **DENEGAR**, the request is denied (no role change).

#### 4. Security Notes
- The approval/denial links use a secure JWT token, signed with `JWT_SECRET` and expiring in 24 hours.
- Only the admin email receives the approval links (set `GSMTP_ADMIN` in your `.env`).

#### 5. Environment Variable
```
GSMTP_ADMIN=admin_approver_email@example.com
```

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

## 🛒 Shopping Cart & Checkout Flow

- Users can add products to their cart, but cannot add more than the available stock (considering what's already in their cart).
- After adding to cart, the available stock in the "Productos Disponibles" table is updated immediately.
- When a product is removed from the cart, the stock is restored in the product table.
- When the cart is cleaned up (by admin or after checkout), the product table is refreshed and the Carrito ID is cleared.
- On checkout:
  - The backend checks stock for all items.
  - If all items are available, product stock is decremented, the cart is deleted from the DB, and the user's `cart` reference is cleared.
  - The user receives a purchase confirmation email (to GSMTP_TO for testing).
  - The admin receives a stock reduction notification email (to GSMTP_ADMIN for testing).
  - The frontend updates to show the cart is empty and Carrito ID is no longer shown.
- The cart modal message (e.g., "¡Compra realizada con éxito!") is cleared every time the cart is opened.

## 🛠️ Admin Cart Cleanup

- In the admin user management table, a "Limpiar carrito" button is shown for all users except admins.
- Clicking this button deletes the user's cart from the DB and clears the user's `cart` reference.
- The frontend updates the product table and Carrito ID accordingly.

## 📧 Email Notifications

- **On registration:** Welcome email sent to GSMTP_TO (for testing).
- **On password recovery:** Reset email sent to GSMTP_TO (for testing).
- **On admin role request:** Request/approval/denial emails sent to GSMTP_ADMIN and GSMTP_TO as appropriate.
- **On checkout:**
  - Purchase confirmation sent to GSMTP_TO (user).
  - Stock reduction notification sent to GSMTP_ADMIN (admin).

## 🔄 Frontend Improvements

- Product table disables "Agregar al carrito" if no stock is available (considering cart contents).
- Stock is updated in real time after add/remove/cleanup actions.
- Carrito ID in the user profile updates dynamically after cart creation, checkout, or cleanup.
- Cart modal message is cleared every time the cart is opened.

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
  - Sends a welcome email (with the user's name and lastname) to the configured `GSMTP_TO` address (for testing; see `utils/mail.js`).
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

## 📧 Email Sending Feature

A new `/mail` route is available to test email sending with attachments using nodemailer and Gmail SMTP.

- **Endpoint:** `GET /mail`
- **Description:** Sends a styled HTML email with an attachment (`bici.jpg`) to the configured recipient.
- **Attachment:** The file `bici.jpg` must be placed in the `static/` folder at the project root (i.e., `./static/bici.jpg`).

### Environment Variables Required
Add the following variables to your `.env` file:

```
GSMTP=your-gmail-app-password         # Gmail SMTP password (App Password recommended)
GSMTP_FROM=your_gmail_address@gmail.com  # Sender email address
GSMTP_TO=recipient_email@gmail.com       # Recipient email address
```

- `GSMTP` is the password for your Gmail SMTP (use an App Password, not your regular Gmail password).
- `GSMTP_FROM` is the email address that will appear as the sender.
- `GSMTP_TO` is the recipient's email address.

### Example Usage

To trigger the email, run:

```sh
curl -X GET http://localhost:8080/mail
```

If configured correctly, you will receive an email with a styled HTML body and the `bici.jpg` image attached.

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