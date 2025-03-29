const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errMessage =
    err.message || "Something went wrong. Please try again later.";

  res.status(statusCode).json({ message: errMessage });
};

export default errorHandler;
