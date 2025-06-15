import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import usersRouter from "./routes/users.router.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 8080;

app.use(json());
app.use(urlencoded({ extended: true }));

// Cookies
app.use(cookieParser(process.env.COOKIE_SECRET))


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.vnuoakk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(uri, {})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log(err);
});

app.get('/set-cookie', (req, res) => {
  // Set a cookie with the name 'user' and the value 'adrian'
  // The cookie is signed and httpOnly
  res.cookie('user', 'adrian', { signed: true, httpOnly: true });
  // Send a response with the message 'Signed cookie set'
  res.send('Signed cookie set');
  console.log('/set-cookie Cookies: ', req.cookies)
  console.log('/set-cookie Signed Cookies: ', req.signedCookies)  
});

app.get("/", (req, res) => {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
    
  res.send("Hello World");
});

app.use("/api/users", usersRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

