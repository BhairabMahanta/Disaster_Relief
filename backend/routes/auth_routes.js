const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', authController.register);

// Verify email with OTP
router.post('/verify-otp', authController.verifyOTP);

// Login user
router.post('/login', authController.login);

// Request password reset
router.post('/forgot-password', authController.forgotPassword);

// Logout user
router.get('/logout', authController.logout);

module.exports = router;