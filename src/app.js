import express, { json, urlencoded } from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 8080;

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.t3lllk7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(uri, {})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log(err);
});