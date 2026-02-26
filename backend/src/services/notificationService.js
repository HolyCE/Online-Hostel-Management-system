const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Email configuration
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // SMS configuration (Twilio)
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  // Send email
  async sendEmail(to, subject, html) {
    try {
      await this.emailTransporter.sendMail({
        from: `"Hostel Management" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html
      });
      
      // Log notification
      await Notification.create({
        recipient: to,
        type: 'email',
        subject,
        content: html,
        status: 'sent'
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
  
  // Send SMS
  async sendSMS(to, message) {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      
      await Notification.create({
        recipient: to,
        type: 'sms',
        content: message,
        status: 'sent'
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }
  
  // Room allocation notification
  async sendRoomAllocation(student, room) {
    const subject = 'Room Allocated Successfully';
    const html = `
      <h2>Hello ${student.name},</h2>
      <p>Your room has been successfully allocated!</p>
      <p><strong>Room Details:</strong></p>
      <ul>
        <li>Room Number: ${room.roomNumber}</li>
        <li>Block: ${room.blockName}</li>
        <li>Price: ₦${room.price}</li>
      </ul>
      <p>Please proceed to make payment to confirm your allocation.</p>
    `;
    
    await this.sendEmail(student.email, subject, html);
    
    if (student.phoneNumber) {
      const sms = `Room allocated! Room ${room.roomNumber}, Block ${room.blockName}. Make payment to confirm.`;
      await this.sendSMS(student.phoneNumber, sms);
    }
  }
  
  // Payment confirmation
  async sendPaymentConfirmation(student, payment) {
    const subject = 'Payment Confirmed';
    const html = `
      <h2>Payment Successful!</h2>
      <p>Dear ${student.name},</p>
      <p>Your payment of ₦${payment.amount} has been confirmed.</p>
      <p><strong>Transaction Details:</strong></p>
      <ul>
        <li>Reference: ${payment.reference}</li>
        <li>Date: ${new Date(payment.paymentDate).toLocaleString()}</li>
        <li>Status: ${payment.status}</li>
      </ul>
      <p>Thank you for choosing our hostel.</p>
    `;
    
    await this.sendEmail(student.email, subject, html);
  }
  
  // Ticket update notification
  async sendTicketUpdateNotification(student, ticket) {
    const subject = `Ticket #${ticket._id} Status Updated`;
    const html = `
      <h2>Ticket Status Update</h2>
      <p>Your maintenance ticket has been updated.</p>
      <p><strong>Ticket Details:</strong></p>
      <ul>
        <li>Title: ${ticket.title}</li>
        <li>Category: ${ticket.category}</li>
        <li>Status: ${ticket.status}</li>
        ${ticket.resolution ? `<li>Resolution: ${ticket.resolution}</li>` : ''}
      </ul>
    `;
    
    await this.sendEmail(student.email, subject, html);
  }
  
  // Payment reminder
  async sendPaymentReminder(student, dueDate) {
    const subject = 'Payment Reminder';
    const html = `
      <h2>Payment Due Reminder</h2>
      <p>Dear ${student.name},</p>
      <p>This is a reminder that your hostel payment is due on ${dueDate}.</p>
      <p>Please make your payment to avoid any inconvenience.</p>
      <p><a href="${process.env.FRONTEND_URL}/payments">Make Payment Now</a></p>
    `;
    
    await this.sendEmail(student.email, subject, html);
  }
}

module.exports = new NotificationService();