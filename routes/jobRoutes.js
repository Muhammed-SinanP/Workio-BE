import express from "express";
import {
  allOpenJobs,
  JobDetails,
  searchJobs,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/search", searchJobs);
router.get("/allOpen", allOpenJobs);
router.get("/:jobId", JobDetails);

export { router as jobRouter };
