import { Job } from "../models/jobModel.js";

export const searchJobs = async (req, res, next) => {
  try {
    const { jobTitle, jobLocation, jobExperience } = req.body;

    if (!jobTitle ) {
      return res.status(400).json({
        message: "Job title is mandatory.",
      });
    }
    const minJobExp = parseInt(jobExperience, 10) || 100;

    const filterCriteria = {
      status: "open",
      verified: true,
      title: { $regex: jobTitle, $options: "i" },
      minExperience: { $lte: minJobExp },
      ...(jobLocation && {
        $or: [
          { "location.city": { $regex: jobLocation, $options: "i" } },
          { "location.state": { $regex: jobLocation, $options: "i" } },
          { "location.country": { $regex: jobLocation, $options: "i" } },
        ],
      }),
    };

    const filterJobs = await Job.find(filterCriteria).populate({
      path: "employer",
      select: "-password",
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
export const allOpenJobs = async (req, res, next) => {
  try {
    const MaxExperience = parseInt(req.query.experience, 10);
    const maxSalary = parseInt(req.query.salary, 10);
    const pageNo = parseInt(req.query.pageNo, 10);
    const jobsPerPage = parseInt(req.query.jobsPerPage, 10);
    const { jobType, workModel } = req.query;
    const sortField = req.query.sortCriteria === "name" ? "title" : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const jobTypeArray = jobType.length > 0 ? jobType.split(",") : null;
    const workModelArray = workModel.length > 0 ? workModel.split(",") : null;

    const skip = (pageNo - 1) * jobsPerPage;
    

    const filter = {
      status: "open",
      verified: true,
      minExperience: { $lte: MaxExperience },
      "salaryRange.min": { $lte: maxSalary },
    };

    if (jobTypeArray && jobTypeArray.length > 0) {
      filter.jobType = { $in: jobTypeArray };
    }
    if (workModelArray && workModelArray.length > 0) {
      filter.workModel = { $in: workModelArray };
    }

    const jobsCount = await Job.find(filter).countDocuments();

    const jobs = await Job.find(filter)
      .populate({
        path: "employer",
        select: "-password",
      })
      .sort({ [sortField]: sortOrder }).skip(skip).limit(jobsPerPage);

    

    const totalPages = Math.ceil(jobsCount/jobsPerPage)
   
    res
      .status(200)
      .json({
        message: "all open jobs fetch success",
        data: { jobs, totalPages },
      });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "open jobs fetch failed" });
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
      path: "employer",
      select: "-password",
    });

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

// export const allJobs = async (req, res, next) => {
//   try {

//     const jobs = await Job.find().populate({
//       path: "employer",
//       select: "-password",
//     });
//     res.status(200).json({ message: "all jobs fetch success", data: jobs });
//   } catch (err) {
//     res
//       .status(err.statusCode || 500)
//       .json({ message: err.message || "jobs fetch failed" });
//   }
// };
















