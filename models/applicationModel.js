import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
    },
    applicant: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["applied", "in_review", "accepted", "rejected"],
      default: "applied",
    },
    coverLetter: String,
  },
  { timestamps: true }
);

export const Applicantion = mongoose.model("Application", applicationSchema);
