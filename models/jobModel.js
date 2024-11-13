import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    requirements: [String],
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
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "internship"],
    },
    workModel: {
      type: String,
      enum: ["office", "remote", "hybrid"],
      default: "office",
    },
    company: {
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
