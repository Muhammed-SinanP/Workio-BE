import mongoose, { Mongoose } from "mongoose";

const saveListSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const SaveList = mongoose.model("SaveList",saveListSchema)
