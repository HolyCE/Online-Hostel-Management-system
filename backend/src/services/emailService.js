const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HostelHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const templates = {
  welcome: (name, email, password) => ({
    subject: 'Welcome to HostelHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Welcome to HostelHub, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>Please login and change your password immediately.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
      </div>
    `
  }),
  
  roomAllocated: (name, roomNumber, blockName) => ({
    subject: '🎉 Room Allocated Successfully!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Room Allocated Successfully!</h2>
        <p>Dear ${name},</p>
        <p>You have been allocated <strong>Room ${roomNumber}</strong> in <strong>${blockName}</strong>.</p>
        <p>Welcome to your new space! If you have any issues, please contact the hostel management.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Room</a>
      </div>
    `
  }),
  
  paymentConfirmation: (name, amount, reference) => ({
    subject: '💰 Payment Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Payment Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your payment of <strong>₦${amount.toLocaleString()}</strong> has been received and confirmed.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/payments" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Payment</a>
      </div>
    `
  }),
  
  ticketUpdate: (name, ticketTitle, status, comment) => ({
    subject: `📝 Ticket Update: ${ticketTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Ticket Status Updated</h2>
        <p>Dear ${name},</p>
        <p>Your ticket "<strong>${ticketTitle}</strong>" has been updated to <strong>${status}</strong>.</p>
        ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/dashboard/tickets" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
    `
  })
};

module.exports = { sendEmail, templates };
