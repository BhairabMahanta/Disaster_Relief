const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const Request = require('../models/Request');
const sendConfirmationEmail = require('../utils/citizenRequestEmail'); 

router.post('/requestHelp', async (req, res) => {
    const { description, location } = req.body;
  
    // Ensure the user is logged in and get the user's details
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/login'); // Redirect to login page if not authenticated
    }
  
    const user = req.user; // The logged-in user details (from the session)
  
    // Split the location string into lat and lng
    if (!location) {
      console.log('Location is missing');
      return res.redirect('/error'); // Handle missing location
    }
  
    const [latitude, longitude] = location.split(',');
  
    // Check if we successfully split the location
    console.log('Location received:', latitude, longitude);
  
    try {
      const newRequest = new Request({
        user: user._id,  // Store the user ID (reference to the logged-in user)
        description,
        location: { lat: latitude, lng: longitude }, // Store location as an object with lat & lng
        pending: true  // Set the request as pending by default
      });
  
      await newRequest.save();
      console.log('Request saved successfully');
      await sendConfirmationEmail(req.user.email, req.user.name);
      res.redirect('/ngo'); // Redirect to success page after submission
  
    } catch (error) {
      console.error('Error saving request:', error);
      res.redirect('/auth/login'); // Redirect to error page in case of failure
    }
  });
  
router.get("/requestHelp",(req,res)=>{
    res.render("citizenRequestForm");
});

module.exports = router;