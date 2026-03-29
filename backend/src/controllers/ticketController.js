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

// @desc    Get my tickets (student)
// @route   GET /api/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({ student: req.user.id })
      .populate('student', 'name email')
      .populate('room', 'roomNumber blockName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
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

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('student', 'name email')
      .populate('room', 'roomNumber blockName')
      .populate('assignedTo', 'name')
      .populate('comments.user', 'name role');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check if user is authorized (student who created it or admin)
    if (req.user.role !== 'admin' && ticket.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
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
    const { status, assignedTo, resolution } = req.body;
    
    const ticket = await MaintenanceTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Update fields
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (resolution) ticket.resolution = resolution;
    
    if (status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user.id;
    }
    
    await ticket.save();
    
    // Notify student
    await Notification.create({
      recipient: ticket.student,
      type: 'in_app',
      channel: 'ticket',
      subject: 'Ticket Status Updated',
      content: `Your ticket "${ticket.title}" has been updated to ${status}`,
      data: { ticketId: ticket._id },
      status: 'sent',
      sentAt: new Date()
    });
    
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_TICKET',
      details: `Updated ticket ${ticket.title} status to ${status}`,
      resource: 'ticket',
      resourceId: ticket._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
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
    
    const ticket = await MaintenanceTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    ticket.comments.push({
      user: req.user.id,
      comment: comment,
      createdAt: new Date()
    });
    
    await ticket.save();
    
    // Notify the other party (if student comments, notify admin; if admin comments, notify student)
    const notifyUser = req.user.role === 'admin' ? ticket.student : (await User.find({ role: 'admin' })).map(a => a._id);
    const recipients = req.user.role === 'admin' ? [ticket.student] : (await User.find({ role: 'admin' })).map(a => a._id);
    
    for (const recipient of recipients) {
      await Notification.create({
        recipient: recipient,
        type: 'in_app',
        channel: 'ticket',
        subject: 'New Comment on Ticket',
        content: `${req.user.name} commented on ticket "${ticket.title}": ${comment.substring(0, 100)}`,
        data: { ticketId: ticket._id },
        status: 'sent',
        sentAt: new Date()
      });
    }
    
    res.json({
      success: true,
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

// @desc    Get all tickets (Admin only) - NO LIMIT BY DEFAULT
// @route   GET /api/tickets/admin/all
// @access  Private/Admin
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, limit } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Build query
    let query = MaintenanceTicket.find(filter)
      .populate('student', 'name email matricNumber')
      .populate('room', 'roomNumber blockName')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    // Only apply limit if specified, otherwise return all
    if (limit && parseInt(limit) > 0) {
      query = query.limit(parseInt(limit));
    }
    
    const tickets = await query;
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
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
