import { Applicantion } from "../models/applicationModel.js";
import { User } from "../models/userModel.js";

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
    const { name, email, title, skills, resume, company } = req.body;
    const updateProfile = await User.findById(userId);

    if (!updateProfile) {
      return res
        .status(404)
        .json({ message: "User profile not found to update" });
    }

    updateProfile.name = name;
    updateProfile.email = email;
    updateProfile.profile.title = title;
    updateProfile.profile.skills = skills;
    updateProfile.profile.resume = resume;
    updateProfile.profile.company = company;

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

export const showMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "job_seeker") {
      return res
        .status(403)
        .json({ message: "only jobseeker can view their applications" });
    }

    const applications = await Applicantion.find({ applicant: userId })
      .populate("job")
      .exec();

    if (!applications) {
      return res.status(404).json({ message: "No applications found" });
    }

    res.status(200).json({
      message: "fetch my applications successfull",
      data: applications,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "fetch my applications failed" });
  }
};

export const showMyApplicationDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const jobId = req.params.jobId;

    if (!jobId) {
      return res
        .status(400)
        .json({ message: "job id not found to view application details" });
    }

    if (userRole !== "job_seeker") {
      return res
        .status(403)
        .json({ message: "only jobseeker can view the application details" });
    }

    const applicationDetails = await Applicantion.findOne({
      job: jobId,
      applicant: userId,
    });

    if (!applicationDetails) {
      return res.status(404).json({ message: "Application details not found" });
    }

    res.status(200).json({
      message: "fetch application details success",
      data: applicationDetails,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "fetch application details failed" });
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

    const jobApplications = await Applicantion.find({ job: jobId })
      .populate("applicant")
      .exec();

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
    const applicantId = req.params.applicantId;
    const jobId = req.body.jobId;
    const newStatus = req.body.status;
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

    const updatedStatus = application.status;

    res.status(200).json({ message: "application status update success" });
  } catch (err) {
    res.status(500).json({ message: "application status update failed" });
  }
};

export const showOtherUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    const otherUserProfile = await User.findById(userId).select("profile");

    if (!otherUserProfile) {
      return res.status(404).json({ message: "no such user found" });
    }

    res.status(200).json({
      message: "fetch other user profile success",
      data: otherUserProfile,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "fetch other user profile failed" });
  }
};
