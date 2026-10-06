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
    pincode: { type: String, default: "" },
    villageTown: { type: String, default: "" }, // Student Village or Town name
    stopName: { type: String, default: "" },    // Student Boarding Stop name
    pickupPoint: { type: String, default: "" }, // Morning Pickup Point
    dropPoint: { type: String, default: "" },   // Evening Drop Point
    oneWayDistanceKm: { type: Number, default: 0 },
    roundTripDistanceKm: { type: Number, default: 0 },
    dailyFare: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    routeHasTolls: { type: Boolean, default: false },
    passType: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Expired", "Revoked"], default: "Active" },
    qrCodeData: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusPass", busPassSchema);
