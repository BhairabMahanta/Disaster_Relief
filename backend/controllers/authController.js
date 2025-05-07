const User = require('../models/newUser');
const { handleApiError } = require('../utils/errorHandler');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// Authentication controllers
const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { name, email, password, country, phone, areaOfOperation, role = 'citizen' } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email already registered' }
        });
      }
      
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      // Create user in MongoDB
      const newUser = new User({
        name,
        email,
        country,
        phone: phone || '',
        areaOfOperation: areaOfOperation || '',
        role: role || 'citizen',
        isVerified: false,
        otp,
        otpExpires
      });
      
      // Register user in MongoDB (Passport will handle salt/hash)
      await User.register(newUser, password);
      
      // Send verification email
      await sendVerificationEmail(email, otp, name);
      
      // All good, return success
      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        userId: newUser._id
      });
    } catch (error) {
      return handleApiError(res, error, 'Registration failed');
    }
  },

  // Verify email with OTP
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      // Check if OTP matches and is not expired
      if (user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid or expired OTP' }
        });
      }
      
      // Mark user as verified
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      return handleApiError(res, error, 'Email verification failed');
    }
  },

  // Login user
  async login(req, res) {
    try {
      // Use Passport for authentication
      passport.authenticate('local', async (err, user, info) => {
        if (err) {
          return handleApiError(res, err, 'Login failed');
        }
        
        if (!user) {
          return res.status(401).json({
            success: false,
            error: { message: info.message || 'Invalid credentials' }
          });
        }
        
        // Check if user is verified
        if (!user.isVerified) {
          return res.status(401).json({
            success: false,
            error: { message: 'Email not verified. Please verify your email to continue.' }
          });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Log user in
        req.login(user, async (loginErr) => {
          if (loginErr) {
            return handleApiError(res, loginErr, 'Login session creation failed');
          }
          
          // Return user data and token
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isVerified: user.isVerified,
              country: user.country,
              profileImageUrl: user.profileImageUrl || '',
              bio: user.bio || '',
              phone: user.phone || '',
              location: user.location || '',
              occupation: user.occupation || '',
              areaOfOperation: user.areaOfOperation || '',
              windAlertSubscribed: user.windAlertSubscribed || false,
              subscribedCountries: user.subscribedCountries || [],
              subscribedAt: user.subscribedAt
            }
          });
        });
      })(req, res);
    } catch (error) {
      return handleApiError(res, error, 'Login failed');
    }
  },

}
module.exports = authController;