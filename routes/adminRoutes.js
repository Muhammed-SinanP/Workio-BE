import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {
  allApplications,
  allJobPosts,
  allUsers,
  approveJob,
  deleteUser,
  jobDetails,
  specificJobPosts,
  specificUsers,
} from "../controllers/adminController.js";
import { deleteJob } from "../controllers/userController.js";

const router = express.Router();

//users
router.get("/users", userAuth, allUsers);
router.get("/users/:userType", userAuth, specificUsers);
router.delete("/users/:userId", userAuth, deleteUser);

//posts
router.get("/allJobPosts", userAuth, allJobPosts);
router.get("/allJobPosts/:verification", userAuth, specificJobPosts);
router.get("/jobPost/:jobId", userAuth, jobDetails);
router.put("/jobPost/:jobId", userAuth, approveJob);
router.delete("/jobPost/:jobId", userAuth, deleteJob);

//applications
router.get("/allApplications", userAuth, allApplications);

export { router as adminRouter };
