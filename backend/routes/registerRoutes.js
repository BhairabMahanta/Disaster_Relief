const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

router.post('/register', async (req, res) => {
    try {
      const { name, email, password, country } = req.body;
      const user = new User({ name, email, country });
      
      await User.register(user, password); // Automatically hashes password
  
      // Optional: log them in right after registration
      req.login(user, function(err) {
        if (err) return next(err);
        return res.redirect('/api/disasters'); // or wherever you want to send them
      });
    } catch (err) {
      console.error(err);
      res.send('Error during registration: ' + err.message);
    }
});

router.get('/register',(req,res)=>{
    res.render("../../frontend/views/register");
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/api/disasters', // Change to your desired route
    failureRedirect: '/auth/login',
    failureFlash: false // Set to true if using connect-flash
}));

router.get('/login', (req, res) => {
    res.render('../../frontend/views/login');
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) return next(err);
        res.redirect('/api/disasters');  // Redirect to home after logout
    });
});


module.exports = router;
