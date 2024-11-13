import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

export const userAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(500).json({ message: "no token available" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken) {
      return res.status(500).json({ message: "user not authorized" });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "server error" });
  }
};
