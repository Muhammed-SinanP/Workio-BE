import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    minExperience:Number,
    requirements: String,
    sallaryRange: {
      min: Number,
      max: Number,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: String,
      country: String,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship"],
      default:"Full-time"
    },
    workModel: {
      type: String,
      enum: ["Office", "Remote", "Hybrid"],
      default: "Office",
    },
   employer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    }, 
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);
