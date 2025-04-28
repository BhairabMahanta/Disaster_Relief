const nodemailer = require('nodemailer');

// Setup transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Helper function to send acceptance email
async function sendAcceptedEmail(toEmail, userName) {
  try {
    await transporter.sendMail({
      from: '"Disaster Management Team" <yourgmail@gmail.com>',
      to: toEmail,
      subject: 'Your Help Request Has Been Accepted!',
      html: `
        <h2>Hello ${userName},</h2>
        <p>Good news! Your help request has been accepted by one of our NGO teams.</p>
        <p>They are on their way to your location. Please stay safe and keep your phone nearby.</p>
        <br>
        <p>Warm Regards,<br>Disaster Relief Team</p>
      `
    });
    console.log('Acceptance email sent to', toEmail);
  } catch (error) {
    console.error('Error sending acceptance email:', error);
  }
}

module.exports = sendAcceptedEmail;
