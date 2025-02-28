import { generateToken } from "../utils/token.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { passport } from "../config/passport/index.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  try {
    const userRole = req.query.userRole;
    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!userName || !userEmail || !userPassword || !userRole) {
      return res.status(500).json({ message: "All fields required to signup" });
    }
    if(userPassword !== confirmPassword){
     return res.status(401).json({message:"Passwords do not match"})
    }
    if (userRole === "admin") {
      return res.status(500).json({ message: "You cannot signup as admin" });
    }
    if (userRole !== "job_seeker" && userRole !== "employer") {
      return res
        .status(500)
        .json({ message: "userRole is not valid to signup" });
    }

    const userExist = await User.findOne({ email: userEmail });

    if (userExist && userExist.role === userRole) {
      return res.status(409).json({
        message: "user already exists with same userRole.Try to Login",
      });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(userPassword, saltRounds);

    const newUser = new User({
      name: userName,
      email: userEmail,
      password: hashedPassword,
      role: userRole,
    });
    await newUser.save();
    const userId = newUser._id;
    const token = generateToken(userId, userRole);
    res.cookie(`token-${userRole}`, token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });
    res.status(200).json({ message: "user created successfully" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};

export const login = async (req, res, next) => {
  try {
    const userRole = req.query.userRole;
    const userEmail = req.body.email;
    const userPassword = req.body.password
    if (!userEmail || !userPassword || !userRole) {
      return res.status(500).json({ message: "all fields required to login" });
    }

    if (!["job_seeker", "employer", "admin"].includes(userRole)) {
      return res.status(500).json({ message: "No valid userRole to login" });
    }

    const user = await User.findOne({ email: userEmail, role: userRole });

    if (!user) {
      return res
        .status(404)
        .json({ message: "no such user exists. Please register" });
    }

    const isPasswordMatch = await bcrypt.compare(userPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "incorrect password. Try again" });
    }
    const userId = user._id;
    const token = generateToken(userId, userRole);
    res.cookie(`token-${userRole}`, token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });

    res.status(200).json({ message: "user login successfull" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};

export const googleSign = (req, res, next) => {
  const userRole = req.params.userRole;

  const state = JSON.stringify({ userRole });

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
    session: false,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    session: false,
  })(req, res, () => {
    if (!req.user) {
      return res.status(500).json({ message: " signup(google) failed" });
    }

    const token = req.user;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userRole = decodedToken.role;

    res.cookie(`token-${userRole}`, token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });

    if (userRole === "employer") {
      return res.redirect(process.env.FE_EMPLOYER);
    }
    if (userRole === "job_seeker") {
      return res.redirect(process.env.FE_SEEKER);
    }
    if (userRole === "admin") {
      return res.redirect(process.env.FE_ADMIN);
    }
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { userEmail, userRole } = req.body;
    console.log(userEmail, userRole);
    const user = await User.findOne({
      email: userEmail,
      role: userRole,
    });

    if (!user) {
      return res
        .status(404)
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

    let resetPasswordURL;
    if (userRole === "job_seeker") {
      resetPasswordURL = `${process.env.FE_SEEKER}/resetPassword/${resetToken}`;
    } else if (userRole === "employer") {
      resetPasswordURL = `${process.env.FE_EMPLOYER}/resetPassword/${resetToken}`;
    } else if (userRole === "admin") {
      resetPasswordURL = `${process.env.FE_ADMIN}/resetPassword/${resetToken}`;
    } else {
      return res.status(500).json({ message: "userRole not found" });
    }
    const subject = "Password Reset Request from Workio";
    const msg =
      "You requested a password reset. Click the link below to reset your password. Then link will expire within 15 mins";
    try {
      await sendEmail(userEmail, subject, msg, resetPasswordURL);
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
    res.status(500).json({ message: "Server error." });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.resetToken;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(409).json({ message: "passwords not matching" });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid or Expired Token" });
    }

    const saltRounds = 10;
    const hashedpassword = bcrypt.hashSync(password, saltRounds);

    user.password = hashedpassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "password reset successfull" });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "password reset failed.try again later",
    });
  }
};

export const checkUser = (req, res, next) => {
  const userRole = req.query.userRole;
  const tokenRole = req.user.role;

  if (userRole !== tokenRole) {
    return res.status(401).json({ message: "user not authorized" });
  }
  return res.status(200).json({ message: "user authorized" });
};
