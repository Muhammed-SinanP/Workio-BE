import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { apiRouter } from "./routes/index.js";
import cors from "cors";
import env from "dotenv";
import errorHandler from "./middlewares/errorMiddleware.js";

env.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: [
    process.env.FE_SEEKER,
    process.env.FE_EMPLOYER,
    process.env.FE_ADMIN,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello Hi");
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "end point does not exist" });
});

app.use(errorHandler)
