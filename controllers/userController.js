import { Applicantion } from "../models/applicationModel.js";
import { User } from "../models/userModel.js";
import {Job} from "../models/jobModel.js"

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
    const { userName, userEmail,userResume } = req.body;
    const updateProfile = await User.findById(userId);

    if (!updateProfile) {
      return res
        .status(404)
        .json({ message: "User profile not found to update" });
    }

    updateProfile.name = userName;
    updateProfile.email = userEmail;
    updateProfile.profile.resume = userResume;
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
      .select("-applicant -updatedAt")
      .populate({
        path: "job",
        select: "title",
        populate: {
          path: "employer",
          select: "name",
        },
      });

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

    const jobApplications = await Applicantion.find({
      job: jobId,
      status: { $ne: "Rejected" },
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
    const applicantId = req.params.applicantId;
    const jobId = req.body.jobId;
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

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, ConfirmNewPassword } = req.body;
    if (!userId) {
      res.status(404).json({ message: "user id not found" });
    }
    if (newPassword !== ConfirmNewPassword) {
      res.status(400).json({ message: "password mismatch" });
    }
    if (currentPassword === newPassword) {
      res
        .status(400)
        .json({ message: "current and new password can't be same" });
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "no user found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(500).json({ message: "incorrect password. Try again" });
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

export const checkUser = (req, res, next) => {
  const userRole = req.params.userRole;

  const role = req.user.role;

  if (userRole !== role) {
    return res.status(401).json({ message: "user not authorized" });
  }
  return res.status(200).json({ message: "user authorized" });
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role
    if (!userId) {
     return  res.status(404).json({ message: "no user id found to delete" });
    }
    const user = await User.findByIdAndDelete(userId);
    if(!user){
     return  res.status(404).json({message:"no such user found to delete"})
    }
   if(userRole === "employer"){
    const deleteJobs = await Job.deleteMany({ employer: userId });

    if (deleteJobs.deletedCount > 0) {
      console.log(`${deleteJobs.deletedCount} jobs deleted successfully.`);
    } else {
      console.log("No jobs found for the given userId.");
    }
   }

   if(userRole === "job_seeker"){
    const deleteApplications = await Applicantion.deleteMany({ applicant: userId });

    if (deleteApplications.deletedCount > 0) {
      console.log(`${deleteApplications.deletedCount} jobs deleted successfully.`);
    } else {
      console.log("No applications found for the given userId.");
    }
   }
   
    res.clearCookie("token",{
      sameSite:"None",
      secure:true,
      httpOnly:true
    });
    res.status(200).json({message:"user account deleted successfully"})
    
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "account delete failed" });
  }
};
