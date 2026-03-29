const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide room number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  blockName: {
    type: String,
    required: [true, 'Please provide block name'],
    uppercase: true,
    trim: true
  },
  floorNumber: {
    type: Number,
    required: [true, 'Please provide floor number'],
    min: [0, 'Floor number cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [6, 'Capacity cannot exceed 6']
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  genderRestriction: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  price: {
    type: Number,
    required: [true, 'Please provide room price'],
    min: [0, 'Price cannot be negative']
  },
  amenities: [{
    type: String,
    enum: ['bed', 'mattress', 'wardrobe', 'desk', 'chair', 'fan', 'ac', 'wifi', 'attached_bathroom'],
    default: []
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'full'],
    default: 'available'
  },
  availableSlots: {
    type: Number,
    default: function() {
      return this.capacity;
    }
  },
  images: [{
    type: String,
    default: []
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
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

// Virtual for current occupants count - FIXED
roomSchema.virtual('currentOccupancy').get(function() {
  return this.occupants ? this.occupants.length : 0;
});

// Virtual for occupancy percentage - FIXED
roomSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity && this.occupants) {
    return (this.occupants.length / this.capacity) * 100;
  }
  return 0;
});

// Update status and availableSlots before saving
roomSchema.pre('save', function(next) {
  const occupantCount = this.occupants ? this.occupants.length : 0;
  this.availableSlots = this.capacity - occupantCount;
  
  if (this.availableSlots === 0) {
    this.status = 'full';
  } else if (occupantCount > 0) {
    this.status = 'occupied';
  } else {
    this.status = 'available';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Ensure gender restriction matches occupants
roomSchema.pre('save', async function(next) {
  if (this.occupants && this.occupants.length > 0 && this.genderRestriction !== 'any') {
    const User = mongoose.model('User');
    const occupants = await User.find({ _id: { $in: this.occupants } });
    
    const hasMismatch = occupants.some(user => user.gender !== this.genderRestriction);
    if (hasMismatch) {
      next(new Error('Gender restriction mismatch with occupants'));
    }
  }
  next();
});

// Index for faster queries
roomSchema.index({ status: 1, genderRestriction: 1, price: 1 });
roomSchema.index({ blockName: 1, floorNumber: 1 });

module.exports = mongoose.model('Room', roomSchema);
