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
async function sendWindAlert(city) {
  const users = await User.find({ subscribedCountries: city });

  users.forEach(user => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `High Wind Alert for ${city}`,
      text: `⚠️ Winds are very strong in ${city}. Please stay indoors and stay safe.`
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.error('Error sending mail:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });
}
