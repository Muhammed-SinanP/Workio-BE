import express from "express";
import { authRouter } from "./authRoutes.js";
import { userRouter } from "./userRoutes.js";
import { jobRouter } from "./jobRoutes.js";
import { adminRouter } from "./adminRoutes.js";

const router = express.Router();

router.use("/auth", authRouter); // Authentication Routes
router.use("/user", userRouter); // User Routes
router.use("/job", jobRouter); // Job Management Routes
router.use("/admin", adminRouter); // Admin Routes
router.get("/contact"); // Additional/Utility Routes

export { router as apiRouter };
