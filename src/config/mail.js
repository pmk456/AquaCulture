const nodemailer = require('nodemailer');

const createTransporter = () => {
  // if (!process.env.SMTP_HOST) {
  //   console.warn('[mail] SMTP_HOST not configured; email sending is disabled.');
  //   return null;
  // }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'false', // true for 465, false for others
    auth: process.env.SMTP_USER || 'patanmusthakheem786@gmail.com'
      ? {
          user: process.env.SMTP_USER || 'patanmusthakheem786@gmail.com',
          pass: process.env.SMTP_PASS || 'mnyr hbso kkpo jwnt'
        }
      : undefined
  });

  return transporter;
};

const transporter = createTransporter();

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.warn('[mail] Attempted to send email but transporter is not configured.');
    return;
  }

  const from = process.env.MAIL_FROM || 'patanmusthakheem786@gmail.com';

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendMail
};


