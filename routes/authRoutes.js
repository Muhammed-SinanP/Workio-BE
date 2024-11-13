import express from "express";
import { login, logout, signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/forgot-password");
router.put("/reset-password");

export { router as authRouter };
