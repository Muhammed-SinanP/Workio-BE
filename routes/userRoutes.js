import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {
  allSavedJobs,
  applyJob,
  changePassword,
  deleteAccount,
  deleteJob,
  handleSaveJob,
  jobPosts,
  logout,
  postJob,
  removeRejectedApplications,
  removeResume,
  showJobApplications,
  showMyApplications,
  showProfile,
  updateApplicationStatus,
  updateJob,
  updateProfile,
  uploadResume,
} from "../controllers/userController.js";

import multer from "multer"
import { JobDetails } from "../controllers/jobController.js";

const upload = multer({dest:"uploads/"})

const router = express.Router();

//all
router.get("/myProfile", userAuth, showProfile);
router.put("/myProfile", userAuth, updateProfile);
router.post("/logout", userAuth, logout);
router.post("/changeMyPassword",userAuth,changePassword)
router.delete("/deleteMyAccount",userAuth,deleteAccount,logout)

//job_seeker
router.post("/uploadResume",userAuth,upload.single("resume"),uploadResume)
router.delete("/removeResume",userAuth,removeResume)
router.post("/apply/:jobId",userAuth,applyJob);
router.get("/myApplications", userAuth, showMyApplications);
router.delete("/myApplications/removeRejected",userAuth, removeRejectedApplications)
router.get("/mySavedJobs",userAuth,allSavedJobs)
router.post("/handleSave",userAuth,handleSaveJob)

//employer
router.post("/postAJob", userAuth, postJob);
router.get("/myJobPosts",userAuth,jobPosts)
router.put("/myJobPosts/:jobId",userAuth,updateJob); 
router.delete("/myJobPosts/:jobId",userAuth,deleteJob);
router.get("/jobApplications/:jobId", userAuth, showJobApplications);
router.put("/jobApplications/status/:jobId", userAuth, updateApplicationStatus);
 
// router.get("/myApplications/:jobId", userAuth, showMyApplicationDetails); //seeker

export { router as userRouter };
