const Payment = require('../models/Payment');
const User = require('../models/User');
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const axios = require('axios');

// Initialize Paystack
const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Helper function to allocate room after payment
const allocateRoomAfterPayment = async (studentId, roomId, duration = 'session') => {
  try {
    console.log(`Allocating room ${roomId} to student ${studentId}`);
    
    const student = await User.findById(studentId);
    const room = await Room.findById(roomId);
    
    if (!student || !room) {
      console.error('Student or room not found');
      return false;
    }
    
    if (student.room) {
      console.log('Student already has a room');
      return false;
    }
    
    const currentOccupants = room.occupants ? room.occupants.length : 0;
    if (currentOccupants >= room.capacity) {
      console.log('Room is full');
      return false;
    }
    
    await User.findByIdAndUpdate(studentId, { room: roomId });
    
    if (!room.occupants) room.occupants = [];
    room.occupants.push(studentId);
    await room.save();
    
    console.log(`✅ Room ${room.roomNumber} allocated to ${student.name}`);
    
    await Notification.create({
      recipient: studentId,
      type: 'in_app',
      channel: 'room',
      subject: 'Room Allocated Successfully! 🎉',
      content: `You have been allocated Room ${room.roomNumber} in ${room.blockName} for ${duration}. Welcome to your new space!`,
      status: 'sent',
      sentAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Room allocation error:', error);
    return false;
  }
};

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
  try {
    const { amount, roomId, roomNumber, studentName, duration } = req.body;
    const student = await User.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.room) {
      return res.status(400).json({
        success: false,
        message: 'You already have a room allocated. You cannot pay for another room.'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This room is under maintenance and not available'
      });
    }

    const currentOccupants = room.occupants ? room.occupants.length : 0;
    if (currentOccupants >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This room is full'
      });
    }

    // Generate a unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create payment record
    const payment = await Payment.create({
      student: student._id,
      room: roomId,
      amount: amount,
      reference: reference,
      status: 'pending',
      sessionYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      paidFor: 'accommodation',
      metadata: {
        roomNumber: roomNumber,
        studentName: student.name,
        paymentType: 'room_allocation',
        duration: duration || 'session'
      }
    });

    // Initialize with Paystack
    // IMPORTANT: Send amount in kobo (multiply by 100) - this is the ONLY place we multiply
    const paystackResponse = await paystack.post('/transaction/initialize', {
      email: student.email,
      amount: amount * 100, // Convert to kobo for Paystack
      reference: reference,
      metadata: {
        studentId: student._id.toString(),
        studentName: student.name,
        matricNumber: student.matricNumber,
        roomId: roomId,
        roomNumber: roomNumber,
        paymentId: payment._id.toString(),
        duration: duration || 'session'
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/payments`
    });

    console.log(`✅ Payment initialized for ${student.name} - Room ${roomNumber} - Ref: ${reference}`);

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        reference: reference,
        amount: amount
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('Verifying payment with reference:', reference);

    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: payment
      });
    }

    const response = await paystack.get(`/transaction/verify/${reference}`);
    console.log('Paystack response status:', response.data.data.status);

    if (response.data.data.status === 'success') {
      payment.status = 'success';
      payment.transactionId = response.data.data.id;
      payment.paymentDate = new Date();
      payment.metadata = {
        ...payment.metadata,
        ...response.data.data,
        verifiedAt: new Date()
      };
      await payment.save();

      const duration = payment.metadata?.duration || 'session';
      await allocateRoomAfterPayment(payment.student, payment.room, duration);
      
      await AuditLog.create({
        user: payment.student,
        action: 'VERIFY_PAYMENT',
        details: `Payment verified: ₦${payment.amount}`,
        resource: 'payment',
        resourceId: payment._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success'
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      
      res.json({
        success: false,
        message: 'Payment not successful',
        data: response.data.data
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Get my payments
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('room', 'roomNumber blockName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let filter = {};
    if (status) filter.status = status;
    
    const payments = await Payment.find(filter)
      .populate('student', 'name email matricNumber')
      .populate('room', 'roomNumber blockName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// @desc    Handle webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      
      const payment = await Payment.findOneAndUpdate(
        { reference },
        {
          status: 'success',
          transactionId: event.data.id,
          paymentDate: new Date(),
          metadata: event.data
        },
        { new: true }
      );
      
      if (payment && payment.status === 'success') {
        await allocateRoomAfterPayment(payment.student, payment.room);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

module.exports = exports;
