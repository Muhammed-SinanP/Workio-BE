import mongoose from "mongoose";
import env from "dotenv";

env.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected successfully");
  } catch (err) {
    console.log(err, "DB connection failed");
  }
};

export default connectDB;
