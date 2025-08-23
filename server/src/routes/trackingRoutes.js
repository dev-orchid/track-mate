const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");
const verifyToken = require("../utils/verifyToken");

// Public route example (if you want some to stay public, leave them without middleware)
router.get("/api/getData", verifyToken, trackingController.getAllTracking);
router.post("/api/profile", verifyToken, trackingController.profileCreation);
router.get("/api/profile", verifyToken, trackingController.getAllProfilesWithEvents);
router.post("/api/events", verifyToken, trackingController.createEvent);

module.exports = router;
