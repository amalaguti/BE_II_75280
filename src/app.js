import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import { engine } from 'express-handlebars';
import cors from "cors";

import authRouter from './routes/auth.router.js'
import viewsRouter from './routes/views.router.js'
import './config/passport.js'

const PORT = 8080;
const ADMIN_USERS = ['admin', 'adrian'];
const MONGO_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.vnuoakk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const app = express();

app.use(cors({ origin: 'http://localhost:8080' })); // Only allow requests from http://localhost:8080
app.use(json());
app.use(urlencoded({ extended: true }));

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Cookies (keeping for other purposes, not sessions)
app.use(cookieParser(process.env.COOKIE_SECRET))

// Passport middleware
app.use(passport.initialize());

mongoose.connect(MONGO_URI, {})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log(err);
});

// Cookie examples (keeping for reference)
app.get('/set-cookies', (req, res) => {
  res.cookie('user', 'adrian', { signed: true, httpOnly: true });
  res.cookie('location', 'Argentina', {});
  res.send('Signed and not signed cookies set');
});

app.get('/get-cookies', (req, res) => {
  console.log('Cookies: ', req.cookies)
  console.log('Signed Cookies: ', req.signedCookies)
  res.send({
    cookies: req.cookies,
    signedCookies: req.signedCookies
  });
});

app.get('/delete-cookies', (req, res) => {
  res.clearCookie('user');
  res.clearCookie('location');
  res.send('Cookies deleted');
});

// Admin route with JWT authentication
function auth(req, res, next) {
  if (req.user && ADMIN_USERS.includes(req.user.name)) {
    next();
  } else {
    res.status(401).send('Access denied');
  }
}

app.get('/admin', passport.authenticate('jwt', { session: false }), auth, (req, res) => {
  res.send('Admin page');
});

app.get("/", (req, res) => {    
  res.render('home')
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

// View routes
app.use('/users', viewsRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

