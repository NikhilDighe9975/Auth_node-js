const BaseService = require('@baapcompany/core-api/services/base.service');
const userService = require('./user.service'); // Import the userService module

class WhatsappService extends BaseService {
  constructor(dbModel, entityName) {
    super(dbModel, entityName);
  }

  async sendOtp({ phoneNumber }) {
    try {
      const serviceResponse = await userService.getUserByUserName(phoneNumber);
      const user = serviceResponse.data && serviceResponse.data._doc;

      if (!user) {
        throw new Error('User with this phone number does not exist');
      }

      // Integrate with the WhatsApp service to send the OTP
      const otp = generateOtp(); // Assuming you have a function to generate the OTP
      const otpSent = await this.sendOtpViaWhatsApp(phoneNumber, otp);

      if (!otpSent) {
        throw new Error('Failed to send OTP');
      }

      return {
        message: 'OTP Sent Successfully',
      };
    } catch (error) {
      return {
        isError: true,
        message: error.message,
      };
    }
  }

  async sendOtpViaWhatsApp(phoneNumber, otp) {
    // Implement the logic to send the OTP via WhatsApp
    // Use a third-party library or API to send the WhatsApp message
  }
}

module.exports = WhatsappService;
