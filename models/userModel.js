import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["job_seeker", "employer", "admin"],
      default: "job_seeker",
    },
    profile: {
      title: String,
      skills: [String],
      resume: String,
      company: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
