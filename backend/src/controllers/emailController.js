const { sendEmail, templates } = require('../services/emailService');
const User = require('../models/User');

// Send welcome email on registration
exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const template = templates.welcome(name, email, password);
    const result = await sendEmail(email, template.subject, template.html);
    
    res.json({ success: result.success, message: result.success ? 'Welcome email sent' : 'Failed to send email' });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send room allocation email
exports.sendRoomAllocationEmail = async (req, res) => {
  try {
    const { name, email, roomNumber, blockName } = req.body;
    
    const template = templates.roomAllocated(name, roomNumber, blockName);
    const result = await sendEmail(email, template.subject, template.html);
    
    res.json({ success: result.success, message: result.success ? 'Room allocation email sent' : 'Failed to send email' });
  } catch (error) {
    console.error('Room allocation email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send payment confirmation email
exports.sendPaymentConfirmationEmail = async (req, res) => {
  try {
    const { name, email, amount, reference } = req.body;
    
    const template = templates.paymentConfirmation(name, amount, reference);
    const result = await sendEmail(email, template.subject, template.html);
    
    res.json({ success: result.success, message: result.success ? 'Payment confirmation email sent' : 'Failed to send email' });
  } catch (error) {
    console.error('Payment confirmation email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send ticket update email
exports.sendTicketUpdateEmail = async (req, res) => {
  try {
    const { name, email, ticketTitle, status, comment } = req.body;
    
    const template = templates.ticketUpdate(name, ticketTitle, status, comment);
    const result = await sendEmail(email, template.subject, template.html);
    
    res.json({ success: result.success, message: result.success ? 'Ticket update email sent' : 'Failed to send email' });
  } catch (error) {
    console.error('Ticket update email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
