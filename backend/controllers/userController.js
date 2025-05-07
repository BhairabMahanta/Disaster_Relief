const User = require('../models/newUser');
const { handleApiError } = require('../utils/errorHandler');

// User data controllers
const userController = {
  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' }
        });
      }
      
      // Get fresh user data
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profileImageUrl: user.profileImageUrl || '',
          bio: user.bio || '',
          phone: user.phone || '',
          location: user.location || '',
          occupation: user.occupation || '',
          country: user.country || '',
          areaOfOperation: user.areaOfOperation || '',
          stats: user.stats || { posts: 0, followers: 0, following: 0 },
          windAlertSubscribed: user.windAlertSubscribed || false,
          subscribedCountries: user.subscribedCountries || [],
          subscribedAt: user.subscribedAt
        }
      });
    } catch (error) {
      return handleApiError(res, error, 'Failed to get user profile');
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' }
        });
      }
      
      const { name, bio, phone, location, occupation, country, areaOfOperation } = req.body;
      
      // Update fields that are provided
      const updateData = {};
      if (name) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (phone !== undefined) updateData.phone = phone;
      if (location !== undefined) updateData.location = location;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (country !== undefined) updateData.country = country;
      if (areaOfOperation !== undefined) updateData.areaOfOperation = areaOfOperation;
      
      // Update MongoDB user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          profileImageUrl: updatedUser.profileImageUrl || '',
          bio: updatedUser.bio || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
          occupation: updatedUser.occupation || '',
          country: updatedUser.country || '',
          areaOfOperation: updatedUser.areaOfOperation || '',
          stats: updatedUser.stats || { posts: 0, followers: 0, following: 0 },
          windAlertSubscribed: updatedUser.windAlertSubscribed || false,
          subscribedCountries: updatedUser.subscribedCountries || [],
          subscribedAt: updatedUser.subscribedAt
        }
      });
    } catch (error) {
      return handleApiError(res, error, 'Failed to update profile');
    }
  },

  // Update profile image
  async updateProfileImage(req, res) {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' }
        });
      }
      
      // Get profile image URL from request body
      const { profileImageUrl } = req.body;
      
      if (!profileImageUrl) {
        return res.status(400).json({
          success: false,
          error: { message: 'Profile image URL is required' }
        });
      }
      
      // Update MongoDB user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profileImageUrl },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          profileImageUrl: updatedUser.profileImageUrl || '',
          bio: updatedUser.bio || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
          occupation: updatedUser.occupation || '',
          country: updatedUser.country || '',
          areaOfOperation: updatedUser.areaOfOperation || '',
          stats: updatedUser.stats || { posts: 0, followers: 0, following: 0 },
          windAlertSubscribed: updatedUser.windAlertSubscribed || false,
          subscribedCountries: updatedUser.subscribedCountries || [],
          subscribedAt: updatedUser.subscribedAt
        }
      });
    } catch (error) {
      return handleApiError(res, error, 'Failed to update profile image');
    }
  },

  // Subscribe to wind alerts
  async subscribeToWindAlerts(req, res) {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' }
        });
      }
      
      const { subscribe } = req.body;
      
      // Update MongoDB user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { windAlertSubscribed: !!subscribe },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Wind alerts ${subscribe ? 'enabled' : 'disabled'} successfully`,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          profileImageUrl: updatedUser.profileImageUrl || '',
          bio: updatedUser.bio || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
          occupation: updatedUser.occupation || '',
          country: updatedUser.country || '',
          areaOfOperation: updatedUser.areaOfOperation || '',
          stats: updatedUser.stats || { posts: 0, followers: 0, following: 0 },
          windAlertSubscribed: updatedUser.windAlertSubscribed || false,
          subscribedCountries: updatedUser.subscribedCountries || [],
          subscribedAt: updatedUser.subscribedAt
        }
      });
    } catch (error) {
      return handleApiError(res, error, 'Failed to update wind alert subscription');
    }
  },

  // Subscribe to countries for alerts
  async subscribeToCountries(req, res) {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' }
        });
      }
      
      const { countries } = req.body;
      
      if (!Array.isArray(countries)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Countries must be an array' }
        });
      }
      
      // Update MongoDB user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
          subscribedCountries: countries,
          subscribedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Country subscriptions updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          profileImageUrl: updatedUser.profileImageUrl || '',
          bio: updatedUser.bio || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
          occupation: updatedUser.occupation || '',
          country: updatedUser.country || '',
          areaOfOperation: updatedUser.areaOfOperation || '',
          stats: updatedUser.stats || { posts: 0, followers: 0, following: 0 },
          windAlertSubscribed: updatedUser.windAlertSubscribed || false,
          subscribedCountries: updatedUser.subscribedCountries || [],
          subscribedAt: updatedUser.subscribedAt
        }
      });
    } catch (error) {
      return handleApiError(res, error, 'Failed to update country subscriptions');
    }
  }
};

module.exports = userController;