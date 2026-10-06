const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    route: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    pincode: { type: String, default: "" },
    pickupPoint: { type: String, default: "" }, // Morning Pickup from Home
    dropPoint: { type: String, default: "" },   // Evening Drop to Home
    oneWayDistanceKm: { type: Number, default: 0 },
    roundTripDistanceKm: { type: Number, default: 0 },
    dailyFare: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    routeHasTolls: { type: Boolean, default: false },
    passType: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    applicationType: { type: String, enum: ["New", "Renewal"], default: "New" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    remarks: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    appliedDate: { type: Date, default: Date.now },
    processedDate: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
