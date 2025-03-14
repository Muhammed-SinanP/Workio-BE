import express from "express";
import {
  allOpenJobs,
  allOpenJobTitles,
  JobDetails,
  searchJobs,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/search", searchJobs);
router.get("/allOpenJobs", allOpenJobs);
router.get("/availableJobTitles",allOpenJobTitles)
router.get("/:jobId", JobDetails);

export { router as jobRouter };
