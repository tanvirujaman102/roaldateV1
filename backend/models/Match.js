const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action1: {
    type: String,
    enum: ['like', 'pass', 'super_like'],
    required: true
  },
  action2: {
    type: String,
    enum: ['like', 'pass', 'super_like']
  },
  isMatch: {
    type: Boolean,
    default: false
  },
  matchedAt: {
    type: Date
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1, timestamp: -1 });
matchSchema.index({ user2: 1, timestamp: -1 });
matchSchema.index({ isMatch: 1, matchedAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
