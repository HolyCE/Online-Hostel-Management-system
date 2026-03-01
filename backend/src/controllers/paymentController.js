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

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('room');
    
    if (!student.room) {
      return res.status(400).json({
        success: false,
        message: 'You need to have a room allocated first'
      });
    }

    // Check if already paid for current session
    const currentYear = new Date().getFullYear();
    const sessionYear = `${currentYear}/${currentYear + 1}`;
    
    const existingPayment = await Payment.findOne({
      student: student._id,
      sessionYear,
      status: 'success'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You have already paid for this session'
      });
    }

    // Initialize payment with Paystack
    const response = await paystack.post('/transaction/initialize', {
      email: student.email,
      amount: student.room.price * 100, // Paystack uses kobo
      metadata: {
        studentId: student._id.toString(),
        studentName: student.name,
        matricNumber: student.matricNumber,
        roomNumber: student.room.roomNumber,
        roomPrice: student.room.price
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      channels: ['card', 'bank', 'ussd', 'qr']
    });

    // Create payment record
    const payment = await Payment.create({
      student: student._id,
      room: student.room._id,
      amount: student.room.price,
      reference: response.data.data.reference,
      status: 'pending',
      sessionYear,
      metadata: response.data.data.metadata
    });

    // Log action
    await AuditLog.create({
      user: student._id,
      action: 'CREATE_PAYMENT',
      details: `Payment initialized: ₦${student.room.price}`,
      resource: 'payment',
      resourceId: payment._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        amount: student.room.price
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

    // Verify with Paystack
    const response = await paystack.get(`/transaction/verify/${reference}`);

    if (response.data.data.status === 'success') {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { reference },
        {
          status: 'success',
          transactionId: response.data.data.id,
          paymentDate: new Date(),
          metadata: {
            ...response.data.data,
            verifiedAt: new Date()
          }
        },
        { new: true }
      ).populate('student');

      if (payment) {
        // Send notification
        await Notification.create({
          recipient: payment.student._id,
          type: 'in_app',
          channel: 'payment',
          subject: 'Payment Successful',
          content: `Your payment of ₦${payment.amount} has been confirmed. Reference: ${payment.reference}`,
          data: { paymentId: payment._id, reference: payment.reference },
          status: 'sent',
          sentAt: new Date()
        });

        // Log action
        await AuditLog.create({
          user: payment.student._id,
          action: 'VERIFY_PAYMENT',
          details: `Payment verified: ₦${payment.amount}`,
          resource: 'payment',
          resourceId: payment._id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success'
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
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

// @desc    Get user payments
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
    const { status, sessionYear, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (sessionYear) filter.sessionYear = sessionYear;

    const payments = await Payment.find(filter)
      .populate('student', 'name email matricNumber')
      .populate('room', 'roomNumber blockName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
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

// @desc    Paystack webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  try {
    // Validate webhook signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data);
        break;
      case 'charge.failed':
        await handleFailedCharge(event.data);
        break;
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

// Helper functions for webhook handling
async function handleSuccessfulCharge(data) {
  const payment = await Payment.findOneAndUpdate(
    { reference: data.reference },
    {
      status: 'success',
      transactionId: data.id,
      paymentDate: new Date(),
      metadata: data
    },
    { new: true }
  ).populate('student');

  if (payment) {
    await Notification.create({
      recipient: payment.student._id,
      type: 'in_app',
      channel: 'payment',
      subject: 'Payment Confirmed (Webhook)',
      content: `Your payment of ₦${payment.amount} has been confirmed.`,
      status: 'sent',
      sentAt: new Date()
    });
  }
}

async function handleFailedCharge(data) {
  await Payment.findOneAndUpdate(
    { reference: data.reference },
    {
      status: 'failed',
      metadata: data
    }
  );
}

async function handleTransferSuccess(data) {
  console.log('Transfer successful:', data.reference);
}
