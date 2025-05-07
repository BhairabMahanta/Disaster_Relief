const jwt = require('jsonwebtoken');
const User = require('../models/newUser');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Check if session authentication is present (from Passport)
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    
    // If no session, check for JWT token
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated. Please log in to access this resource.' }
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      // Set user in request
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error', details: error.message }
    });
  }
};

// Middleware to restrict access based on roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' }
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to perform this action' }
      });
    }
    
    next();
  };
};