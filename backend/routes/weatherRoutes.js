const express = require('express');
const router = express.Router();
const axios = require("axios");
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const User = require('../models/User'); 

router.get("/", async (req, res) => {
  res.render('weather')
});
  

// Subscribe to alerts
router.post('/subscribeWindAlerts', isLoggedIn  , async (req, res) => {
    try {
      const city = req.body.city;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      if (!user.subscribedCountries.includes(city)) {
        user.subscribedCountries.push(city);
        await user.save();
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error subscribing:', error);
      res.json({ success: false, message: 'Server error' });
    }
});
  

module.exports = router;