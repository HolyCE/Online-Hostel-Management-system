const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/helpers/asyncHandler');
const ErrorResponse = require('../utils/helpers/ErrorResponse');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, matricNumber, password, phoneNumber, gender } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { matricNumber }] 
  });

  if (existingUser) {
    throw new ErrorResponse('User already exists with this email or matric number', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    matricNumber,
    password,
    phoneNumber,
    gender
  });

  // Generate token
  const token = generateToken(user._id);

  // Log registration
  await AuditLog.create({
    user: user._id,
    action: 'REGISTER',
    details: `New user registered: ${user.name} (${user.matricNumber})`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success'
  });

  // Send welcome notification
  await Notification.create({
    recipient: user._id,
    type: 'in_app',
    channel: 'auth',
    subject: 'Welcome to Hostel Management System',
    content: `Welcome ${user.name}! Your account has been created successfully.`,
    status: 'sent',
    sentAt: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      matricNumber: user.matricNumber,
      role: user.role,
      gender: user.gender,
      phoneNumber: user.phoneNumber
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Log failed attempt
    await AuditLog.create({
      user: null,
      action: 'LOGIN_FAILED',
      details: `Failed login attempt for email: ${email}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'failure'
    });

    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ErrorResponse('Your account has been deactivated. Please contact admin.', 401);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Log failed attempt
    await AuditLog.create({
      user: user._id,
      action: 'LOGIN_FAILED',
      details: `Failed login attempt for user: ${user.email}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'failure'
    });

    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  // Log successful login
  await AuditLog.create({
    user: user._id,
    action: 'LOGIN',
    details: `User logged in: ${user.name}`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      matricNumber: user.matricNumber,
      role: user.role,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      room: user.room,
      lastLogin: user.lastLogin
    }
  });
});

// ... rest of the controller remains the same

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('room')
    .populate('payments')
    .populate('tickets');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  // Log logout
  await AuditLog.create({
    user: req.user.id,
    action: 'LOGOUT',
    details: `User logged out: ${req.user.name}`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log password change
  await AuditLog.create({
    user: user._id,
    action: 'PASSWORD_CHANGE',
    details: `User changed password: ${user.name}`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
