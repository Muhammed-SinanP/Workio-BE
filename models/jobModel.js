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
      enum: ["full_time", "part_time", "internship"],
      default:"full_time"
    },
    workModel: {
      type: String,
      enum: ["office", "remote", "hybrid"],
      default: "office",
    },
   employer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    }, 
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);
