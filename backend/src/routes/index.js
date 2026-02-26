const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const paymentRoutes = require('./paymentRoutes');
const ticketRoutes = require('./ticketRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

// Use routes
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/payments', paymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    name: 'Hostel Management API',
    version: '1.0.0',
    description: 'API for managing hostel operations',
    endpoints: {
      auth: '/api/auth',
      rooms: '/api/rooms',
      payments: '/api/payments',
      tickets: '/api/tickets',
      users: '/api/users',
      admin: '/api/admin'
    },
    documentation: 'https://github.com/yourusername/hostel-management-backend'
  });
});

module.exports = router;
