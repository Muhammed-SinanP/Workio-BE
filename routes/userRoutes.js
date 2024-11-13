import express from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { showProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", userAuth, showProfile);
router.put("/profile", userAuth, updateProfile);
router.get("/applications", userAuth); //seeker
router.get("/applications/:applicationId");
router.put("/applications/:applicationId/status"); //employer
router.get("/:userId");

export { router as userRouter };
