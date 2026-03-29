const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make user optional for system logs
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'REGISTER',
      'CREATE_ROOM',
      'UPDATE_ROOM',
      'DELETE_ROOM',
      'ROOM_ALLOCATION',
      'ROOM_DEALLOCATION',
      'ADMIN_ALLOCATION',
      'WAITING_LIST_ADD',
      'WAITING_LIST_REMOVE',
      'CREATE_PAYMENT',
      'VERIFY_PAYMENT',
      'REFUND_PAYMENT',
      'PAYMENT_FAILED',
      'CREATE_TICKET',
      'UPDATE_TICKET',
      'ASSIGN_TICKET',
      'RESOLVE_TICKET',
      'CLOSE_TICKET',
      'TICKET_COMMENT',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'USER_ROLE_CHANGE',
      'USER_STATUS_CHANGE',
      'GENERATE_REPORT',
      'EXPORT_DATA',
      'IMPORT_DATA',
      'SYSTEM_CONFIG_CHANGE',
      'BACKUP_CREATED',
      'BACKUP_RESTORED'
    ]
  },
  details: {
    type: String,
    required: [true, 'Details are required']
  },
  resource: {
    type: String,
    enum: ['user', 'room', 'payment', 'ticket', 'waitingList', 'system']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create compound indexes for faster queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ ip: 1 });

// TTL index - automatically delete logs after 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
