import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    role: {
      type: String,
      enum: ["job_seeker", "employer", "admin"],
      default: "job_seeker",
    },
    profile: {
      name: String,
      email: String,
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

// Sync name and email to the profile section
userSchema.pre("save", function (next) {
  this.profile.name = this.name;
  this.profile.email = this.email;
  next();
});

export const User = mongoose.model("User", userSchema);
