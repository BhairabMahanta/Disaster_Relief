const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const Request = require('../models/Request');
const { isNGO } = require('../middlewares/isNGO');
const sendAcceptedEmail = require('../utils/ngoAccepted');
const Feedback = require('../models/NgoFeedback');  // Import feedback model
const nodemailer = require('nodemailer');

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
  
      // Render the dashboard with the requests
      res.render('ngoDashboard', { requests });
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
    const { name, email, country, phone, areaOfOperation, password } = req.body;
    try {
      const newUser = new User({
        name,
        email,
        country,
        phone,
        areaOfOperation,
        role: 'ngo' // VERY IMPORTANT
      });
  
      await User.register(newUser, password);
  
      // After successful registration
      res.redirect('/ngo/login'); // Redirect to login page
    } catch (error) {
      console.error(error);
      res.redirect('/ngo/register'); // Redirect back if error
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


module.exports = router;