import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import usersRouter from "./routes/users.router.js";
import cookieParser from "cookie-parser";
import session from "express-session";


const app = express();
const PORT = 8080;

app.use(json());
app.use(urlencoded({ extended: true }));

// Cookies
app.use(cookieParser(process.env.COOKIE_SECRET))

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}))


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.vnuoakk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(uri, {})
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

app.get("/", (req, res) => {    
  res.send("Hello World");
});

app.use("/api/users", usersRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

