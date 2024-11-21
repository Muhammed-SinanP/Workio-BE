import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { allJobs, applyJob, deleteJob, JobDetails, postJob, updateJob } from "../controllers/jobController.js";

const router = express.Router();

router.get("/all",userAuth,allJobs);
// router.get("/:companyId/all");
// router.get("/search");
router.post("/one",userAuth,postJob); //for employer
router.get("/:jobId",userAuth,JobDetails);
router.post("/apply/:jobId",userAuth,applyJob);

router.put("/:jobId",userAuth,updateJob); //for employer

router.delete("/:jobId",userAuth,deleteJob); //for admin and employer

export { router as jobRouter };
