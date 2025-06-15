import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import usersRouter from "./routes/users.router.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import { engine } from 'express-handlebars';


const PORT = 8080;
const ADMIN_USERS = ['admin', 'adrian'];
const MONGO_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.vnuoakk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Cookies
app.use(cookieParser(process.env.COOKIE_SECRET))

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 3600,
    autoRemove: 'native'
  })
}))



mongoose.connect(MONGO_URI, {})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log(err);
});

app.get('/set-cookies', (req, res) => {
  // Set a cookie with the name 'user' and the value 'adrian'
  // The cookie is signed and httpOnly
  res.cookie('user', 'adrian', { signed: true, httpOnly: true });
  // Send a response with the message 'Signed cookie set'
  res.cookie('location', 'Argentina', {});
  res.send('Signed and not signed cookies set');
});

app.get('/get-cookies', (req, res) => {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
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

app.get('/session', (req, res) => {
  req.session.user = req.signedCookies.user || 'anonymous';
  req.session.location = req.cookies.location || 'unknown';
  // res.send('Session set');
  if (req.session.counter) {
    req.session.counter++;
  } else {
    req.session.counter = 1;
  }
  console.log(req.session);
  res.send(`Session: ${req.session.counter}, user: ${req.session.user}, location: ${req.session.location}`);
});

app.get('/remove-admin', (req, res) => {
  delete req.session.admin;
  res.send('Admin property removed from session');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('user');
  res.clearCookie('location');
  res.clearCookie('connect.sid');
  res.send('Session and cookies destroyed');
});

app.get('/login', (req, res) => {
  const { username, password } = req.query;
  if (username === 'admin' && password === '123456') {
    req.session.user = username;
    req.session.admin = true;
    res.cookie('user', username, { signed: true, httpOnly: true });
    res.cookie('location', 'Argentina', {});
    res.send('Login successful');
  } else {
    delete req.session.admin;
    res.send('Login failed');
  }
});

function auth(req, res, next) {
  console.log(req.session);
  if (req.session?.admin && ADMIN_USERS.includes(req.session?.user)) {
    next();
  } else {
    res.status(401).send('Access denied');
  }
}

app.get('/admin', auth, (req, res) => {
  res.send('Admin page');
});

app.get('/check-sessions', async (req, res) => {
  try {
    const sessions = await mongoose.connection.db.collection('sessions').find().toArray();
    res.json({
      totalSessions: sessions.length,
      sessions: sessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {    
  // res.send("Hello World");
  res.render('home')
});

app.use("/api/users", usersRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

