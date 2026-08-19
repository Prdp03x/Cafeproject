const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendResetEmail = async (toEmail, rawToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      toEmail,
    subject: "Password Reset — Cafe SaaS",
    text:    `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html:    `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};

module.exports = { sendResetEmail };