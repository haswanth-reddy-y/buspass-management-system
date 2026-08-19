const express = require("express");
const { getMyPasses, getPassById, verifyPass } = require("../controllers/passController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyPasses);
router.get("/verify/:passId", verifyPass);
router.get("/:id", protect, getPassById);

module.exports = router;
