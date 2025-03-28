import { Applicantion } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";
import { User } from "../models/userModel.js";

// export const allUsers = async (req, res, next) => {
//   try {
//     const role = req.user.role;
//     if (role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "only admin can get fetch all users" });
//     }

//     const users = await User.find({ role: { $ne: "admin" } });

//     if (!users) {
//       return res.status(404).json({ message: "users not found" });
//     }

//     res.status(200).json({ message: "users fetch success", data: users });
//   } catch (err) {
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "users fetch failed. server error" });
//   }
// };

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
        .json({ message: "only admin can get fetch all employers" });
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "only job seekers and employers list can be fetched",
      });
    }

    let filter = {};
    if(role !== "all"){
      filter.role = role
    }
     const usersCount = await User.find(filter).countDocuments()
     const totalPages = Math.ceil(usersCount/usersPerPage)
    const users = await User.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(usersPerPage);

    if (!users) {
      return res.status(404).json({ message: "specific users are not found" });
    }

    res
      .status(200)
      .json({ message: "specific users fetch success", data: {users , totalPages ,usersCount}});
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "specific users fetch failed. server error",
    });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const role = req.user.role;
    const dltUserId = req.params.userId;
    if (role !== "admin") {
      return res.status(403).json({ message: "only admin can delete a user" });
    }
    if (!dltUserId) {
      return res.status(400).json({ message: "user id missing" });
    }

    const dltUser = await User.findById(dltUserId);
    if (!dltUser) {
      return res.status(404).json({ message: "user not found to delete" });
    }

    if (dltUser.role === "job_seeker") {
      await Applicantion.deleteMany({ applicant: dltUserId });
    } else if (dltUser.role === "employer") {
      await Job.deleteMany({ employer: dltUserId });
    }

    await User.findByIdAndDelete(dltUserId);

    res.status(200).json({ message: "user delete success" });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "user delete failed. server error",
    });
  }
};

// export const allJobPosts = async (req, res, next) => {
//   try {
//     const role = req.user.role;
//     if (role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "only admin can get fetch all posts" });
//     }

//     const jobPosts = await Job.find().populate({
//       path: "employer",
//       select: "-password",
//     });

//     if (!jobPosts) {
//       return res.status(404).json({ message: "job posts not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "job posts fetch success", data: jobPosts });
//   } catch (err) {
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "job posts fetch failed. server error" });
//   }
// };

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
        .json({ message: "only admin can get fetch all posts" });
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
      return res.status(404).json({ message: "job posts not found" });
    }

    res
      .status(200)
      .json({ message: "job posts fetch success", data:{ totalPages,jobPosts,jobPostsCount} });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job posts fetch failed. server error" });
  }
};

export const jobDetails = async (req, res, next) => {
  try {
    const role = req.user.role;
    const jobId = req.params.jobId;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const job = await Job.findById(jobId).populate({
      path: "employer",
      select: "-password",
    });

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
    const role = req.user.role;
    const jobId = req.params.jobId;
    if (role !== "admin") {
      return res.status(403).json({ message: "only admin can verify posts" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "job post not found" });
    }

    job.verified = true;
    job.save();

    res.status(200).json({ message: "job verified and approved" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job approval failed. server error" });
  }
};

export const allApplications = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "only admin can get fetch all posts" });
    }

    const applications = await Applicantion.find();

    if (!applications) {
      return res.status(404).json({ message: "job posts not found" });
    }

    res
      .status(200)
      .json({ message: "job posts fetch success", data: applications });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job posts fetch failed. server error" });
  }
};
