import { User } from "../models/userModel.js";


export const showProfile =async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userProfile = await User.findById(userId).select("-password");
    res
      .status(200)
      .json({ message: "fetch user profile success", data: userProfile });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};


export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, title, skills, resume, company } = req.body;
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        email: email,
        title: title,
        profile: {
          skills: skills,
          resume: resume,
          company: company,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "profile update successfull", data: updatedProfile });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};
