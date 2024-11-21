import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {
  showJobApplications,
  showMyApplicationDetails,
  showMyApplications,
  showOtherUserProfile,
  showProfile,
  updateApplicationStatus,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/myProfile", userAuth, showProfile);
router.put("/myProfile", userAuth, updateProfile);
router.get("/otherUsers/:userId", userAuth, showOtherUserProfile);

router.get("/myApplications", userAuth, showMyApplications); //seeker
router.get("/myApplications/:jobId", userAuth, showMyApplicationDetails); //seeker

router.get("/applications/:jobId", userAuth, showJobApplications); //employer
router.put("/applications/status/:applicantId", userAuth, updateApplicationStatus); //employer


export { router as userRouter };
