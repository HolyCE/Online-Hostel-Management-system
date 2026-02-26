const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email
  async sendEmail(to, subject, html, options = {}) {
    try {
      const mailOptions = {
        from: `"Hostel Management" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log notification
      await Notification.create({
        recipient: to,
        type: 'email',
        channel: 'system',
        subject,
        content: html,
        status: 'sent',
        sentAt: new Date(),
        metadata: { messageId: info.messageId }
      });

      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failure
      await Notification.create({
        recipient: to,
        type: 'email',
        channel: 'system',
        subject,
        content: html,
        status: 'failed',
        failureReason: error.message
      });

      throw error;
    }
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Hostel Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome ${user.name}!</h2>
        <p>Your account has been created successfully.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Matric Number:</strong> ${user.matricNumber}</p>
          <p><strong>Role:</strong> ${user.role}</p>
        </div>
        <p>You can now log in to access the hostel management system.</p>
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background-color: #3498db; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Login Now
        </a>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Payment confirmation email
  async sendPaymentConfirmation(user, payment) {
    const subject = 'Payment Confirmed - Hostel Management';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Payment Successful!</h2>
        <p>Dear ${user.name},</p>
        <p>Your payment has been confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Payment Details</h3>
          <p><strong>Amount:</strong> ₦${payment.amount}</p>
          <p><strong>Reference:</strong> ${payment.reference}</p>
          <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${payment.status}</p>
        </div>
        <p>Thank you for choosing our hostel.</p>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Ticket update email
  async sendTicketUpdate(user, ticket) {
    const subject = `Ticket Update: ${ticket.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e67e22;">Ticket Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>Your maintenance ticket has been updated.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Ticket Details</h3>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          ${ticket.resolution ? `<p><strong>Resolution:</strong> ${ticket.resolution}</p>` : ''}
        </div>
        <a href="${process.env.FRONTEND_URL}/tickets/${ticket._id}" 
           style="background-color: #3498db; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          View Ticket
        </a>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Room allocation email
  async sendRoomAllocation(user, room) {
    const subject = 'Room Allocated - Hostel Management';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Room Allocated Successfully!</h2>
        <p>Dear ${user.name},</p>
        <p>Your room has been allocated.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Room Details</h3>
          <p><strong>Room Number:</strong> ${room.roomNumber}</p>
          <p><strong>Block:</strong> ${room.blockName}</p>
          <p><strong>Floor:</strong> ${room.floorNumber}</p>
          <p><strong>Price:</strong> ₦${room.price}</p>
        </div>
        <p>Please proceed to make payment to confirm your allocation.</p>
        <a href="${process.env.FRONTEND_URL}/payments" 
           style="background-color: #3498db; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Make Payment
        </a>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // Payment reminder email
  async sendPaymentReminder(user, dueDate) {
    const subject = 'Payment Reminder - Hostel Management';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Payment Reminder</h2>
        <p>Dear ${user.name},</p>
        <p>This is a reminder that your hostel payment is due on ${dueDate}.</p>
        <p>Please make your payment to avoid any inconvenience.</p>
        <a href="${process.env.FRONTEND_URL}/payments" 
           style="background-color: #3498db; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Make Payment Now
        </a>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
