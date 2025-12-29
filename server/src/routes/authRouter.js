const express = require('express');
const router = express.Router();
const authController= require('../controllers/authController');
const verifyToken = require('../utils/verifyToken');

router.post('/register',authController.userRegisteration);
router.post('/login',authController.authenticateLogin);
router.get('/auth/me', verifyToken, authController.getCurrentUser);
router.put('/auth/me', verifyToken, authController.updateCurrentUser);
router.post('/refreshtoken',authController.refreshAccessToken);
// API Key regeneration endpoint (protected)
router.post('/auth/regenerate-api-key', verifyToken, authController.regenerateApiKey);

module.exports = router;
