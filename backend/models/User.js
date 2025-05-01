const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  name:{
    type : String,
    required : true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String,
    required: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  subscribedCountries: [{ type: String }],
  windAlertSubscribed: { // ✅ New field
    type: Boolean,
    default: false
  },
  // NGO specific fields
  phone: {
      type: String,
  },
  areaOfOperation: {
      type: String,
  },
  role: { 
      type: String, 
      enum: ['citizen', 'ngo', 'admin'], 
      default: 'citizen'
  },
  otp: String,
  otpExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
}

});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);
