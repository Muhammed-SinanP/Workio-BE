import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import {  allApplications, allJobPosts, allUsers, approveJob, deleteJob, deleteUser, jobDetails, specificJobPosts, specificUsers } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users",userAuth,allUsers);
router.get("/users/:userType",userAuth,specificUsers)

router.get("/allJobPosts",userAuth,allJobPosts)
router.get("/allJobPosts/:condition",userAuth,specificJobPosts)
router.get("/jobPost/:jobId",userAuth,jobDetails)
router.put("/jobPost/:jobId",userAuth,approveJob)
router.delete("/jobPost/:jobId",userAuth,deleteJob)

router.get("/allApplications",userAuth,allApplications)

// router.put("/users/:userId");
router.delete("/users/:userId",userAuth,deleteUser);



// router.get("applications");

export { router as adminRouter };
