const Application = require("../models/Application");
const BusPass = require("../models/BusPass");
const { generateApplicationId } = require("../utils/generatePassId");

// @desc    Submit a new bus pass application
// @route   POST /api/applications/apply
const applyForPass = async (req, res, next) => {
  try {
    const { route, source, destination, passType } = req.body;

    if (!route || !source || !destination) {
      return res.status(400).json({ message: "Route, Source, and Destination are required." });
    }

    // Check for existing pending or active pass
    const existingPending = await Application.findOne({
      student: req.user._id,
      status: "Pending"
    });

    if (existingPending) {
      return res.status(409).json({ message: "You already have a pending application awaiting approval." });
    }

    const existingActivePass = await BusPass.findOne({
      student: req.user._id,
      status: "Active"
    });

    if (existingActivePass) {
      return res.status(409).json({ message: "You already have an active bus pass. Use renewal instead." });
    }

    const applicationId = generateApplicationId();

    const application = await Application.create({
      applicationId,
      student: req.user._id,
      studentName: req.user.name,
      studentId: req.user.studentId || "STD-DEFAULT",
      route,
      source,
      destination,
      passType: passType || "Monthly",
      applicationType: "New"
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a pass renewal application
// @route   POST /api/applications/renew
const renewPass = async (req, res, next) => {
  try {
    const { passId, passType } = req.body;

    const existingPass = await BusPass.findOne({ student: req.user._id, status: { $in: ["Active", "Expired"] } });

    if (!existingPass) {
      return res.status(404).json({ message: "No existing bus pass found to renew." });
    }

    const pendingRenewal = await Application.findOne({
      student: req.user._id,
      status: "Pending"
    });

    if (pendingRenewal) {
      return res.status(409).json({ message: "You already have a pending application awaiting approval." });
    }

    const applicationId = generateApplicationId();

    const application = await Application.create({
      applicationId,
      student: req.user._id,
      studentName: req.user.name,
      studentId: req.user.studentId || "STD-DEFAULT",
      route: existingPass.route,
      source: existingPass.source,
      destination: existingPass.destination,
      passType: passType || existingPass.passType,
      applicationType: "Renewal"
    });

    res.status(201).json({
      message: "Renewal application submitted successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's applications
// @route   GET /api/applications/my
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get application details by ID
// @route   GET /api/applications/:id
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (req.user.role !== "admin" && application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

module.exports = { applyForPass, renewPass, getMyApplications, getApplicationById };
