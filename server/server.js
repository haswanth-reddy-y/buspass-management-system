const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const User = require("./models/User");
const errorHandler = require("./middleware/errorMiddleware");
const checkDbConnection = require("./middleware/dbCheckMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passRoutes = require("./routes/passRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect Database on startup if running locally
connectDB().then(() => {
  seedDefaultAdmin();
}).catch(() => {
  // DB connection errors handled gracefully by middleware
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (doesn't require DB)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Bus Pass Management System API is live!" });
});

// Enforce DB Connection check & auto-reconnect for API resources
app.use("/api", checkDbConnection);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// Default Admin Seeding Helper
async function seedDefaultAdmin() {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const adminEmail = "admin@buspass.com";
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        studentId: "ADMIN-001",
        department: "Administration",
        phone: "1800-123-456",
        role: "admin"
      });
      console.log("Default admin account created: admin@buspass.com / admin123");
    }
  } catch (err) {
    // Suppress error if DB is busy or read-only
  }
}

// Global Error Handler
app.use(errorHandler);

// Only listen on PORT when running locally outside Vercel
if (process.env.VERCEL !== "1" && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Bus Pass Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
