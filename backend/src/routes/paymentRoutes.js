const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  initializePayment,
  verifyPayment,
  getMyPayments,
  getAllPayments,
  handleWebhook
} = require('../controllers/paymentController');

// Public webhook
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);
router.get('/my-payments', protect, getMyPayments);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPayments);

module.exports = router;
