const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Configure Passport to use local strategy
module.exports = () => {
  // Local Strategy (username/password)
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    User.authenticate()
  ));
  
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
  
  return passport;
};