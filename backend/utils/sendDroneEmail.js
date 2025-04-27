const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendDroneDispatchEmail(userEmail, userName, baseLat, baseLon, targetLat, targetLon, priority) {
  const mailOptions = {
    from: `"Disaster Relief Drone Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Drone Mission Dispatched 🚁',
    html: `
      <h2>Hello ${userName},</h2>
      <p>Your drone mission has been dispatched with priority <strong>${priority}</strong>.</p>
      <p><strong>From:</strong> (${baseLat}, ${baseLon})<br/>
      <strong>To:</strong> (${targetLat}, ${targetLon})</p>
      <p>You will receive another email when the drone reaches the target location.</p>
      <hr/>
      <p>Thank you for using our service!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendDroneCompletionEmail(userEmail, userName, targetLat, targetLon) {
  const mailOptions = {
    from: `"Disaster Relief Drone Team" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Drone Mission Completed 🎯',
    html: `
      <h2>Hello ${userName},</h2>
      <p>Your drone has reached the target location (${targetLat}, ${targetLon}).</p>
      <hr/>
      <p>Thank you for using our service!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendDroneDispatchEmail,
  sendDroneCompletionEmail,
};
