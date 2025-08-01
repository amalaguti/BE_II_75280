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
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from 'url';
import handlebarsHelpers from 'handlebars-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Handlebars setup with helpers
const hbsEngine = engine();
handlebarsHelpers({ handlebars: hbsEngine.handlebars });
app.engine('handlebars', hbsEngine);
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

// Add /mail route for sending email using nodemailer
app.get('/mail', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amalaguti78@gmail.com',
        pass: process.env.GSMTP
      }
    });

    const mailOptions = {
      from: process.env.GSMTP_FROM,
      to: process.env.GSMTP_TO,
      subject: 'Test Email from Backend II',
      attachments: [
        {
          filename: 'bici.jpg',
          path: path.join(__dirname, '..', 'static', 'bici.jpg')
        }
      ],
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.07);">
          <h2 style="color: #4a90e2; margin-top: 0;">🚀 Backend II - Email Test</h2>
          <p style="font-size: 1.1rem; color: #333;">Hola Adrian,</p>
          <p style="color: #444;">Este es un <b>correo de prueba</b> enviado desde tu aplicación <b>Backend II</b> usando <b>nodemailer</b> y Node.js.</p>
          <ul style="color: #555;">
            <li>Enviado a: <b>${process.env.GSMTP_TO}</b></li>
            <li>Fecha: <b>${new Date().toLocaleString('es-AR')}</b></li>
          </ul>
          <p style="margin-top: 2em; color: #888; font-size: 0.95em;">¡Funciona! 🎉</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
          <div style="text-align: center; color: #aaa; font-size: 0.9em;">Backend II &middot; Coderhouse</div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent', info });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

