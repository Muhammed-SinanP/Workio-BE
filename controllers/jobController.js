import { Applicantion } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";

export const allJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate({
      path: 'employer', 
      select: '-password', 
    });;
    res.status(200).json({ message: "all jobs fetch success", data: jobs });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "jobs fetch failed" });
  }
};

export const allOpenJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({status:"Open",verified:true}).populate({
      path: 'employer', 
      select: '-password', 
    });;
    
    
    res.status(200).json({ message: "all open jobs fetch success", data: jobs });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "open jobs fetch failed" });
  }
};



export const postJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const {
      jobTitle,
      jobDescription,
      jobRequirements,
      locationCountry,
      locationState,
      locationCity,
      jobExperience,
      jobType,
      workModel,
      minSallary,
      maxSallary,
    } = req.body;
    const minExperience = parseInt(jobExperience, 10);
    const sallaryMin = parseInt(minSallary,10)
    const sallaryMax = parseInt(maxSallary,10)
    if (userRole !== "employer") {
      return res.status(403).json({ message: "only employer can post a job" });
    }
    

    const newJob = new Job({
      title: jobTitle,
      description: jobDescription,
      requirements:jobRequirements,
      minExperience: minExperience,
      sallaryRange:{min:sallaryMin,max:sallaryMax},
      location: { country:locationCountry,state:locationState,city: locationCity },
      jobType:jobType,
      workModel:workModel,
      employer: userId,
    });

    await newJob.save();

    res.status(200).json({ message: "job post success" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job post failed" });
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
        .status(400)
        .json({ message: "job id not found to update job" });

    }

    const {
      
      jobDescription,
      jobRequirements,
      locationCountry,
      locationState,
      locationCity,
      jobExperience,
      jobType,
      workModel,
      minSallary,
      maxSallary,
      jobStatus

    } = req.body;
    const minExperience = parseInt(jobExperience, 10);
    const sallaryMin = parseInt(minSallary,10)
    const sallaryMax = parseInt(maxSallary,10)
    

    const updateJob = await Job.findByIdAndUpdate(
      jobId,
      {
        status:jobStatus,
        description: jobDescription,
        requirements:jobRequirements,
        minExperience: minExperience,
        sallaryRange:{min:sallaryMin,max:sallaryMax},
        location: { country:locationCountry,state:locationState,city: locationCity },
        jobType:jobType,
        workModel:workModel,
        
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

export const JobDetails = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    

    if (!jobId) {
      return res
        .status(400)
        .json({ message: "job id required to fetch job details" });
    }
    

    const job = await Job.findById(jobId).populate({
      path: 'employer', 
      select: '-password', 
    });;

    if (!job) {
      return res.status(404).json({ message: "no such job found" });
    }

    res.status(200).json({ message: "job details fetch success", data: job });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job details fetch failed" });
  }
};

export const applyJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const jobId = req.params.jobId;

    if (!userId || !userRole || !jobId) {
      return res
        .status(400)
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

    if (!deleteJob) {
      return res
        .status(404)
        .json({ message: "job not found.unable to delete" });
    }

    res.status(200).json({ message: "job deleted" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job delete failed. server error" });
  }
};

export const searchJobs = async (req, res, next) => {
  try {
    const { jobTitle, jobLocation, jobExperience } = req.body;

    if (!jobTitle || !jobExperience) {
      return res.status(400).json({
        message: "Job title and job experience are mandatory fields.",
      });
    }
    const minJobExp = parseInt(jobExperience, 10);

    const filterCriteria = {
      status:"Open",
      verified:true,
      title: { $regex: jobTitle, $options: "i" },
      minExperience: { $gte: minJobExp },
      ...(jobLocation && {
        $or: [
          { "location.city": { $regex: jobLocation, $options: "i" } },
          { "location.state": { $regex: jobLocation, $options: "i" } },
          { "location.country": { $regex: jobLocation, $options: "i" } },
        ],
      }),
    };

    const filterJobs = await Job.find(filterCriteria).populate({
      path: 'employer', 
      select: '-password', 
    });
    if (!filterJobs) {
      return res.status(404).json({ message: "No jobs found for your search" });
    }
    res.status(200).json({ message: "jobs filtered", data: filterJobs });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job filtering failed. server error" });
  }
};

export const myJobPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== "admin" && userRole !== "employer") {
      return res.status(403).json({
        message: "only admin and employer is allowed to delete a job",
      });
    }
    if (!userId) {
      return res.status(404).json({
        message: "no user id found",
      });
    }

    const jobPosts = await Job.find({ employer: userId });

    res
      .status(200)
      .json({ message: "my job posts fetch success", data: jobPosts });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({
        message: err.message || "job posts filtering failed. server error",
      });
  }
};
