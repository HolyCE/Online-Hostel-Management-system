const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createTicket,
  getMyTickets,
  getTicket,
  updateTicketStatus,
  addComment,
  getAllTickets
} = require('../controllers/ticketController');

// Protected routes
router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/:id', protect, getTicket);
router.post('/:id/comments', protect, addComment);

// Admin routes
router.put('/:id', protect, authorize('admin'), updateTicketStatus);
router.get('/admin/all', protect, authorize('admin'), getAllTickets);

module.exports = router;
