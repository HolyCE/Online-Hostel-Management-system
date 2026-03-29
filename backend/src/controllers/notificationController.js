const Notification = require('../models/Notification');
const { sendEmail, templates } = require('../services/emailService');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { status: 'read', readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Helper function to send notification (can be imported by other controllers)
exports.sendNotification = async (recipientId, type, channel, subject, content, metadata = {}, sendEmailFlag = true) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      recipient: recipientId,
      type: 'in_app',
      channel,
      subject,
      content,
      status: 'sent',
      sentAt: new Date(),
      metadata
    });
    
    // Send email if enabled
    if (sendEmailFlag) {
      const user = await User.findById(recipientId);
      if (user && user.email) {
        let emailTemplate;
        switch (channel) {
          case 'room':
            emailTemplate = templates.roomAllocated(user.name, metadata.roomNumber, metadata.blockName);
            break;
          case 'payment':
            emailTemplate = templates.paymentConfirmation(user.name, metadata.amount, metadata.reference);
            break;
          case 'ticket':
            emailTemplate = templates.ticketUpdate(user.name, metadata.ticketTitle, metadata.status, metadata.comment);
            break;
          default:
            emailTemplate = {
              subject: subject,
              html: `<p>${content}</p>`
            };
        }
        
        await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
    return null;
  }
};
