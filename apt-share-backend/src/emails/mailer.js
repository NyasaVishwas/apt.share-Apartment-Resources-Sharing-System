const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'test') {
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }

  // Create ethereal test account for dev or use standard nodemailer configuration
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    logger.info(`Ethereal Mail Transporter Initialized (${testAccount.user})`);
  } catch (err) {
    logger.warn('Fallback to jsonTransport for mailer');
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return transporter;
};

const sendOtpEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const mail = await getTransporter();
  const info = await mail.sendMail({
    from: '"apt.share Security" <no-reply@aptshare.community>',
    to: toEmail,
    subject: `apt.share - Your ${purpose} Code: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #5b5bd6; margin-top: 0;">apt.share</h2>
        <p>Hello,</p>
        <p>Use the following 6-digit code to complete your ${purpose.toLowerCase()}:</p>
        <div style="background-color: #f7f7f8; padding: 16px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0a0a0a;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `
  });

  if (info.messageId && nodemailer.getTestMessageUrl) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[EMAIL OTP PREVIEW LINK]: ${previewUrl}`);
    }
  }
  return info;
};

module.exports = {
  sendOtpEmail
};
