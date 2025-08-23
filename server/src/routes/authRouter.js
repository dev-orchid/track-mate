const express = require('express');
const router = express.Router();
const authController= require('../controllers/authController');
router.post('/register',authController.userRegisteration);
router.post('/login',authController.authenticateLogin);
router.post('/refreshtoken',authController.refreshAccessToken);



module.exports = router;
