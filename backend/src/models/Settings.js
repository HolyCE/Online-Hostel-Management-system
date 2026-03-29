const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    systemName: {
      type: String,
      default: 'HostelHub'
    },
    systemEmail: {
      type: String,
      default: 'admin@hostelhub.com'
    },
    supportPhone: {
      type: String,
      default: '+2348012345678'
    },
    timezone: {
      type: String,
      default: 'Africa/Lagos'
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    currencySymbol: {
      type: String,
      default: '₦'
    }
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    paymentAlerts: {
      type: Boolean,
      default: true
    },
    ticketAlerts: {
      type: Boolean,
      default: true
    },
    roomAlerts: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 30
    }
  },
  
  // Security Settings
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 120
    },
    passwordExpiryDays: {
      type: Number,
      default: 90,
      min: 30,
      max: 365
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    }
  },
  
  // Academic Settings
  academic: {
    currentSession: {
      type: String,
      default: () => {
        const year = new Date().getFullYear();
        return `${year}/${year + 1}`;
      }
    },
    currentSemester: {
      type: String,
      enum: ['first', 'second'],
      default: 'first'
    },
    semesterStartDate: {
      type: Date,
      default: new Date()
    },
    semesterEndDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 4);
        return date;
      }
    },
    registrationDeadline: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      }
    },
    paymentDeadline: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2);
        return date;
      }
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
