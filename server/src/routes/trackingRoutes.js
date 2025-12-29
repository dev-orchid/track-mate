const express = require("express");
const cors = require("cors");
const router = express.Router();

const eventsController = require("../controllers/eventsController");
const profileController = require("../controllers/profileController");
const webhookController = require("../controllers/webhookController");
const webhookLogController = require("../controllers/webhookLogController");
const verifyToken = require("../utils/verifyToken");
const verifyWebhookKey = require("../utils/verifyWebhookKey");
const webhookLogger = require("../utils/webhookLogger");
const { webhookRateLimiter, webhookAuthRateLimiter, generalApiRateLimiter } = require("../utils/rateLimiter");

// Permissive CORS for tracking pixel endpoints (must work on any customer website)
const trackingCors = cors({ origin: true, credentials: false });

// Apply general rate limiter to all routes
router.use(generalApiRateLimiter);

router.get("/api/getData", verifyToken, eventsController.getAllTracking);
// Profile and event creation endpoints - DO NOT require verifyToken as they're called by tracking snippet
// Use permissive CORS to allow requests from any customer website
router.post("/api/profile", trackingCors, profileController.profileCreation);
router.post("/api/events", trackingCors, eventsController.createEvent);
router.options("/api/profile", trackingCors); // Handle preflight
router.options("/api/events", trackingCors); // Handle preflight
// Protected endpoints - require authentication
router.get("/api/profile", verifyToken, profileController.getAllProfilesWithEvents);
router.get("/api/profile/:id", verifyToken, profileController.getProfileById);
// PROTECTED: This endpoint now requires authentication
router.get("/api/profile-events", verifyToken, profileController.getAllProfilesWithEvents);
// Get new profiles for notifications
router.get("/api/notifications/new-profiles", verifyToken, profileController.getNewProfiles);

// Anonymous visitor tracking endpoints
router.get("/api/anonymous/sessions", verifyToken, eventsController.getAnonymousSessions);
router.get("/api/anonymous/stats", verifyToken, eventsController.getAnonymousStats);

// Webhook endpoints - require API key authentication + rate limiting + logging
router.post("/api/webhooks/events", webhookAuthRateLimiter, webhookRateLimiter, verifyWebhookKey, webhookLogger, webhookController.handleWebhookEvent);
router.get("/api/webhooks/info", webhookRateLimiter, verifyWebhookKey, webhookLogger, webhookController.getWebhookInfo);

// Webhook logs endpoints - require user authentication
router.get("/api/webhooks/logs", verifyToken, webhookLogController.getWebhookLogs);
router.get("/api/webhooks/logs/stats", verifyToken, webhookLogController.getWebhookLogStats);
router.get("/api/webhooks/logs/:id", verifyToken, webhookLogController.getWebhookLogById);

module.exports = router;
