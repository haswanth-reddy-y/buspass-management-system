const express = require("express");
const { applyForPass, renewPass, getMyApplications, getApplicationById } = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", protect, applyForPass);
router.post("/renew", protect, renewPass);
router.get("/my", protect, getMyApplications);
router.get("/:id", protect, getApplicationById);

module.exports = router;
