const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
router.post('/register', async (req, res) => {
  try {
    const phone = '+91' + req.body.phone;

    const { name, email, password, country } = req.body;

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Save user data + OTP in session
    req.session.tempUser = {
      name,
      email,
      password,
      country,
      phone ,
      otp,
      otpExpires
    };

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Account Verification',
      text: `Hello ${name},\n\nYour OTP is: ${otp}\n\nIt expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.render('../../frontend/views/verifyOTP', { email });
  } catch (err) {
    console.error(err);
    res.redirect("/auth/register");
  }
});


router.post('/verify-otp', async (req, res) => {
  const { otpCombined } = req.body;

  if (!req.session.tempUser) {
    return res.send("Session expired. Please register again.");
  }

  const { name, email, password, country,phone , otp, otpExpires } = req.session.tempUser;

  // Validate OTP
  if (otp !== otpCombined || otpExpires < Date.now()) {
    return res.send('Invalid or expired OTP');
  }

  try {
    const newUser = new User({
      name,
      email,
      country,
      phone ,
      isVerified: true
    });

    await User.register(newUser, password);

    // Clear session after successful verification
    req.session.tempUser = null;

    // Login user
    req.login(newUser, function (err) {
      if (err) return next(err);
      res.redirect('/api/disasters');
    });
  } catch (err) {
    console.error(err);
    res.redirect("/auth/register");
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
