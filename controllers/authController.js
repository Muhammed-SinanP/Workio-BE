import { generateToken } from "../utils/token.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";


export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(500).json({ message: "all fields required" });
    }

    const userExist = await User.findOne({ email: email });
    console.log(userExist)
    if (userExist) {
      return res.status(500).json({ message: "user already exists. Login" });
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
    res.cookie("cookie", token);
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
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(500).json({ message: "all fields required" });
    }

    const userExist =await User.findOne({ email: email });
    if (!userExist) {
      return res.status(500).json({ message: "no such user exists" });
    }

    const isPasswordMatch = bcrypt.compare(password, userExist.password);

    if (!isPasswordMatch) {
      return res.status(500).json({ message: "incorrect password" });
    }

    const token = generateToken(userExist, "job_seeker");
    res.cookie("token", token);

    res.status(200).json({ message: "user login successfull" });
  } catch (err) {
    console.log(err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
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
