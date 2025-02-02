import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

export const generateToken = (userId, userRole) => {
  try {
    const token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET_KEY
    );
    return token;
  } catch (err) {
    console.log(err);
  }
};
