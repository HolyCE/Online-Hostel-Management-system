const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide hall name'],
    unique: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Please specify hall gender']
  },
  code: {
    type: String,
    required: [true, 'Please provide hall code'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  amenities: [{
    type: String,
    enum: ['cafeteria', 'gym', 'laundry', 'study_room', 'common_room', 'sports_facility', 'parking', 'security', 'wifi']
  }],
  images: [{
    type: String,
    default: []
  }],
  totalCapacity: {
    type: Number,
    required: true,
    min: 0
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  wardenName: {
    type: String,
    default: ''
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

// Index for faster queries
hallSchema.index({ gender: 1, isActive: 1 });
hallSchema.index({ name: 1 });

module.exports = mongoose.model('Hall', hallSchema);
