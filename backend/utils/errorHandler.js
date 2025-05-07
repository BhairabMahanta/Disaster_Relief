// Handler for API errors
exports.handleApiError = (res, error, defaultMessage = 'An error occurred') => {
  console.error(`API Error: ${error.message || error}`);
  
  // Handle different types of errors
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const validationErrors = {};
    
    Object.keys(error.errors).forEach(key => {
      validationErrors[key] = error.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: validationErrors
      }
    });
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    // Duplicate key error (e.g., email already exists)
    const field = Object.keys(error.keyValue)[0];
    
    return res.status(409).json({
      success: false,
      error: {
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        field
      }
    });
  } else if (error.name === 'TokenExpiredError') {
    // JWT token expired
    return res.status(401).json({
      success: false,
      error: {
        message: 'Your session has expired. Please log in again.'
      }
    });
  } else if (error.name === 'JsonWebTokenError') {
    // Invalid JWT token
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authentication token. Please log in again.'
      }
    });
  } else if (error.statusCode) {
    // Error with status code (e.g., custom API error)
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message || defaultMessage
      }
    });
  }
  
  // Default error handler
  return res.status(500).json({
    success: false,
    error: {
      message: error.message || defaultMessage
    }
  });
};