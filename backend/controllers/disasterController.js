const Alert = require('../models/Disaster');
const nodemailer = require('nodemailer');
const User = require('../models/User'); 
const fetchAndStoreGdacsData = require('../utils/fetchGdacs');

module.exports.getDisaster =async (req,res)=>{
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Subtract 7 days from today
    
    const alerts = await Alert.find({
      eventDate: { $gte: sevenDaysAgo } // Get alerts in the last 7 days
    }).sort({ eventDate: -1 }); // Sort in descending order by event date
    
    res.render('../../frontend/views/disasterAlerts',{alerts, user: req.user });
};

module.exports.getDisastersAPI = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const alerts = await Alert.find({
      eventDate: { $gte: sevenDaysAgo }
    }).sort({ eventDate: -1 });

    res.status(200).json({ alerts }); // ✅ send JSON, not render()
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};


module.exports.subscribe = async (req, res) => {
  const { country } = req.body;
  const userEmail = req.user.email;
  console.log("USEREMAIL:", userEmail)
  console.log("subscribing")
  try {
      
    const alerts = await Alert.find({ location: { $regex: new RegExp(country, 'i') } });
    console.log("alert", alerts)
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
    console.log("subscribed")

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
};

module.exports.unsubscribe =  async (req, res) => {
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
};
