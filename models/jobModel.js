import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    minExperience:Number,
    requirements: Array,
    salaryRange: {
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
      enum: ["full-time", "part-time", "internship"],
      default:"full-time"
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
      default: "Open",
    },
    verified:{
      type:Boolean,
      default:false,
    }
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);
