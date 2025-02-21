import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { allOpenJobs, applyJob, deleteJob, handleSaveJob, JobDetails, myJobPosts, postJob,  searchJobs, updateJob } from "../controllers/jobController.js";

const router = express.Router();

router.get("/allOpen",allOpenJobs);
// router.get("/:companyId/all");
router.post("/search",searchJobs);
router.post("/handleSave",userAuth,handleSaveJob) //for seeker
router.post("/one",userAuth,postJob); //for employer
router.get("/:jobId",JobDetails);
router.post("/apply/:jobId",userAuth,applyJob);

router.get("/jobPosts/myJobPosts",userAuth,myJobPosts)
router.put("/:jobId",userAuth,updateJob); //for employer

router.delete("/:jobId",userAuth,deleteJob); //for admin and employer

export { router as jobRouter };
