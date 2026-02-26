const Room = require('../models/Room');
const User = require('../models/User');
const WaitingList = require('../models/WaitingList');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { status, gender, minPrice, maxPrice, block } = req.query;
    
    // Build filter
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
    const room = await Room.create(req.body);

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_ROOM',
      details: `Created room ${room.roomNumber} in block ${room.blockName}`,
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

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_ROOM',
      details: `Updated room ${room.roomNumber}`,
      resource: 'room',
      resourceId: room._id,
      changes: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Room updated successfully',
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
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room has occupants
    if (room.occupants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with occupants. Please reassign students first.'
      });
    }

    await room.deleteOne();

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_ROOM',
      details: `Deleted room ${room.roomNumber}`,
      resource: 'room',
      resourceId: req.params.id,
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

// @desc    Student applies for room
// @route   POST /api/rooms/apply
// @access  Private/Student
exports.applyForRoom = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    // Check if already allocated
    if (student.room) {
      return res.status(400).json({
        success: false,
        message: 'You already have a room allocated'
      });
    }

    // Check if already in waiting list
    const inWaitingList = await WaitingList.findOne({ 
      student: student._id,
      status: 'waiting'
    });

    if (inWaitingList) {
      return res.status(400).json({
        success: false,
        message: `You are already in waiting list at position ${inWaitingList.position}`
      });
    }

    // Find available rooms matching gender
    const availableRooms = await Room.find({
      genderRestriction: { $in: [student.gender, 'any'] },
      status: { $in: ['available', 'occupied'] },
      availableSlots: { $gt: 0 }
    }).sort({ price: 1 });

    if (availableRooms.length > 0) {
      // Allocate the first available room
      const room = availableRooms[0];
      
      room.occupants.push(student._id);
      await room.save();
      
      student.room = room._id;
      await student.save();

      // Log allocation
      await AuditLog.create({
        user: student._id,
        action: 'ROOM_ALLOCATION',
        details: `Student allocated room ${room.roomNumber}`,
        resource: 'room',
        resourceId: room._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success'
      });

      // Send notification
      await Notification.create({
        recipient: student._id,
        type: 'in_app',
        channel: 'room',
        subject: 'Room Allocated',
        content: `Your room has been allocated! Room: ${room.roomNumber}, Block: ${room.blockName}`,
        data: { roomId: room._id, roomNumber: room.roomNumber },
        status: 'sent',
        sentAt: new Date()
      });

      res.json({
        success: true,
        message: 'Room allocated successfully',
        data: room
      });
    } else {
      // Add to waiting list
      const waitingEntry = await WaitingList.create({
        student: student._id,
        preferredGender: student.gender,
        requestedDate: new Date()
      });

      // Log waiting list addition
      await AuditLog.create({
        user: student._id,
        action: 'WAITING_LIST_ADD',
        details: `Student added to waiting list at position ${waitingEntry.position}`,
        resource: 'waitingList',
        resourceId: waitingEntry._id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success'
      });

      res.json({
        success: true,
        message: 'No rooms available. Added to waiting list',
        data: {
          position: waitingEntry.position,
          estimatedWait: 'When a room becomes available'
        }
      });
    }
  } catch (error) {
    console.error('Room application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply for room',
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
      status: { $in: ['available', 'occupied'] },
      availableSlots: { $gt: 0 }
    })
      .select('roomNumber blockName floorNumber price capacity availableSlots genderRestriction amenities')
      .sort({ price: 1 });

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

// @desc    Get student's room
// @route   GET /api/rooms/my-room
// @access  Private
exports.getMyRoom = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('room');

    if (!student.room) {
      return res.json({
        success: true,
        data: null,
        message: 'You have not been allocated a room yet'
      });
    }

    // Get roommates
    const room = await Room.findById(student.room._id)
      .populate('occupants', 'name matricNumber email phoneNumber');

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

// @desc    Admin allocate room manually
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
        message: 'Student already has a room allocated'
      });
    }

    if (room.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Check gender compatibility
    if (room.genderRestriction !== 'any' && room.genderRestriction !== student.gender) {
      return res.status(400).json({
        success: false,
        message: `Room is restricted to ${room.genderRestriction} students only`
      });
    }

    // Remove from waiting list if present
    await WaitingList.findOneAndDelete({ student: studentId });

    // Allocate room
    room.occupants.push(studentId);
    await room.save();

    student.room = roomId;
    await student.save();

    // Log action
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

    // Send notification
    await Notification.create({
      recipient: student._id,
      type: 'in_app',
      channel: 'room',
      subject: 'Room Allocated by Admin',
      content: `Admin has allocated room ${room.roomNumber} to you in block ${room.blockName}`,
      data: { roomId: room._id, roomNumber: room.roomNumber },
      status: 'sent',
      sentAt: new Date()
    });

    res.json({
      success: true,
      message: 'Room allocated successfully',
      data: { student, room }
    });
  } catch (error) {
    console.error('Admin allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to allocate room',
      error: error.message
    });
  }
};
