const express = require("express");
const {
  getAdminStats,
  getAllApplications,
  updateApplicationStatus,
  getAllPasses,
  revokePass
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/applications", getAllApplications);
router.put("/applications/:id/status", updateApplicationStatus);
router.get("/passes", getAllPasses);
router.put("/passes/:id/revoke", revokePass);

module.exports = router;
