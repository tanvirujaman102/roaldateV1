const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

class SMSService {
  constructor() {
    this.client = null;
    if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendSMS(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      console.log('SMS sent: ' + result.sid);
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendVerificationCode(phone, code) {
    const message = `Your RoalDate verification code is: ${code}. This code will expire in 5 minutes.`;
    return this.sendSMS(phone, message);
  }

  async sendPhoneVerificationCode(phone) {
    const code = this.generateVerificationCode();
    const message = `Your RoalDate phone verification code is: ${code}. This code will expire in 5 minutes.`;
    
    // Store the code in Redis or database for verification
    // For now, just send the SMS
    await this.sendSMS(phone, message);
    
    return code;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendWelcomeSMS(phone, username) {
    const message = `Welcome to RoalDate, ${username}! Your account has been successfully created. Start connecting with friends and exploring new features!`;
    return this.sendSMS(phone, message);
  }

  async sendPasswordResetSMS(phone, token) {
    const message = `Your RoalDate password reset code is: ${token}. This code will expire in 1 hour.`;
    return this.sendSMS(phone, message);
  }

  async sendTwoFactorCodeSMS(phone, code) {
    const message = `Your RoalDate 2FA code is: ${code}. This code will expire in 5 minutes.`;
    return this.sendSMS(phone, message);
  }

  async sendNotificationSMS(phone, message) {
    return this.sendSMS(phone, message);
  }
}

module.exports = new SMSService();
