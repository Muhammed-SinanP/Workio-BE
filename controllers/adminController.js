import { User } from "../models/userModel.js";

export const allUsers = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all users" });
    }

    const users = await User.find();

    if (!users) {
      return res.status(404).json({ message: "users not found" });
    }

    res.status(200).json({ message: "users fetch success", data: users });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "users fetch failed. server error" });
  }
};

export const specificUsers = async (req, res, next) => {
  try {
    const roleType = req.params.userType;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all employers" });
    }

    if (roleType !== "employer" && roleType !== "job_seeker") {
      return res.status(403).json({
        message: "only job seekers and employers list can be fetched",
      });
    }

    const users = await User.find({ role: roleType });

    if (!users) {
      return res.status(404).json({ message: "specific users are not found" });
    }

    res
      .status(200)
      .json({ message: "specific users fetch success", data: users });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "specific users fetch failed. server error",
    });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const dltJobId = req.params.userId;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "only admin can delete a user" });
    }
    if (!dltJobId) {
      return res.status(400).json({ message: "user id missing" });
    }

    const dltUser = await User.findByIdAndDelete(dltJobId);
    if (!dltUser) {
      return res.status(404).json({ message: "user not found to delete" });
    }

    res.status(200).json({ message: "user delete success" });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "user delete failed. server error",
    });
  }
};
