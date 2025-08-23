const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const profileController = require("../controllers/profileController");

router.get("/api/getData", eventsController.getAllTracking);
router.post("/api/profile", profileController.profileCreation);
router.get("/api/profile", profileController.getAllProfilesWithEvents);
// fetch one profile by id + its events
router.get("/api/profile/:id", profileController.getProfileById);
router.get("/api/profile-events", profileController.getAllProfilesWithEvents);
router.post("/api/events", eventsController.createEvent);
module.exports = router;
