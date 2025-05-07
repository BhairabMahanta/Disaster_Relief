const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// Get current user profile
router.get('/profile', isAuthenticated, userController.getCurrentUser);

// Update user profile
router.put('/profile', isAuthenticated, userController.updateProfile);

// Update profile image
router.put('/profile-image', isAuthenticated, userController.updateProfileImage);

// Subscribe to wind alerts
router.post('/wind-alerts', isAuthenticated, userController.subscribeToWindAlerts);

// Subscribe to countries for alerts
router.post('/subscribe-countries', isAuthenticated, userController.subscribeToCountries);

module.exports = router;