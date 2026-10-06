const express = require("express");
const { calculateFare } = require("../controllers/fareController");

const router = express.Router();

/**
 * @route   POST /api/fare/calculate
 * @desc    Calculate student round-trip bus fare using Google Maps Distance Matrix
 * @access  Public (or protected if added to student auth middleware)
 */
router.post("/calculate", calculateFare);

module.exports = router;
