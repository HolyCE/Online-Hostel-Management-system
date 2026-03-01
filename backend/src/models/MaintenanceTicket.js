const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ticket must belong to a student']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Ticket must be for a room']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    enum: [
      'electrical',
      'plumbing',
      'furniture',
      'cleaning',
      'security',
      'internet',
      'structural',
      'pest_control',
      'other'
    ],
    required: [true, 'Please select a category']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  attachments: [{
    type: String,
    default: []
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff user
  },
  assignedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String,
    maxlength: [500, 'Resolution cannot be more than 500 characters']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time taken to resolve
maintenanceTicketSchema.virtual('timeToResolve').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return (this.resolvedAt - this.createdAt) / (1000 * 60 * 60); // Hours
  }
  return null;
});

// Update timestamps
maintenanceTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set dates based on status changes
  if (this.isModified('status')) {
    if (this.status === 'assigned' && !this.assignedAt) {
      this.assignedAt = Date.now();
    }
    if (this.status === 'in_progress' && !this.startedAt) {
      this.startedAt = Date.now();
    }
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = Date.now();
    }
  }
  
  next();
});

// Set priority for emergency keywords
maintenanceTicketSchema.pre('save', function(next) {
  const emergencyKeywords = ['fire', 'flood', 'leak', 'spark', 'smoke', 'emergency'];
  const description = this.description.toLowerCase();
  
  if (emergencyKeywords.some(keyword => description.includes(keyword))) {
    this.priority = 'emergency';
  }
  
  next();
});

// Index for faster queries
maintenanceTicketSchema.index({ student: 1, status: 1, createdAt: -1 });
maintenanceTicketSchema.index({ assignedTo: 1, status: 1 });
maintenanceTicketSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
