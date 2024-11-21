import express from "express";
import {
  login,
  logout,
  signup,
  googleCallback,
  googleSign,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signUp/:role", signup);
router.post("/login/:role", login);
router.get("/googleSign/:role", googleSign);
router.get("/googleSignIn/callback", googleCallback);
router.post("/logout", logout);
router.post("/forgotPassword",forgotPassword);
router.post("/resetPassword/:resetToken",resetPassword);

export { router as authRouter };
