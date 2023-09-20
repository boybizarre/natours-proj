// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },

    // activate in gmail "less secure app" option
  });

  // 2) Defined the email option
  const mailOptions = {
    from: 'Boy Bizarre <boybizarre@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

// mailtrap.io
