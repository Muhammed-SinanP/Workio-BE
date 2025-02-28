import express from "express";
import {
  login,
  signup,
  googleCallback,
  googleSign,
  forgotPassword,
  resetPassword,
  checkUser,
} from "../controllers/authController.js";
import { userAuth } from "../middlewares/userAuth.js";

const router = express.Router();

//localSignIn
router.post("/register", signup);
router.post("/login", login);

//openSignIn
router.get("/googleSign/:userRole", googleSign);
router.get("/googleSignIn/callback", googleCallback);

//password
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

//checkUser
router.get("/checkUser", userAuth, checkUser);

export { router as authRouter };
