const express = require("express");
const router = express.Router();

const eventsController = require("../controllers/eventsController");
const profileController = require("../controllers/profileController");

router.get("/api/getData",verifyToken, eventsController.getAllTracking);
router.post("/api/profile",verifyToken, profileController.profileCreation);
router.get("/api/profile",verifyToken, profileController.getAllProfilesWithEvents);
// fetch one profile by id + its events
router.get("/api/profile/:id", verifyToken, profileController.getProfileById);
router.get("/api/profile-events", profileController.getAllProfilesWithEvents);
router.post("/api/events",verifyToken, eventsController.createEvent);

module.exports = router;
