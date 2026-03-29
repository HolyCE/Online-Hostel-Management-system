const Room = require('../models/Room');
const User = require('../models/User');
const Hall = require('../models/Hall');
const WaitingList = require('../models/WaitingList');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { status, gender, minPrice, maxPrice, block } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (gender) filter.genderRestriction = gender;
    if (block) filter.blockName = block.toUpperCase();
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(filter)
      .populate('occupants', 'name matricNumber gender')
      .sort({ blockName: 1, floorNumber: 1, roomNumber: 1 });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('occupants', 'name matricNumber email phoneNumber');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: error.message
    });
  }
};

// @desc    Create new room (Admin only)
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      blockName,
      floorNumber,
      capacity,
      price,
      genderRestriction,
      amenities,
      description,
      status
    } = req.body;

    // Check if room already exists
    const existingRoom = await Room.findOne({ roomNumber: roomNumber.toUpperCase() });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomNumber} already exists`
      });
    }

    // Determine hall based on room number prefix
    let hall = null;
    const prefix = roomNumber.charAt(0).toUpperCase();
    
    let hallName = '';
    if (prefix === 'A') hallName = 'Welch Hall';
    else if (prefix === 'B') hallName = 'Winslow Hall';
    else if (prefix === 'C') hallName = 'Churchill Hall';
    else if (prefix === 'D') hallName = 'Nelson Hall';
    
    if (hallName) {
      hall = await Hall.findOne({ name: hallName });
    }

    // Calculate prices based on full session (24 weeks = 2 semesters)
    const sessionPrice = price;
    const semesterPrice = Math.round(sessionPrice / 2);
    const monthlyPrice = Math.round(semesterPrice / 3);
    const weeklyPrice = Math.round(monthlyPrice / 4);

    // Create the room with hall reference
    const room = await Room.create({
      roomNumber: roomNumber.toUpperCase(),
      blockName: blockName.toUpperCase(),
      floorNumber: floorNumber || 1,
      capacity: capacity || 2,
      price: sessionPrice,
      basePrice: sessionPrice,
      prices: {
        weekly: weeklyPrice,
        monthly: monthlyPrice,
        semester: semesterPrice,
        session: sessionPrice
      },
      genderRestriction: genderRestriction || 'any',
      amenities: amenities || [],
      description: description || '',
      status: status || 'available',
      hall: hall ? hall._id : null,
      occupants: []
    });

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_ROOM',
      details: `Created room ${room.roomNumber} in ${room.blockName}${hall ? ` (${hall.name})` : ''}`,
      resource: 'room',
      resourceId: room._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
};

// @desc    Update room (Admin only)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_ROOM',
      details: `Updated room ${room.roomNumber}`,
      resource: 'room',
      resourceId: room._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
};

// @desc    Delete room (Admin only)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_ROOM',
      details: `Deleted room ${room.roomNumber}`,
      resource: 'room',
      resourceId: room._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      status: 'available',
      availableSlots: { $gt: 0 }
    }).populate('occupants', 'name email');
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error.message
    });
  }
};

// @desc    Get my room (for students)
// @route   GET /api/rooms/student/my-room
// @access  Private
exports.getMyRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('room');
    
    if (!user.room) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    const room = await Room.findById(user.room).populate('occupants', 'name email');
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get my room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your room',
      error: error.message
    });
  }
};

// @desc    Apply for room allocation
// @route   POST /api/rooms/apply
// @access  Private
exports.applyForRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.room) {
      return res.status(400).json({
        success: false,
        message: 'You already have a room allocated'
      });
    }
    
    await WaitingList.create({
      student: user._id,
      requestedDate: new Date()
    });
    
    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// @desc    Admin allocate room
// @route   POST /api/rooms/admin-allocate
// @access  Private/Admin
exports.adminAllocateRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    
    const student = await User.findById(studentId);
    const room = await Room.findById(roomId);
    
    if (!student || !room) {
      return res.status(404).json({
        success: false,
        message: 'Student or room not found'
      });
    }
    
    if (student.room) {
      return res.status(400).json({
        success: false,
        message: 'Student already has a room'
      });
    }
    
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }
    
    student.room = roomId;
    await student.save();
    
    room.occupants.push(studentId);
    await room.save();
    
    await AuditLog.create({
      user: req.user.id,
      action: 'ADMIN_ALLOCATION',
      details: `Admin allocated room ${room.roomNumber} to ${student.name}`,
      resource: 'room',
      resourceId: room._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });
    
    await Notification.create({
      recipient: studentId,
      type: 'in_app',
      channel: 'room',
      subject: 'Room Allocated',
      content: `You have been allocated Room ${room.roomNumber}. Welcome!`,
      status: 'sent',
      sentAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Room allocated successfully',
      data: { student, room }
    });
  } catch (error) {
    console.error('Admin allocate room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to allocate room',
      error: error.message
    });
  }
};
