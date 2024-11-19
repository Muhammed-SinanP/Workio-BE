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
      
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken:String,
    resetPasswordTokenExpiry:Date,
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

// Create a composite unique index on email and role
userSchema.index({ email: 1, role: 1 }, { unique: true });





export const User = mongoose.model("User", userSchema);
