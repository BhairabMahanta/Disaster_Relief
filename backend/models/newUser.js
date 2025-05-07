const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  // Firebase UID for syncing between databases
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String
  },
  subscribedAt: {
    type: Date
  },
  subscribedCountries: [{ type: String }],
  windAlertSubscribed: {
    type: Boolean,
    default: false
  },
  // User profile fields
  profileImageUrl: {
    type: String
  },
  bio: {
    type: String
  },
  phone: {
    type: String
  },
  location: {
    type: String
  },
  occupation: {
    type: String
  },
  // Stats (matching Firebase structure)
  stats: {
    posts: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 }
  },
  // NGO specific fields
  areaOfOperation: {
    type: String
  },
  role: { 
    type: String, 
    enum: ['citizen', 'ngo', 'admin'], 
    default: 'citizen'
  },
  // Verification fields
  otp: String,
  otpExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Configure passport plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Add virtual getter for full user object (formatted like Firebase)
userSchema.virtual('fullUser').get(function() {
  return {
    id: this.firebaseUid,
    name: this.name,
    email: this.email,
    profileImageUrl: this.profileImageUrl || '',
    bio: this.bio || '',
    phone: this.phone || '',
    location: this.location || '',
    occupation: this.occupation || '',
    stats: this.stats || { posts: 0, followers: 0, following: 0 },
    country: this.country || '',
    subscribedAt: this.subscribedAt,
    subscribedCountries: this.subscribedCountries || [],
    windAlertSubscribed: this.windAlertSubscribed || false,
    areaOfOperation: this.areaOfOperation || '',
    role: this.role || 'citizen',
    isVerified: this.isVerified || false,
    createdAt: this.createdAt
  };
});

module.exports = mongoose.model('User', userSchema);