import { Applicantion } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";

export const allJobs = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin" && userRole !== "job_seeker") {
      return res.status(403).json({
        message: "only job seeker and admin are allowed to fetch all jobs",
      });
    }
    const jobs = await Job.find();
    res.status(200).json({ message: "all jobs fetch success", data: jobs });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "jobs fetch failed" });
  }
};

export const postJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const { title, description, requirements, city } = req.body;
    if (userRole !== "employer") {
      return res.status(403).json({ message: "only employer can post a job" });
    }
    if (!title || !city) {
      return res
        .status(400)
        .json({ message: "title and city required to post a job" });
    }

    const newJob = new Job({
      title: title,
      description: description,
      requirements: requirements,
      location: { city: city },
    });

    await newJob.save();

    res.status(200).json({ message: "job post success" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "job post failed" });
  }
};

export const JobDetails = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const userRole = req.user.role;

    if (!jobId) {
      return res
        .status(400)
        .json({ message: "job id required to fetch job details" });
    }
    if (userRole !== "employer" && userRole !== "job_seeker") {
      return res.status(403).json({
        message: "only employer and seeker are allowed to fetch job details",
      });
    }

    const job = await Job.findById(jobId);

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
    const jobExist =await Job.findById(jobId)
    if(!jobExist){
      return res.status(404).json({message:"no such job found"})
    }
   
    const applicationExist = await Applicantion.findOne({job:jobId,applicant:userId})
    if(applicationExist){
      return res.status(403).json({message:"already applied once"})
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

export const updateJob = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const jobId = req.params.jobId;
    const {
      description,
      requirements,
      minSallary,
      maxSallary,
      city,
      state,
      country,
      employmentType,
      workModel,
      status,
    } = req.body;
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

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        description,
        requirements,
        salaryRange: {
          min: minSallary,
          max: maxSallary,
        },
        location: {
          city,
          state,
          country,
        },
        employmentType,
        workModel,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!job) {
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
      return res
        .status(403)
        .json({
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
      .json({ message: err.message || "job dekete failed. server error" });
  }
};