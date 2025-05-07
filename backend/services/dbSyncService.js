// Service to synchronize data between Firebase and MongoDB
const User = require('../models/newUser');
const firebaseService = require('./firebaseService');

const dbSyncService = {
  // Sync user from Firebase to MongoDB
  async syncUserToMongo(firebaseUid, mongoId = null) {
    try {
      // Get user data from Firebase
      const firebaseData = await firebaseService.getUserData(firebaseUid);
      
      if (!firebaseData) {
        throw new Error('User not found in Firebase');
      }
      
      // Prepare MongoDB user data
      const mongoData = {
        firebaseUid,
        name: firebaseData.name,
        email: firebaseData.email,
        country: firebaseData.country,
        subscribedAt: firebaseData.subscribedAt,
        subscribedCountries: firebaseData.subscribedCountries || [],
        windAlertSubscribed: firebaseData.windAlertSubscribed || false,
        phone: firebaseData.phone,
        areaOfOperation: firebaseData.areaOfOperation,
        role: firebaseData.role || 'citizen',
        isVerified: firebaseData.isVerified || false,
        profileImageUrl: firebaseData.profileImageUrl,
        bio: firebaseData.bio,
        location: firebaseData.location,
        occupation: firebaseData.occupation
      };
      
      // Update or create MongoDB user
      if (mongoId) {
        // Update existing user
        await User.findByIdAndUpdate(mongoId, mongoData, { new: true });
      } else {
        // Find by Firebase UID or create new
        const existingUser = await User.findOne({ firebaseUid });
        
        if (existingUser) {
          Object.assign(existingUser, mongoData);
          await existingUser.save();
        } else {
          // Create new user without setting password (auth is handled by Firebase)
          await User.create(mongoData);
        }
      }
      
      // Return the updated/created MongoDB user
      return await User.findOne({ firebaseUid });
    } catch (error) {
      console.error('Error syncing user to MongoDB:', error);
      throw error;
    }
  },
  
  // Sync user from MongoDB to Firebase
  async syncUserToFirebase(mongoUser) {
    try {
      if (!mongoUser.firebaseUid) {
        throw new Error('User has no Firebase UID');
      }
      
      // Prepare Firebase user data
      const firebaseData = {
        name: mongoUser.name,
        email: mongoUser.email,
        country: mongoUser.country,
        subscribedAt: mongoUser.subscribedAt,
        subscribedCountries: mongoUser.subscribedCountries || [],
        windAlertSubscribed: mongoUser.windAlertSubscribed || false,
        phone: mongoUser.phone || '',
        areaOfOperation: mongoUser.areaOfOperation || '',
        role: mongoUser.role || 'citizen',
        isVerified: mongoUser.isVerified || false,
        profileImageUrl: mongoUser.profileImageUrl || '',
        bio: mongoUser.bio || '',
        location: mongoUser.location || '',
        occupation: mongoUser.occupation || ''
      };
      
      // Update user in Firebase
      await firebaseService.updateUserData(mongoUser.firebaseUid, firebaseData);
      
      return firebaseData;
    } catch (error) {
      console.error('Error syncing user to Firebase:', error);
      throw error;
    }
  }
};

module.exports = dbSyncService;