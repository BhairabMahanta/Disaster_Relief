const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Alert = require('../models/Disaster');
const User = require('../models/User');

// Scheduler to send emails every day at midnight
cron.schedule('0 4 * * *', async () => {
  try {
    // Fetch all users who have subscribed to at least one country
    const users = await User.find({ subscribedCountries: { $ne: [] } });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Loop through each user
    for (let user of users) {
      const { email, subscribedCountries } = user;

      // Loop through each country the user has subscribed to
      for (let country of subscribedCountries) {
        const alerts = await Alert.find({
          location: { $regex: new RegExp(country, 'i') }
        });

        // Create HTML content for the email
        const alertsHtml = alerts.length
          ? alerts.map(alert => `<p><strong>${alert.title}</strong><br>${alert.summary}</p>`).join('')
          : '<p>No current alerts in your region.</p>';

        const mailOptions = {
          from: `"Disaster Relief Alerts" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Daily Disaster Alerts for ${country}`,
          html: `
            <h2>Daily Disaster Updates</h2>
            <p>Here are the latest disaster updates for <strong>${country}</strong>:</p>
            <hr />
            ${alertsHtml}
          `
        };

        // Send email
        await transporter.sendMail(mailOptions);
      }
    }

    console.log("Daily emails sent successfully!");

  } catch (err) {
    console.error("Error sending daily emails:", err);
  }
});
