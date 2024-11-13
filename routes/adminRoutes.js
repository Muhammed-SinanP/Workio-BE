import express from "express";

const router = express.Router();

router.get("/users");
router.put("/users/:userId");
router.delete("/users/:userId");

router.get("jobs");
router.delete("/jobs/:jobId");

router.get("applications");

export { router as adminRouter };
