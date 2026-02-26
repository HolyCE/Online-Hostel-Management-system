const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  generateReport,
  getWaitingList,
  getAuditLogs
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.post('/reports', generateReport);
router.get('/waiting-list', getWaitingList);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
