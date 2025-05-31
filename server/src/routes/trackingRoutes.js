const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get('/api/getData', trackingController.getAllTracking);
router.post('/api/profile', trackingController.profileCreation);
router.get('/api/profile', trackingController.getProfile);
router.post('/api/events', trackingController.createEvent);
module.exports = router;
