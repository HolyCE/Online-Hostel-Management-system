const twilio = require('twilio');
const Notification = require('../models/Notification');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  // Send SMS
  async sendSMS(to, message, options = {}) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
        ...options
      });

      // Log notification
      await Notification.create({
        recipient: to,
        type: 'sms',
        channel: 'system',
        content: message,
        status: 'sent',
        sentAt: new Date(),
        metadata: { sid: result.sid }
      });

      return result;
    } catch (error) {
      console.error('SMS sending failed:', error);
      
      // Log failure
      await Notification.create({
        recipient: to,
        type: 'sms',
        channel: 'system',
        content: message,
        status: 'failed',
        failureReason: error.message
      });

      throw error;
    }
  }

  // Payment confirmation SMS
  async sendPaymentConfirmation(user, payment) {
    const message = `Payment Confirmed! ₦${payment.amount} received. Reference: ${payment.reference}. Thank you for choosing our hostel.`;
    return this.sendSMS(user.phoneNumber, message);
  }

  // Room allocation SMS
  async sendRoomAllocation(user, room) {
    const message = `Room Allocated! Room ${room.roomNumber}, Block ${room.blockName}. Please make payment to confirm.`;
    return this.sendSMS(user.phoneNumber, message);
  }

  // Ticket update SMS
  async sendTicketUpdate(user, ticket) {
    const message = `Ticket #${ticket._id.toString().slice(-6)}: Status updated to ${ticket.status}. Check app for details.`;
    return this.sendSMS(user.phoneNumber, message);
  }

  // Emergency notification
  async sendEmergencyNotification(users, message) {
    const promises = users.map(user => {
      if (user.phoneNumber) {
        return this.sendSMS(user.phoneNumber, `🚨 EMERGENCY: ${message}`);
      }
    });
    return Promise.all(promises);
  }
}

module.exports = new SMSService();
