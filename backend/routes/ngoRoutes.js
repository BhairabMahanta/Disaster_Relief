const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const Request = require('../models/Request');
const { isNGO } = require('../middlewares/isNGO');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const sendAcceptedEmail = require('../utils/ngoAccepted');
const Feedback = require('../models/NgoFeedback');  // Import feedback model
const nodemailer = require('nodemailer');
const EmergencySOS = require("../models/EmergencySOS");
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const crypto = require('crypto');

router.get('/',(req,res)=>{
    res.render("ngo");
});



// Route to display requests on the NGO dashboard
router.get('/dashboard', isNGO,async (req, res) => {
    if (!req.isAuthenticated() ) {  // Check if the user is authenticated and is an NGO
      return res.redirect('/auth/login');
    }
  
    try {
      // Fetch all requests that are pending (you can add more filters as needed)
      const requests = await Request.find({ pending: true }).populate('user');
      const sosRequests = await EmergencySOS.find({ status: "pending" }).populate("user");
      // Render the dashboard with the requests
      res.render('ngoDashboard', { requests,sosRequests });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.redirect('/auth/login');
    }
  });
  
// NGO Login Route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/ngo/dashboard', // After successful login
  failureRedirect: '/ngo/login',      // If login fails
  failureFlash: true
}));

router.get('/login',(req,res)=>{
    res.render("ngologin");
});


router.get('/register',(req,res)=>{
    res.render("ngoregister");
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country, areaOfOperation } = req.body;

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Save NGO data + OTP in session
    req.session.tempNgoUser = {
      name,
      email,
      password,
      country,
      areaOfOperation,
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
      subject: 'Your OTP for NGO Account Verification',
      text: `Hello ${name},\n\nYour OTP is: ${otp}\n\nIt expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.render('../../frontend/views/ngoVerifyOTP', { email });
  } catch (err) {
    console.error(err);
    res.redirect("/auth/ngo/register");
  }
});

router.post('/verify-otp', async (req, res) => {
  const { otpCombined } = req.body;

  if (!req.session.tempNgoUser) {
    return res.send("Session expired. Please register again.");
  }

  const { name, email, password, country, areaOfOperation, phone, otp, otpExpires } = req.session.tempNgoUser;

  // Validate OTP
  if (otp !== otpCombined || otpExpires < Date.now()) {
    return res.send('Invalid or expired OTP');
  }

  try {
    const newNgoUser = new User({
      name,
      email,
      country,
      areaOfOperation,
      role: 'ngo',  // Set role to 'ngo' for NGO users
      isVerified: true
    });

    await User.register(newNgoUser, password);

    // Clear session after successful verification
    req.session.tempNgoUser = null;

    // Log the NGO in
    req.login(newNgoUser, function (err) {
      if (err) return next(err);
      res.redirect('/ngo/dashboard'); // Redirect to the desired route after successful login
    });
  } catch (err) {
    console.error(err);
    res.redirect("/auth/ngo/register");
  }
});


router.post('/respond/:id', isNGO, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('user'); 
      if (!request) {
        return res.redirect('/ngo/dashboard');
      }
      request.pending = false;
      request.respondedBy = req.user._id;
      await request.save();
      console.log("Saved.");
      await sendAcceptedEmail(request.user.email, request.user.name);
      res.redirect('/ngo/dashboard');
    } catch (error) {
      console.error(error);
      res.redirect('/ngo/dashboard');
    }
});


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Feedback Route
router.post('/feedback', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    const { rating, message } = req.body;

    // 1. Save feedback to MongoDB
    const newFeedback = new Feedback({
      user: req.user._id,
      rating: rating,
      message: message
    });

    await newFeedback.save();
    console.log('Feedback saved in database.');

    // 2. Send feedback email to Admin
    await transporter.sendMail({
      from: `"${req.user.name}" <${req.user.email}>`,
      to: process.env.EMAIL_USER,
      subject: `New Feedback from ${req.user.name}`,
      html: `
        <h2>Feedback from: ${req.user.name} (${req.user.email})</h2>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    console.log('Feedback email sent successfully!');
    res.redirect('/ngo?feedback=success');

  } catch (error) {
    console.error('Error handling feedback:', error);
    res.redirect('/ngo/dashboard');
  }
});

router.post("/respond1/:id", isLoggedIn, async (req, res) => {
  try {
    const sos = await EmergencySOS.findById(req.params.id).populate("user");
    
if (!sos || !sos.user) {
  console.error("Invalid SOS or user not populated:", sos);
  return res.status(404).send("SOS or user data not found.");
}

    sos.status = "accepted";
    await sos.save();

    // Send email to user
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
      to: sos.user.email,
      subject: "NGO Help on the Way",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #007bff;">Hello ${sos.user.name || "Friend"},</h2>
        <p>We have received your emergency SOS request and an NGO responder has accepted it.</p>
        <p><strong>Location:</strong> Latitude ${sos.location.lat}, Longitude ${sos.location.lng}</p>
        <p>Hang tight! Help is on the way 🚑</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 14px; color: gray;">This is an automated message from Community Aid.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);

        // SMS
        const userPhone = sos.user.phone;
        if (userPhone) {
          await client.messages.create({
            body: `Hello ${sos.user.name || 'Friend'}, your SOS has been accepted. Help is on the way to your location (Lat: ${sos.location.lat}, Lng: ${sos.location.lng}). Stay safe! - Disaster Relief Team🚑`,
            from: process.env.TWILIO_PHONE,
            to: userPhone
          });
        }

    res.redirect("/ngo/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to respond");
  }
});
module.exports = router;