const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// @desc    Update system settings
// @route   POST /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { general, notifications, security, academic } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update each section
    if (general) {
      settings.general = { ...settings.general, ...general };
    }
    if (notifications) {
      settings.notifications = { ...settings.notifications, ...notifications };
    }
    if (security) {
      settings.security = { ...settings.security, ...security };
    }
    if (academic) {
      settings.academic = { ...settings.academic, ...academic };
    }
    
    await settings.save();
    
    // Log the action
    await AuditLog.create({
      user: req.user.id,
      action: 'SYSTEM_CONFIG_CHANGE',
      details: 'System settings were updated',
      resource: 'system',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/admin/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const settings = await Settings.create({});
    
    // Log the action
    await AuditLog.create({
      user: req.user.id,
      action: 'SYSTEM_CONFIG_CHANGE',
      details: 'System settings were reset to default',
      resource: 'system',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};
