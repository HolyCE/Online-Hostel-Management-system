const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendWelcomeEmail,
  sendRoomAllocationEmail,
  sendPaymentConfirmationEmail,
  sendTicketUpdateEmail
} = require('../controllers/emailController');

// Protected routes for sending emails
router.post('/welcome', protect, sendWelcomeEmail);
router.post('/room-allocation', protect, sendRoomAllocationEmail);
router.post('/payment-confirmation', protect, sendPaymentConfirmationEmail);
router.post('/ticket-update', protect, sendTicketUpdateEmail);

module.exports = router;
