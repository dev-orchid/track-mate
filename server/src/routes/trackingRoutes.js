const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/eventsController");
const profileController = require("../controllers/profileController");
const verifyToken = require("../utils/verifyToken");

router.get("/api/getData", verifyToken, eventsController.getAllTracking);
router.post("/api/profile", verifyToken,  profileController.profileCreation);
router.get("/api/profile", verifyToken , profileController.getAllProfilesWithEvents);
// fetch one profile by id + its events
router.get("/api/profile/:id", profileController.getProfileById);
router.get("/api/profile-events", profileController.getAllProfilesWithEvents);
router.post("/api/events", eventsController.createEvent);

module.exports = router;
