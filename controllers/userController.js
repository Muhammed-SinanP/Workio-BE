import { Applicantion } from "../models/applicationModel.js";
import { User } from "../models/userModel.js";
import { Job } from "../models/jobModel.js";
import bcrypt from "bcrypt";
import { SaveList } from "../models/saveListModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

//all
export const showProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userProfile = await User.findById(userId).select("profile");

    if (!userProfile) {
      return res.status(404).json({ message: "profile not found" });
    }

    res
      .status(200)
      .json({ message: "fetch my user profile success", data: userProfile });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "fetch my user profile faled" });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    
    
    const userId = req.user.id;
    const { userName, userEmail, resumeURL,companyName } = req.body;
    const updateProfile = await User.findById(userId);

    if (!updateProfile) {
      return res
        .status(404)
        .json({ message: "User profile not found to update" });
    }

    updateProfile.name = userName;
    updateProfile.email = userEmail;
    updateProfile.profile.resume = resumeURL;
    updateProfile.profile.company = companyName;
    // updateProfile.profile.title = title;
    // updateProfile.profile.skills = skills;

    // updateProfile.profile.company = company;

    await updateProfile.save();

    res
      .status(200)
      .json({ message: "profile update successfull", data: updateProfile });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "profile update failed" });
  }
};
export const logout = async (req, res, next) => {
  try {
    const userRole = req.user.role;

    res.clearCookie(`token-${userRole}`, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });
    res.status(200).json({ message: "user logout successfull" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password, newPassword, confirmNewPassword } = req.body;
    if (!userId) {
      return res.status(404).json({ message: "user id not found" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "password mismatch" });
    }
    if (password === newPassword) {
      return res
        .status(400)
        .json({ message: "current and new passwords can't be same" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "no user found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "incorrect password. Try again" });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "password change success" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "password change failed" });
  }
};
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    if (!userId) {
      return res.status(404).json({ message: "no user id found to delete" });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "no such user found to delete" });
    }
    if (userRole === "employer") {
      const deleteJobs = await Job.deleteMany({ employer: userId });
    }

    if (userRole === "job_seeker") {
      const deleteApplications = await Applicantion.deleteMany({
        applicant: userId,
      });
    }

    res.clearCookie("token", {
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });
    next();
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "account delete failed" });
  }
};

