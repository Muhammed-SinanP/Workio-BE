import { generateToken } from "../utils/token.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { passport } from "../config/passport/index.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res, next) => {
  try {
    const role = req.params.role;
    
    const { userName, userEmail, userPassword } = req.body;

    if (!userName || !userEmail || !userPassword || !role) {
      return res.status(500).json({ message: "All fields required to signup" });
    }
    if (role === "admin") {
      return res.status(500).json({ message: "You cannot signup as admin" });
    }
    if (role !== "job_seeker" && role !== "employer") {
      return res.status(500).json({ message: "Role is not valid to signup" });
    }

    const userExist = await User.findOne({ email: userEmail });

    if (userExist && userExist.role === role) {
      return res
        .status(409)
        .json({ message: "user already exists with same role.Try to Login" });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(userPassword, saltRounds);

    const newUser = new User({
      name: userName,
      email: userEmail,
      password: hashedPassword,
      role: role,
    });
    await newUser.save();

    const token = generateToken(newUser, role);
    res.cookie('token', token,{
      sameSite:"None",
      secure:true,
      httpOnly:true,
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
    
    
    const role = req.params.role;
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword || !role) {
      return res.status(500).json({ message: "all fields required to login" });
    }

    if (!["job_seeker", "employer", "admin"].includes(role)) {
      return res.status(500).json({ message: "No valid role to login" });
    }

    const user = await User.findOne({ email: userEmail, role: role });

    if (!user) {
      return res
        .status(404)
        .json({ message: "no such user exists. Please register" });
    }

    const isPasswordMatch = await bcrypt.compare(userPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "incorrect password. Try again" });
    }

    const token = generateToken(user, role);
    res.cookie('token', token,{
      sameSite:"None",
      secure:true,
      httpOnly:true,
    });
    
    res.status(200).json({ message: "user login successfull" });
  } catch (err) {
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
    
    session: false,
  })(req, res, () => {
    if (!req.user) {
      return res.status(500).json({ message: " signup(google) failed" });
    }

    const token = req.user;
    res.cookie('token', token,{
      sameSite:"None",
      secure:true,
      httpOnly:true,
    });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);   
    const userRole = decodedToken.role;
    if(userRole==="employer"){
     return res.redirect(process.env.FE_EMPLOYER);
    }
    if(userRole === "job_seeker"){
     return res.redirect(process.env.FE_SEEKER)
    }
    if(userRole === "admin"){
      return res.redirect(process.env.FE_ADMIN)
    }
    
  });

 
};


export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token",{
      sameSite:"None",
      secure:true,
      httpOnly:true
    });
    res.status(200).json({ message: "user logout successfull" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};



export const forgotPassword = async (req, res, next) => {
  try {
    const { userEmail, userRole } = req.body;
    const user = await User.findOne({ email: userEmail, role: userRole });
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

    let resetPasswordURL ;
    if(userRole === "job_seeker"){
      resetPasswordURL = `${process.env.FE_SEEKER}/resetPassword/${resetToken}`
    }
    else if(userRole==="employer"){
      resetPasswordURL = `${process.env.FE_EMPLOYER}/resetPassword/${resetToken}`
    }
    else if(userRole === "admin"){
       resetPasswordURL = `${process.env.FE_ADMIN}/resetPassword/${resetToken}`
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
    const{newPassword,ConfirmNewPassword} = req.body;
    if(newPassword!==ConfirmNewPassword){
      return res.status(401).json({message:"passwords not matching"})
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
    res.status(err.statusCode || 500).json({
      message: err.message || "password reset failed.try again later",
    });
  }
};


