import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes/index.js";

connectDB();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())



app.get("/", (req, res) => {
  res.send("Hello Hi");
});

app.use('/api',apiRouter);

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "end point does not exist" });
});
