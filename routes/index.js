import express from "express";
import { authRouter } from "./authRoutes.js";
import { userRouter } from "./userRoutes.js";
import { jobRouter } from "./jobRoutes.js";
import { adminRouter } from "./adminRoutes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/job", jobRouter);
router.use("/admin", adminRouter);

export { router as apiRouter };
