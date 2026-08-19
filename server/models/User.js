const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    studentId: { type: String, default: "" },
    department: { type: String, default: "General" },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatar: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
