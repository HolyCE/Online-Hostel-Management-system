const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  applyForRoom,
  getAvailableRooms,
  getMyRoom,
  adminAllocateRoom
} = require('../controllers/roomController');

// Public routes
router.get('/', getAllRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoom);

// Protected student routes
router.get('/student/my-room', protect, getMyRoom);
router.post('/apply', protect, applyForRoom);

// Admin only routes
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);
router.post('/admin-allocate', protect, authorize('admin'), adminAllocateRoom);

module.exports = router;
