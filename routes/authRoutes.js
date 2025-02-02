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
import { userAuth } from "../middlewares/userAuth.js";


const router = express.Router();

router.post("/register/:userRole", signup);
router.post("/login/:userRole", login);
router.get("/googleSign/:userRole", googleSign);
router.get("/googleSignIn/callback", googleCallback);
router.post("/logout",userAuth, logout);

router.post("/forgotPassword",forgotPassword);
router.post("/resetPassword/:resetToken",resetPassword);

export { router as authRouter };