//job_seeker
export const uploadResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ message: "User id not found" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileSize = req.file.size / (1024 * 1024); // Convert bytes to MB
    if (fileSize > 5) {
      fs.unlinkSync(req.file.path); // Delete temp file
      return res
        .status(413)
        .json({ success: false, message: "File too large (Max: 5MB)" });
    }

    const user = await User.findById(userId);
    const resumeURL = user.profile.resume;
    if (resumeURL) {
      const publicId = resumeURL.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
      await cloudinary.uploader.destroy(`resumes/${publicId}`);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "resumes",
    });

    const newResumeURL = result.url;

    fs.unlinkSync(req.file.path); // Delete temp file
    user.profile.resume = newResumeURL;
    await user.save();
    res.status(200).json({ message: "Resume uploaded", data: newResumeURL });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message || "Resume upload failed" });
  }
};
export const removeResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ message: "user id not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resumeURL = user.profile.resume;
    if (resumeURL) {
      const publicId = resumeURL.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`resumes/${publicId}`);
    }
    user.profile.resume = "";
    await user.save();
    res.status(200).json({ message: "Resume removed successfully." });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Resume removal failed",
    });
  }
};
export const applyJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const jobId = req.params.jobId;

    if (!userId || !userRole || !jobId) {
      return res
        .status(401)
        .json({ message: "fields required to apply is missing" });
    }
    if (userRole !== "job_seeker") {
      return res.status(403).json({ message: "only job seeker can apply" });
    }
    const jobExist = await Job.findById(jobId);
    if (!jobExist) {
      return res.status(404).json({ message: "no such job found" });
    }

    const applicationExist = await Applicantion.findOne({
      job: jobId,
      applicant: userId,
    });
    if (applicationExist) {
      return res.status(403).json({ message: "already applied once" });
    }
    const newApplication = new Applicantion({
      job: jobId,
      applicant: userId,
    });
    await newApplication.save();

    res
      .status(200)
      .json({ message: "application sent success", data: newApplication });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "application sent failed" });
  }
};
export const showMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const sortField = req.query.sortCriteria;
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const rowsPerPage = parseInt(req.query.rowsPerPage, 10);
    const pageNo = parseInt(req.query.pageNo, 10);
    const skip = (pageNo - 1) * rowsPerPage;
    const status = req.query.status;

    const filter = {
      applicant: userId,
    };
    if (status && status.length > 0) {
      filter.status = status;
    }

    if (userRole !== "job_seeker") {
      return res
        .status(403)
        .json({ message: "only jobseeker can view their applications" });
    }

    const applications = await Applicantion.find(filter)
      .select("-applicant -updatedAt")
      .populate({
        path: "job",
        select: "title",
        populate: {
          path: "employer",
          select: "name",
        },
      });

    if (sortField === "name") {
      applications.sort(
        (a, b) => a.job.title.localeCompare(b.job.title) * sortOrder
      );
    } else {
      applications.sort(
        (a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder
      );
    }

    if (!applications) {
      return res.status(404).json({ message: "No applications found" });
    }
    const totalApplications = await Applicantion.find(filter).countDocuments();

    const totalPages = Math.ceil(totalApplications / rowsPerPage);

    const filteredApplications = await applications.slice(
      skip,
      skip + rowsPerPage
    );

    res.status(200).json({
      message: "fetch my applications successfull",
      data: {
        filteredApplications,
        totalPages,
      },
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "fetch my applications failed" });
  }
};
export const removeRejectedApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filter = {
      applicant: userId,
      status: "rejected",
    };

    const removedApplications = await Applicantion.deleteMany(filter);

    if (removedApplications.deletedCount > 0) {
      return res
        .status(200)
        .json({ message: "remove rejected applications successfull" });
    } else {
      return res
        .status(404)
        .json({ message: "No applications found to delete" });
    }
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "removal of rejected applications failed",
    });
  }
};
export const allSavedJobs = async (req, res, next) => {
  try {
    const limit = req.query.limit;

    const userId = req.user.id;

    const savedJobsCount = await SaveList.find({
      user: userId,
    }).countDocuments();
    const savedJobs = await SaveList.find({ user: userId })
      .populate({
        path: "job",
        populate: { path: "employer" },
      })
      .limit(limit);
    return res.status(200).json({
      data: { savedJobsCount, savedJobs },
      message: "user saved jobs",
    });
  } catch (err) {}
};
export const handleSaveJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const jobId = req.body.jobId;

    if (!userId || !userRole || !jobId) {
      return res
        .status(404)
        .json({ message: "No userId or userRole or jobId found" });
    }
    if (userRole !== "job_seeker") {
      return res.status(403).json({ message: "only job seeker can save job" });
    }
    const filter = { user: userId, job: jobId };

    const saveJob = await SaveList.findOne(filter);
    if (saveJob) {
      await SaveList.deleteOne(filter);
      return res.status(200).json({ message: "job unsave success" });
    }

    const newSave = new SaveList(filter);
    await newSave.save();

    res.status(201).json({ message: "Job saved successfully" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job save failed" });
  }
};

