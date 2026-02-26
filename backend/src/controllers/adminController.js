const User = require('../models/User');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const WaitingList = require('../models/WaitingList');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalPayments,
      pendingPayments,
      totalTickets,
      pendingTickets,
      waitingListCount,
      recentActivities
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Room.countDocuments(),
      Room.countDocuments({ status: { $in: ['occupied', 'full'] } }),
      Room.countDocuments({ status: 'available', availableSlots: { $gt: 0 } }),
      Payment.countDocuments({ status: 'success' }),
      Payment.countDocuments({ status: 'pending' }),
      MaintenanceTicket.countDocuments(),
      MaintenanceTicket.countDocuments({ status: { $in: ['pending', 'assigned'] } }),
      WaitingList.countDocuments({ status: 'waiting' }),
      AuditLog.find()
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 
      ? ((occupiedRooms / totalRooms) * 100).toFixed(2) 
      : 0;

    // Get revenue stats
    const revenueStats = await Payment.aggregate([
      {
        $match: { status: 'success' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Get ticket stats by category
    const ticketStats = await MaintenanceTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Gender distribution
    const genderDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalRooms,
          occupiedRooms,
          availableRooms,
          occupancyRate: `${occupancyRate}%`,
          totalPayments: totalPayments,
          pendingPayments,
          totalTickets,
          pendingTickets,
          waitingList: waitingListCount
        },
        revenue: revenueStats,
        tickets: ticketStats,
        demographics: {
          gender: genderDistribution
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Generate reports
// @route   POST /api/admin/reports
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate, format = 'json' } = req.body;

    let data;
    let report;

    switch (type) {
      case 'occupancy':
        report = await generateOccupancyReport(startDate, endDate);
        break;
      case 'payments':
        report = await generatePaymentReport(startDate, endDate);
        break;
      case 'complaints':
        report = await generateComplaintReport(startDate, endDate);
        break;
      case 'students':
        report = await generateStudentReport();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // Log report generation
    await AuditLog.create({
      user: req.user.id,
      action: 'GENERATE_REPORT',
      details: `Generated ${type} report from ${startDate} to ${endDate}`,
      resource: 'system',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      data: {
        type,
        period: { startDate, endDate },
        generatedAt: new Date(),
        generatedBy: req.user.name,
        report
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Helper functions for reports
async function generateOccupancyReport(startDate, endDate) {
  const rooms = await Room.find().populate('occupants', 'name gender');

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupants.length > 0).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupants = rooms.reduce((sum, r) => sum + r.occupants.length, 0);

  // Occupancy by block
  const byBlock = await Room.aggregate([
    {
      $group: {
        _id: '$blockName',
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        occupied: {
          $sum: { $size: '$occupants' }
        }
      }
    },
    {
      $project: {
        blockName: '$_id',
        totalRooms: 1,
        totalCapacity: 1,
        occupied: 1,
        vacancy: { $subtract: ['$totalCapacity', '$occupied'] },
        occupancyRate: {
          $multiply: [
            { $divide: ['$occupied', '$totalCapacity'] },
            100
          ]
        }
      }
    }
  ]);

  return {
    summary: {
      totalRooms,
      occupiedRooms,
      vacantRooms: totalRooms - occupiedRooms,
      totalCapacity,
      totalOccupants,
      overallOccupancyRate: totalCapacity > 0 
        ? (totalOccupants / totalCapacity * 100).toFixed(2) 
        : 0
    },
    byBlock,
    timestamp: new Date()
  };
}

async function generatePaymentReport(startDate, endDate) {
  const payments = await Payment.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: 'success'
  }).populate('student', 'name matricNumber');

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Group by session
  const bySession = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: 'success'
      }
    },
    {
      $group: {
        _id: '$sessionYear',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Daily breakdown
  const daily = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: 'success'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return {
    summary: {
      period: { startDate, endDate },
      totalPayments: payments.length,
      totalAmount,
      averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
    },
    bySession,
    daily,
    payments: payments.slice(0, 50) // Last 50 payments
  };
}

async function generateComplaintReport(startDate, endDate) {
  const tickets = await MaintenanceTicket.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const resolved = tickets.filter(t => t.status === 'resolved').length;
  const pending = tickets.filter(t => ['pending', 'assigned'].includes(t.status)).length;

  // By category
  const byCategory = await MaintenanceTicket.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [
                { $ne: ['$resolvedAt', null] },
                { $ne: ['$createdAt', null] }
              ]},
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  // Average response time
  const avgResponseTime = tickets
    .filter(t => t.resolvedAt && t.createdAt)
    .reduce((sum, t) => {
      return sum + (t.resolvedAt - t.createdAt);
    }, 0) / (resolved || 1) / (1000 * 60 * 60); // Convert to hours

  return {
    summary: {
      total: tickets.length,
      resolved,
      pending,
      resolutionRate: tickets.length > 0 ? (resolved / tickets.length * 100).toFixed(2) : 0,
      averageResolutionTime: `${avgResponseTime.toFixed(2)} hours`
    },
    byCategory
  };
}

async function generateStudentReport() {
  const students = await User.find({ role: 'student' })
    .populate('room', 'roomNumber blockName')
    .select('-password');

  const withRoom = students.filter(s => s.room).length;
  const withoutRoom = students.length - withRoom;

  // Payment compliance
  const currentYear = new Date().getFullYear();
  const sessionYear = `${currentYear}/${currentYear + 1}`;
  
  const paidStudents = await Payment.distinct('student', {
    sessionYear,
    status: 'success'
  });

  return {
    summary: {
      totalStudents: students.length,
      withRoom,
      withoutRoom,
      paidCount: paidStudents.length,
      unpaidCount: students.length - paidStudents.length,
      paymentCompliance: students.length > 0 
        ? (paidStudents.length / students.length * 100).toFixed(2)
        : 0
    },
    students: students.slice(0, 100) // First 100 students
  };
}

// @desc    Get waiting list
// @route   GET /api/admin/waiting-list
// @access  Private/Admin
exports.getWaitingList = async (req, res) => {
  try {
    const waitingList = await WaitingList.find({ status: 'waiting' })
      .populate('student', 'name email matricNumber gender phoneNumber')
      .sort({ position: 1 });

    res.json({
      success: true,
      count: waitingList.length,
      data: waitingList
    });
  } catch (error) {
    console.error('Get waiting list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waiting list',
      error: error.message
    });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, userId, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};
