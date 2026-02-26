const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a student']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Payment must be for a room']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'paystack'],
    default: 'card'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  reference: {
    type: String,
    required: [true, 'Payment reference is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionYear: {
    type: String,
    required: [true, 'Please provide session year'],
    default: function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      // If month is >= 8 (September), use next year as end
      const endYear = month >= 8 ? year + 1 : year;
      return `${year}/${endYear}`;
    }
  },
  semester: {
    type: String,
    enum: ['first', 'second', 'both'],
    default: 'both'
  },
  paidFor: {
    type: String,
    enum: ['accommodation', 'caution_fee', 'other'],
    default: 'accommodation'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamps
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set payment date when status becomes success
paymentSchema.pre('save', function(next) {
  if (this.status === 'success' && !this.paymentDate) {
    this.paymentDate = Date.now();
  }
  next();
});

// Ensure student hasn't already paid for current session
paymentSchema.pre('save', async function(next) {
  if (this.status === 'success') {
    const Payment = mongoose.model('Payment');
    const existingPayment = await Payment.findOne({
      student: this.student,
      sessionYear: this.sessionYear,
      semester: this.semester,
      paidFor: this.paidFor,
      status: 'success',
      _id: { $ne: this._id }
    });
    
    if (existingPayment) {
      next(new Error('Student has already paid for this session/semester'));
    }
  }
  next();
});

// Index for faster queries
paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ reference: 1 }, { unique: true });
paymentSchema.index({ status: 1, sessionYear: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