//employer
export const postJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole !== "employer") {
      return res.status(403).json({ message: "only employer can post a job" });
    }

    const {
      jobTitle,
      jobDescription,
      jobRequirements,
      jobExperience,
      country,
      state,
      city,
      jobType,
      workModel,
      salaryRange,
    } = req.body;
    const minExperience = parseInt(jobExperience, 10);
    const minSalary = salaryRange[0];
    const maxSalary = salaryRange[1];

    const jobExists = await Job.findOne({
      title: jobTitle,
      employer: userId,
      "location.country": country,
      "location.state": state,
      "location.city": city,
    });

    if (jobExists) {
      return res.status(409).json({ message: "Same job already exists." });
    }

    const jobContent = {
      title: jobTitle,
      description: jobDescription,
      requirements: jobRequirements,
      minExperience:
        !isNaN(minExperience) && minExperience >= 0 ? minExperience : 0,
      salaryRange: { min: minSalary, max: maxSalary },
      location: {
        country: country,
        state: state,
        city: city,
      },
      jobType: jobType,
      workModel: workModel,
      employer: userId,
    };

    const newJob = new Job(jobContent);
    await newJob.save();

    res.status(200).json({ message: "job post success" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job post failed" });
  }
};
export const jobPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit, jobTitle } = req.query;

    if (userRole !== "admin" && userRole !== "employer") {
      return res.status(403).json({
        message: "only admin and employer is allowed to get jobs",
      });
    }
    if (!userId) {
      return res.status(404).json({
        message: "no user id found",
      });
    }
    const filter = {
      employer: userId,
    };

    if (jobTitle && jobTitle.trim() !== "") {
      filter.title = { $regex: `^${jobTitle}`, $options: "i" };
    }

    const jobPostsCount = await Job.find(filter).countDocuments();
    const jobPosts = await Job.find(filter).limit(limit);

    res.status(200).json({
      message: "my job posts fetch success",
      data: {
        jobPosts,
        jobPostsCount,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "job posts filtering failed. server error",
    });
  }
};
export const updateJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const jobId = req.params.jobId;

    if (userRole !== "employer") {
      return res
        .status(403)
        .json({ message: "only employer can update the job" });
    }
    if (!jobId) {
      return res
        .status(404)
        .json({ message: "job id not found to update job" });
    }

    const {
      jobDescription,
      jobRequirements,
      country,
      state,
      city,
      jobExperience,
      jobType,
      workModel,
      salaryRange,
      jobStatus,
    } = req.body;
    const minExperience = parseInt(jobExperience, 10);
    const minSalary = salaryRange[0];
    const maxSalary = salaryRange[1];

    const updateJob = await Job.findByIdAndUpdate(
      jobId,
      {
        status: jobStatus,
        description: jobDescription,
        requirements: jobRequirements,
        minExperience:
          !isNaN(minExperience) && minExperience >= 0 ? minExperience : 0,
        salaryRange: { min: minSalary, max: maxSalary },
        location: {
          country: country,
          state: state,
          city: city,
        },
        jobType: jobType,
        workModel: workModel,
        verified: false,
      },
      { new: true, runValidators: true }
    );

    if (!updateJob) {
      return res.status(404).json({ message: "job not found to update" });
    }

    res.status(200).json({ message: "job update success" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job update failed" });
  }
};
export const deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userRole = req.user.role;
    if (userRole !== "admin" && userRole !== "employer") {
      return res.status(403).json({
        message: "only admin and employer is allowed to delete a job",
      });
    }
    if (!jobId) {
      return res
        .status(400)
        .json({ message: "job id missing to delete the job" });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res
        .status(404)
        .json({ message: "job not found.unable to delete" });
    }
    await Applicantion.deleteMany({ job: jobId });
    res.status(200).json({ message: "job deleted" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job delete failed. server error" });
  }
};
export const showJobApplications = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userRole = req.user.role;

    if (!jobId) {
      return res
        .status(400)
        .json({ message: "Job id not found to fetch applications" });
    }
    if (userRole !== "employer") {
      return res
        .status(403)
        .json({ message: "only employer can view job applications" });
    }

    const jobApplications = await Applicantion.find({
      job: jobId,
      status: { $ne: "rejected" },
    })
      .select("status job")
      .populate({
        path: "applicant",
        select: "-password -role",
      });

    if (!jobApplications) {
      return res.status(404).json({ message: "No applications found" });
    }

    res.status(200).json({
      message: "fetch job applications success",
      data: jobApplications,
    });
  } catch (err) {
    res.status(500).json({ message: "fecth job applicaations failed" });
  }
};
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const applicantId = req.body.applicantId;
    const jobId = req.params.jobId;
    const newStatus = req.body.newStatus;

    if (!userRole || !applicantId || !jobId || !newStatus) {
      return res
        .status(400)
        .json({ message: "missing fields to update status" });
    }

    if (userRole !== "employer") {
      return res
        .status(403)
        .json({ message: "only employer is allowed to make status updates" });
    }

    const application = await Applicantion.findOne({
      job: jobId,
      applicant: applicantId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = newStatus;
    await application.save();

    res.status(200).json({ message: "application status update success" });
  } catch (err) {
    res.status(500).json({ message: "application status update failed", err });
  }
};

// export const showOtherUserProfile = async (req, res, next) => {
//   try {
//     const userId = req.params.userId;
//     if (!userId) {
//       return res.status(400).json({ message: "userId not found" });
//     }

//     const otherUserProfile = await User.findById(userId).select("profile");

//     if (!otherUserProfile) {
//       return res.status(404).json({ message: "no such user found" });
//     }

//     res.status(200).json({
//       message: "fetch other user profile success",
//       data: otherUserProfile,
//     });
//   } catch (err) {
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "fetch other user profile failed" });
//   }
// };
// export const showMyApplicationDetails = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
//     const jobId = req.params.jobId;

//     if (!jobId) {
//       return res
//         .status(400)
//         .json({ message: "job id not found to view application details" });
//     }

//     if (userRole !== "job_seeker") {
//       return res
//         .status(403)
//         .json({ message: "only jobseeker can view the application details" });
//     }

//     const applicationDetails = await Applicantion.findOne({
//       job: jobId,
//       applicant: userId,
//     });

//     if (!applicationDetails) {
//       return res.status(404).json({ message: "Application details not found" });
//     }

//     res.status(200).json({
//       message: "fetch application details success",
//       data: applicationDetails,
//     });
//   } catch (err) {
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "fetch application details failed" });
//   }
// };
