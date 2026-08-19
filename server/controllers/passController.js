const BusPass = require("../models/BusPass");

// @desc    Get logged in user's bus passes
// @route   GET /api/passes/my
const getMyPasses = async (req, res, next) => {
  try {
    const passes = await BusPass.find({ student: req.user._id }).sort({ createdAt: -1 });

    const now = new Date();
    const updatedPasses = await Promise.all(
      passes.map(async (pass) => {
        const passObj = pass.toObject();
        if (passObj.status === "Active" && new Date(passObj.expiryDate) < now) {
          passObj.status = "Expired";
          await BusPass.findByIdAndUpdate(pass._id, { status: "Expired" });
        }
        return passObj;
      })
    );

    res.json(updatedPasses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get bus pass details by ID
// @route   GET /api/passes/:id
const getPassById = async (req, res, next) => {
  try {
    const pass = await BusPass.findById(req.params.id).populate("student", "name email studentId department");
    if (!pass) {
      return res.status(404).json({ message: "Bus pass not found" });
    }

    if (req.user.role !== "admin" && pass.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(pass);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify bus pass validity (Public or Inspector)
// @route   GET /api/passes/verify/:passId
const verifyPass = async (req, res, next) => {
  try {
    const pass = await BusPass.findOne({ passId: req.params.passId }).populate("student", "name email studentId department");
    if (!pass) {
      return res.status(404).json({ valid: false, message: "Bus pass not found" });
    }

    const now = new Date();
    const isValid = pass.status === "Active" && new Date(pass.expiryDate) >= now;

    res.json({
      valid: isValid,
      passId: pass.passId,
      studentName: pass.studentName,
      studentId: pass.studentId,
      route: pass.route,
      source: pass.source,
      destination: pass.destination,
      passType: pass.passType,
      expiryDate: pass.expiryDate,
      status: isValid ? "Active" : pass.status === "Revoked" ? "Revoked" : "Expired"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyPasses, getPassById, verifyPass };
