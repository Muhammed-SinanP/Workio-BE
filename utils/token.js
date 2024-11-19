import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

export const generateToken = (user, role) => {
  try {
    const token = jwt.sign(
      { id: user._id, role: role },
      process.env.JWT_SECRET_KEY
    );
    return token;
  } catch (err) {
    console.log(err);
  }
};
