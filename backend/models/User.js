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
});

// Adds username, hash & salt fields and convenience methods
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);
