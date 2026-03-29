const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  resetSettings
} = require('../controllers/settingsController');

// All settings routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/reset', resetSettings);

module.exports = router;
