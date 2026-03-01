const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  type: {
    type: String,
    enum: [
      'email',
      'sms',
      'push',
      'in_app',
      'system'
    ],
    required: [true, 'Notification type is required']
  },
  channel: {
    type: String,
    enum: ['payment', 'room', 'ticket', 'auth', 'system', 'reminder'],
    required: [true, 'Channel is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  html: {
    type: String // For email HTML content
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: [
      'pending',
      'sent',
      'delivered',
      'read',
      'failed',
      'cancelled'
    ],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
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
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set sent/delivered/read timestamps based on status
  if (this.isModified('status')) {
    if (this.status === 'sent' && !this.sentAt) {
      this.sentAt = Date.now();
    }
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = Date.now();
    }
    if (this.status === 'read' && !this.readAt) {
      this.readAt = Date.now();
    }
    if (this.status === 'failed' && !this.failedAt) {
      this.failedAt = Date.now();
    }
  }
  
  next();
});

// Index for faster queries
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ channel: 1, status: 1, scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// TTL index - auto-delete read notifications after 30 days
notificationSchema.index({ readAt: 1 }, { 
  expireAfterSeconds: 2592000, // 30 days
  partialFilterExpression: { readAt: { $exists: true } }
});

module.exports = mongoose.model('Notification', notificationSchema);
