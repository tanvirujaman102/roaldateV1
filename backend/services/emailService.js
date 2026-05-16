const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #3b82f6;">Welcome to RoalDate!</h2>
        <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p style="margin-top: 20px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #666;">This link will expire in 24 hours.</p>
      </div>
    `;

    return this.sendEmail(email, 'Verify your RoalDate account', html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #3b82f6;">Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to reset it.</p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666;">This link will expire in 1 hour.</p>
      </div>
    `;

    return this.sendEmail(email, 'Reset your RoalDate password', html);
  }

  async sendTwoFactorCodeEmail(email, code) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #3b82f6;">Two-Factor Authentication Code</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code will expire in 5 minutes.</p>
      </div>
    `;

    return this.sendEmail(email, 'Your RoalDate verification code', html);
  }

  async sendWelcomeEmail(email, username) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #3b82f6;">Welcome to RoalDate, ${username}!</h2>
        <p>Thank you for joining RoalDate! Your account has been successfully created and verified.</p>
        <p>You can now:</p>
        <ul>
          <li>Create and share posts</li>
          <li>Connect with friends</li>
          <li>Join video chats</li>
          <li>Use the dating features</li>
          <li>And much more!</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
          Get Started
        </a>
        <p style="margin-top: 20px; color: #666;">We're excited to have you on board!</p>
      </div>
    `;

    return this.sendEmail(email, 'Welcome to RoalDate!', html);
  }

  async sendNotificationEmail(email, title, message, actionUrl = null) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #3b82f6;">${title}</h2>
        <p>${message}</p>
        ${actionUrl ? `<a href="${actionUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
          View Details
        </a>` : ''}
        <p style="margin-top: 20px; color: #666;">This is an automated notification from RoalDate.</p>
      </div>
    `;

    return this.sendEmail(email, title, html);
  }
}

module.exports = new EmailService();
