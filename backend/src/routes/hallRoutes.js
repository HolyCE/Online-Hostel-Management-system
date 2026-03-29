const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllHalls,
  getHallById,
  getHallRooms,
  createHall,
  updateHall,
  deleteHall
} = require('../controllers/hallController');

// Protected routes (authenticated users can view halls)
router.get('/', protect, getAllHalls);
router.get('/:id', protect, getHallById);
router.get('/:id/rooms', protect, getHallRooms);

// Admin only routes
router.post('/', protect, authorize('admin'), createHall);
router.put('/:id', protect, authorize('admin'), updateHall);
router.delete('/:id', protect, authorize('admin'), deleteHall);

module.exports = router;
