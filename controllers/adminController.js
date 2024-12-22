import { Applicantion } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";
import { User } from "../models/userModel.js";

export const allUsers = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all users" });
    }

    const users = await User.find({ role: { $ne: "admin" } });


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
    const dltUserId = req.params.userId;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "only admin can delete a user" });
    }
    if (!dltUserId) {
      return res.status(400).json({ message: "user id missing" });
    }

    const dltUser = await User.findById(dltUserId);
    if (!dltUser) {
      return res.status(404).json({ message: "user not found to delete" });
    }

    if(dltUser.role === "job_seeker"){
       await Applicantion.deleteMany({applicant:dltUserId})
    }
    else if(dltUser.role === "employer"){
      await Job.deleteMany({employer:dltUserId})
    }

    dltUser.deleteOne()

    res.status(200).json({ message: "user delete success" });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "user delete failed. server error",
    });
  }
};


export const allJobPosts = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const jobPosts = await Job.find().populate({
      path:"employer",
      select:"-password"
    });

    
    if (!jobPosts) {
      return res.status(404).json({ message: "job posts not found" });
    }

    res.status(200).json({ message: "job posts fetch success", data: jobPosts });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job posts fetch failed. server error" });
  }
};

export const specificJobPosts = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const condition = req.params.condition

    let jobCondition
    if(condition === "pending"){
      jobCondition = false
    }
    else if(condition === "verified"){
      jobCondition = true
    }
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const jobPosts = await Job.find({verified:jobCondition}).populate({
      path:"employer",
      select:"-password"
    });


    if (!jobPosts) {
      return res.status(404).json({ message: "job posts not found" });
    }

    res.status(200).json({ message: "job posts fetch success", data: jobPosts });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job posts fetch failed. server error" });
  }
};


export const allApplications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const applications = await Applicantion.find();


    if (!applications) {
      return res.status(404).json({ message: "job posts not found" });
    }

    res.status(200).json({ message: "job posts fetch success", data: applications });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job posts fetch failed. server error" });
  }
};


export const jobDetails = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const jobId = req.params.jobId
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const job = await Job.findById(jobId).populate({
      path:"employer",
      select:"-password"
    })

    
    if (!job) {
      return res.status(404).json({ message: "job post not found" });
    }

    res.status(200).json({ message: "job post fetch success", data: job });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job post fetch failed. server error" });
  }
};

export const approveJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const jobId = req.params.jobId
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can verify posts" });
    }

    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: "job post not found" });
    }

    job.verified = true
    job.save()

    
    

    res.status(200).json({ message: "job verified and approved" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job approval failed. server error" });
  }
};


export const deleteJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const jobId = req.params.jobId
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can delete post" });
    }

    const job = await Job.findByIdAndDelete(jobId)

    if (!job) {
      return res.status(404).json({ message: "job post not found" });
    }

    

    
    

    res.status(200).json({ message: "job deleted successfully" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job deletion failed. server error" });
  }
};