const express = require('express');
const router = express.Router();
const {getDisaster} = require('../controllers/disasterController');
const nodemailer = require('nodemailer');
const Alert = require('../models/Disaster');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const User = require('../models/User'); // ← Add this at the top if not already

router.get('/',getDisaster);

router.post('/subscribe', isLoggedIn, async (req, res) => {
  const { country } = req.body;
  const userEmail = req.user.email;

  try {
      
    const alerts = await Alert.find({ location: { $regex: new RegExp(country, 'i') } });

    const transporter = nodemailer.createTransport({
      host : "smtp.gmail.com",
      port : 465,
      secure : true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const alertsHtml = alerts.length
      ? alerts.map(alert => `<p><strong>${alert.title}</strong><br>${alert.summary}</p>`).join('')
      : '<p>No current alerts in your region.</p>';

    const mailOptions = {
      from: `"Disaster Relief Alerts" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Thanks for Subscribing - ${country} Alerts`,
      html: `
        <h2>Thank you for subscribing to Disaster Relief!</h2>
        <p>We will notify you with any disaster updates for <strong>${country}</strong>.</p>
        <hr />
        <h3>Current Alerts:</h3>
        ${alertsHtml}
      `
    };

    await transporter.sendMail(mailOptions);

    // 🌟 Save the subscribed country
await User.findByIdAndUpdate(req.user._id, {
  $addToSet: { subscribedCountries: country }
});


    console.log("Subscribed successfully! Check your inbox.");
    res.redirect("/api/disasters");
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).send("Something went wrong. Try again later.");
  }
});

router.post('/unsubscribe', isLoggedIn, async (req, res) => {
  const { country } = req.body;
  const userId = req.user._id;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { subscribedCountries: country }
    });

    console.log(`Unsubscribed from ${country}`);
    res.redirect('/api/disasters'); // Refresh the page to update visibility
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).send("Failed to unsubscribe. Try again.");
  }
});


module.exports = router;