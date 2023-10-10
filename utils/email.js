// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const mailgun = require('nodemailer-mailgun-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Boy Bizarre <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {

      return 1;
      // MailGun
      // return nodemailer.createTransport(
      //   mailgun({
      //     auth: {
      //       apiKey: process.env.MAILGUN_API_KEY,
      //       domain: process.env.MAILGUN_DOMAIN,
      //     },
      //     secure: false,
      //   }),
      // );
    }

    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    const options = {
      wordwrap: 130,
      // ...
    };

    // 2) Defined the email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, options),
      // html:
    };

    // 3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};

// mailtrap.io
