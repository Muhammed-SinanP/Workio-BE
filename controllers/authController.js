import { generateToken } from "../utils/token.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { passport } from "../config/passport/index.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

export const signup = async (req, res, next) => {
  try {
    const role = req.params.role;
    const { name, email, password } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(500).json({ message: "All fields required to signup" });
    }
    if (role === "admin") {
      return res.status(500).json({ message: "You cannot signup as admin" });
    }
    if (role !== "job_seeker" && role !== "employer") {
      return res.status(500).json({ message: "Role is not valid to signup" });
    }

    const userExist = await User.findOne({ email: email });

    if (userExist && userExist.role === role) {
      return res
        .status(500)
        .json({ message: "user already exists with same role.Try to Login" });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    });
    await newUser.save();

    const token = generateToken(newUser, role);
    res.cookie("token", token);
    res.status(200).json({ message: "user created successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};

export const login = async (req, res, next) => {
  try {
    const role = req.params.role;
    const { email, password } = req.body;

    if (!email || !password || !role) {
      return res.status(500).json({ message: "all fields required to login" });
    }

    if (!["job_seeker", "employer", "admin"].includes(role)) {
      return res.status(500).json({ message: "No valid role to login" });
    }

    const user = await User.findOne({ email: email, role: role });

    if (!user) {
      return res
        .status(500)
        .json({ message: "no such user exists. Please register" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(500).json({ message: "incorrect password. Try again" });
    }

    const token = generateToken(user, role);
    res.cookie("token", token);
    res.status(200).json({ message: "user login successfull" });
  } catch (err) {
    console.log(err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};

export const googleSign = (req, res, next) => {
  const role = req.params.role;
 
  
  const state = JSON.stringify({ role });

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
    session: false,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/failed",
    session: false,
  })(req, res, () => {
    if (!req.user) {
      return res
        .status(500)
        .json({ message: " signup(google) failed" });
    }

    const token = req.user;
    res.cookie("token", token);
    res.redirect("/");
  });
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "user logout successfull" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email: email, role: role });
    if (!user) {
      return res
        .status(500)
        .json({ message: "No such user exists to reset the password" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 15;

    await user.save();

    const resetPasswordURL = `myfrontend/resetPassword/${resetToken}`;
    const subject = "Password Reset Request from Workio";
    const msg =
      "You requested a password reset. Use the link below to reset your password";
    try {
      await sendEmail(email, subject, msg, resetPasswordURL);
      res.status(200).json({ message: "Password reset email sent." });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;

      await user.save();

      return res
        .status(500)
        .json({ message: "error sending reset password email" });
    }
  } catch (err) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.password;

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(500).json({ message: "Invalid or Expired Token" });
    }

    const saltRounds = 10;
    const hashedNewPassword = bcrypt.hashSync(newPassword, saltRounds);

    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "password reset successfull" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({
        message: err.message || "password reset failed.try again later",
      });
  }
};
