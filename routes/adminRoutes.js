import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {
  allApplications,
  approveJob,
  deleteUser,
  jobDetails,
  specificJobPosts,
  specificUsers,
} from "../controllers/adminController.js";
import { deleteJob } from "../controllers/userController.js";

const router = express.Router();

//users
router.get("/users/:role", userAuth, specificUsers);
router.delete("/users/:userId", userAuth, deleteUser);

//posts
router.get("/jobPosts/:verification", userAuth, specificJobPosts);
router.get("/jobPost/:jobId", userAuth, jobDetails);
router.put("/jobPost/:jobId", userAuth, approveJob);
router.delete("/jobPost/:jobId", userAuth, deleteJob);

//applications
router.get("/allApplications", userAuth, allApplications);

export { router as adminRouter };
