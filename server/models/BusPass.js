const mongoose = require("mongoose");

const busPassSchema = new mongoose.Schema(
  {
    passId: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    route: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    passType: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Expired", "Revoked"], default: "Active" },
    qrCodeData: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusPass", busPassSchema);
