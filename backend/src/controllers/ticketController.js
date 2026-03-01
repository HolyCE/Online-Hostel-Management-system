const MaintenanceTicket = require('../models/MaintenanceTicket');
const User = require('../models/User');
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('room');

    if (!student.room) {
      return res.status(400).json({
        success: false,
        message: 'You must have a room allocated to submit complaints'
      });
    }

    const ticket = await MaintenanceTicket.create({
      ...req.body,
      student: student._id,
      room: student.room._id
    });

    // Log action
    await AuditLog.create({
      user: student._id,
      action: 'CREATE_TICKET',
      details: `Ticket created: ${ticket.title}`,
      resource: 'ticket',
      resourceId: ticket._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'in_app',
        channel: 'ticket',
        subject: 'New Maintenance Ticket',
        content: `New ticket from ${student.name}: ${ticket.title}`,
        data: { ticketId: ticket._id, studentId: student._id },
        status: 'sent',
        sentAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message
    });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { student: req.user.id };
    if (status) filter.status = status;

    const tickets = await MaintenanceTicket.find(filter)
      .populate('room', 'roomNumber blockName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaintenanceTicket.countDocuments(filter);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('student', 'name email matricNumber phoneNumber')
      .populate('room', 'roomNumber blockName')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email')
      .populate('comments.user', 'name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to view
    if (ticket.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// @desc    Update ticket status (Admin/Staff)
// @route   PUT /api/tickets/:id
// @access  Private/Admin
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, resolution, assignedTo, priority } = req.body;
    
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('student');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Update fields
    if (status) ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (priority) ticket.priority = priority;

    // Set resolved info
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user.id;
    }

    await ticket.save();

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_TICKET',
      details: `Ticket ${ticket._id} updated to status: ${ticket.status}`,
      resource: 'ticket',
      resourceId: ticket._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    // Notify student
    await Notification.create({
      recipient: ticket.student._id,
      type: 'in_app',
      channel: 'ticket',
      subject: 'Ticket Status Updated',
      content: `Your ticket "${ticket.title}" is now ${ticket.status}`,
      data: { ticketId: ticket._id, status: ticket.status },
      status: 'sent',
      sentAt: new Date()
    });

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('student');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add comment
    ticket.comments.push({
      user: req.user.id,
      comment,
      createdAt: new Date()
    });

    await ticket.save();

    // Notify the other party
    const notifyUser = req.user.id === ticket.student._id.toString() 
      ? ticket.assignedTo 
      : ticket.student._id;

    if (notifyUser) {
      await Notification.create({
        recipient: notifyUser,
        type: 'in_app',
        channel: 'ticket',
        subject: 'New Comment on Ticket',
        content: `New comment on ticket "${ticket.title}": ${comment.substring(0, 50)}...`,
        data: { ticketId: ticket._id },
        status: 'sent',
        sentAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets/admin/all
// @access  Private/Admin
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tickets = await MaintenanceTicket.find(filter)
      .populate('student', 'name email matricNumber room')
      .populate('room', 'roomNumber blockName')
      .populate('assignedTo', 'name email')
      .sort({ 
        priority: -1, // Emergency first
        createdAt: -1 
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MaintenanceTicket.countDocuments(filter);

    // Get statistics
    const stats = await MaintenanceTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: tickets,
      statistics: stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};
