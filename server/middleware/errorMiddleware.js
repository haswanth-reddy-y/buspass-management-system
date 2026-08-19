const errorHandler = (err, req, res, next) => {
  console.error("Server Error Log:", err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier format"
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate field value entered"
    });
  }

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = errorHandler;
