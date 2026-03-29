const mongoose = require('mongoose');
const Hall = require('../models/Hall');
const Room = require('../models/Room');

// @desc    Get all halls
// @route   GET /api/halls
// @access  Private
exports.getAllHalls = async (req, res) => {
  try {
    const { gender } = req.query;
    let filter = { isActive: true };
    
    if (gender && gender !== 'any') {
      filter.gender = gender;
    }
    
    const halls = await Hall.find(filter).sort({ name: 1 });
    
    // Get room statistics for each hall
    const hallsWithStats = await Promise.all(halls.map(async (hall) => {
      const rooms = await Room.find({ hall: hall._id });
      const totalRooms = rooms.length;
      const availableRooms = rooms.filter(r => r.status === 'available' && r.availableSlots > 0).length;
      const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
      const occupiedCapacity = rooms.reduce((sum, r) => sum + (r.capacity - r.availableSlots), 0);
      const occupancyRate = totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0;
      
      return {
        ...hall.toObject(),
        totalRooms,
        availableRooms,
        totalCapacity,
        occupiedCapacity,
        occupancyRate: Math.round(occupancyRate)
      };
    }));
    
    res.json({
      success: true,
      count: hallsWithStats.length,
      data: hallsWithStats
    });
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch halls',
      error: error.message
    });
  }
};

// @desc    Get rooms in a specific hall
// @route   GET /api/halls/:id/rooms
// @access  Private
exports.getHallRooms = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Convert string ID to ObjectId
    const hallObjectId = new mongoose.Types.ObjectId(id);
    
    console.log('Looking for rooms with hall ID:', hallObjectId);
    
    const rooms = await Room.find({ hall: hallObjectId })
      .populate('occupants', 'name email')
      .sort({ roomNumber: 1 });
    
    console.log(`Found ${rooms.length} rooms in hall`);
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get hall rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hall rooms',
      error: error.message
    });
  }
};

// @desc    Get single hall
// @route   GET /api/halls/:id
// @access  Private
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }
    
    res.json({
      success: true,
      data: hall
    });
  } catch (error) {
    console.error('Get hall error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hall',
      error: error.message
    });
  }
};

// @desc    Create hall (Admin only)
// @route   POST /api/halls
// @access  Private/Admin
exports.createHall = async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    
    res.status(201).json({
      success: true,
      data: hall
    });
  } catch (error) {
    console.error('Create hall error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hall',
      error: error.message
    });
  }
};

// @desc    Update hall (Admin only)
// @route   PUT /api/halls/:id
// @access  Private/Admin
exports.updateHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }
    
    res.json({
      success: true,
      data: hall
    });
  } catch (error) {
    console.error('Update hall error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hall',
      error: error.message
    });
  }
};

// @desc    Delete hall (Admin only)
// @route   DELETE /api/halls/:id
// @access  Private/Admin
exports.deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hall deleted successfully'
    });
  } catch (error) {
    console.error('Delete hall error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hall',
      error: error.message
    });
  }
};
