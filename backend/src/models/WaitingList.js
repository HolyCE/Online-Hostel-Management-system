const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
    unique: true // One student can only be in waiting list once
  },
  preferredRoomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'any'],
    default: 'any'
  },
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  maxPrice: {
    type: Number,
    min: 0
  },
  requestedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'allocated', 'cancelled', 'expired'],
    default: 'waiting'
  },
  allocatedAt: {
    type: Date
  },
  allocatedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expire after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
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
waitingListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure unique position in queue
waitingListSchema.pre('save', async function(next) {
  if (this.isNew) {
    const WaitingList = mongoose.model('WaitingList');
    const highestPosition = await WaitingList.findOne()
      .sort({ position: -1 })
      .select('position');
    
    this.position = highestPosition ? highestPosition.position + 1 : 1;
  }
  next();
});

// When someone leaves waiting list, reorder positions
waitingListSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const WaitingList = mongoose.model('WaitingList');
    await WaitingList.updateMany(
      { position: { $gt: doc.position }, status: 'waiting' },
      { $inc: { position: -1 } }
    );
  }
});

// Index for faster queries
waitingListSchema.index({ position: 1 }, { unique: true });
waitingListSchema.index({ status: 1, position: 1 });
waitingListSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model('WaitingList', waitingListSchema);
