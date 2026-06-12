const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,  // ✅ Optional
    default: null
  },
  email: {
    type: String,
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['SIGNUP', 'LOGIN', 'LOGOUT', 'ORDER_PLACED', 'PASSWORD_CHANGE', 'PORTFOLIO_VIEW']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ email: 1, timestamp: -1 });
activityLogSchema.index({ activityType: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
