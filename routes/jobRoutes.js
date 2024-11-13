import express from "express";

const router = express.Router();

router.get("/all");
router.get("/:companyId/all");
router.get("/search");
router.post("/one"); //for employer
router.get("/:jobId");
router.post("/:jobId/apply");
router.put("/:jobId"); //for employer
router.get("/:jobId/applications"); //for employer
router.delete("/:jobId"); //for admin and employer

export { router as jobRouter };
