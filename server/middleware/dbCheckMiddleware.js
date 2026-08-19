const mongoose = require("mongoose");
const connectDB = require("../config/db");

const checkDbConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    return res.status(503).json({
      message: "Database connection failed. Please ensure MONGO_URI is set in Environment Variables and your MongoDB IP Access List allows connections (0.0.0.0/0).",
      error: error.message
    });
  }
};

module.exports = checkDbConnection;
