const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// A helper function to send mail
async function sendConfirmationEmail(toEmail, userName) {
  try {
    await transporter.sendMail({
      from: '"Disaster Management Team" <yourgmail@gmail.com>',
      to: toEmail,
      subject: 'Help Request Received!',
      html: `
        <h2>Hello ${userName},</h2>
        <p>We have received your help request successfully.</p>
        <p>Please stay safe. Our NGOs will reach out to you very soon.</p>
        <br>
        <p>Warm Regards,<br>Disaster Relief Team</p>
      `
    });
    console.log('Email sent successfully to', toEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendConfirmationEmail;
