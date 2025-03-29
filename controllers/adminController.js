import { Applicantion } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";
import { User } from "../models/userModel.js";

export const specificUsers = async (req, res, next) => {
  try {
    const role = req.params.role;
    const userRole = req.user.role;
    const sortField = req.query.sortCriteria === "name" ? "name" : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const pageNo = parseInt(req.query.pageNo, 10);
    const usersPerPage = parseInt(req.query.usersPerPage, 10);
    const skip = (pageNo - 1) * usersPerPage;

    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can get fetch users list" });
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "only job seekers and employers list can be fetched.",
      });
    }

    let filter = {};
    if (role !== "all") {
      filter.role = role;
    }
    const usersCount = await User.find(filter).countDocuments();
    const totalPages = Math.ceil(usersCount / usersPerPage);
    const users = await User.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(usersPerPage);

    if (!users) {
      return res.status(404).json({ message: "Users list not found." });
    }

    res.status(200).json({
      message: "Users list fetch success.",
      data: { users, totalPages, usersCount },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const role = req.user.role;
    const dltUserId = req.params.userId;
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can remove a user." });
    }
    if (!dltUserId) {
      return res
        .status(404)
        .json({ message: "User id is missing to remove user." });
    }

    const dltUser = await User.findById(dltUserId);
    if (!dltUser) {
      return res.status(404).json({ message: "User not found to remove." });
    }

    if (dltUser.role === "job_seeker") {
      await Applicantion.deleteMany({ applicant: dltUserId });
    } else if (dltUser.role === "employer") {
      await Job.deleteMany({ employer: dltUserId });
    }

    await User.findByIdAndDelete(dltUserId);

    res.status(200).json({ message: "User removed successfully." });
  } catch (err) {
    next(err);
  }
};

export const specificJobPosts = async (req, res, next) => {
  try {
    const sortField = req.query.sortCriteria === "name" ? "title" : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const pageNo = parseInt(req.query.pageNo, 10);
    const jobsPerPage = parseInt(req.query.jobsPerPage, 10);
    const skip = (pageNo - 1) * jobsPerPage;

    const role = req.user.role;
    const verification = req.params.verification;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin is allowed to fetch details." });
    }

    let filter = {};
    if (verification === "pending") {
      filter.verified = false;
    } else if (verification === "verified") {
      filter.verified = true;
    }
    const jobPostsCount = await Job.find(filter).countDocuments();
    const totalPages = Math.ceil(jobPostsCount / jobsPerPage);

    const jobPosts = await Job.find(filter)
      .populate({
        path: "employer",
        select: "-password",
      })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(jobsPerPage);

    if (!jobPosts) {
      return res.status(404).json({ message: "Job posts not found." });
    }

    res.status(200).json({
      message: "Job posts fetch success.",
      data: { totalPages, jobPosts, jobPostsCount },
    });
  } catch (err) {
    next(err);
  }
};

export const approveJob = async (req, res, next) => {
  try {
    const role = req.user.role;
    const jobId = req.params.jobId;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can verify job post." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job post not found." });
    }

    job.verified = true;
    job.save();

    res.status(200).json({ message: "Job verified and approved." });
  } catch (err) {
    next(err);
  }
};

export const allApplications = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can get fetch all applications" });
    }

    const applications = await Applicantion.find();

    if (!applications) {
      return res.status(404).json({ message: "Applications not found." });
    }

    res
      .status(200)
      .json({ message: "job posts fetch success", data: applications });
  } catch (err) {
    next(err);
  }
};
