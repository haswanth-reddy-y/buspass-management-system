const Application = require("../models/Application");
const BusPass = require("../models/BusPass");
const User = require("../models/User");
const { generatePassId } = require("../utils/generatePassId");

// @desc    Get dashboard metrics for Admin
// @route   GET /api/admin/stats
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalApplications = await Application.countDocuments({});
    const pendingApplications = await Application.countDocuments({ status: "Pending" });
    const approvedApplications = await Application.countDocuments({ status: "Approved" });
    const rejectedApplications = await Application.countDocuments({ status: "Rejected" });
    const activePasses = await BusPass.countDocuments({ status: "Active" });

    // Recent applications feed
    const recentApplications = await Application.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      activePasses,
      recentApplications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications with optional status filter
// @route   GET /api/admin/applications
const getAllApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { applicationId: { $regex: search, $options: "i" } },
        { route: { $regex: search, $options: "i" } }
      ];
    }

    const applications = await Application.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Application
// @route   PUT /api/admin/applications/:id/status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, remarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be Approved or Rejected." });
    }

    if (status === "Rejected" && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({ message: "Rejection reason is required when rejecting an application." });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "Pending") {
      return res.status(400).json({ message: `Application is already ${application.status}.` });
    }

    application.status = status;
    application.remarks = remarks || "";
    application.rejectionReason = status === "Rejected" ? rejectionReason.trim() : "";
    application.processedDate = new Date();
    await application.save();

    let newPass = null;

    if (status === "Approved") {
      // Calculate expiry date
      const expiry = new Date();
      if (application.passType === "Monthly") {
        expiry.setMonth(expiry.getMonth() + 1);
      } else if (application.passType === "Quarterly") {
        expiry.setMonth(expiry.getMonth() + 3);
      } else if (application.passType === "Yearly") {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }

      // Check if user already has active pass (if renewal, expire old pass first)
      await BusPass.updateMany(
        { student: application.student, status: "Active" },
        { status: "Expired" }
      );

      const passId = generatePassId();

      newPass = await BusPass.create({
        passId,
        student: application.student,
        studentName: application.studentName,
        studentId: application.studentId,
        route: application.route,
        source: application.source,
        destination: application.destination,
        passType: application.passType,
        issueDate: new Date(),
        expiryDate: expiry,
        status: "Active",
        qrCodeData: JSON.stringify({
          passId,
          studentId: application.studentId,
          route: application.route,
          expiry: expiry.toISOString()
        })
      });
    }

    res.json({
      message: `Application ${status.toLowerCase()} successfully.`,
      application,
      pass: newPass
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all passes (Admin)
// @route   GET /api/admin/passes
const getAllPasses = async (req, res, next) => {
  try {
    const passes = await BusPass.find({}).sort({ createdAt: -1 });
    res.json(passes);
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke bus pass (Admin)
// @route   PUT /api/admin/passes/:id/revoke
const revokePass = async (req, res, next) => {
  try {
    const pass = await BusPass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }

    pass.status = "Revoked";
    await pass.save();

    res.json({ message: "Bus pass revoked successfully", pass });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllApplications,
  updateApplicationStatus,
  getAllPasses,
  revokePass
};
