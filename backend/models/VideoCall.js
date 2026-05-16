const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'ringing',
    enum: ['ringing', 'active', 'ended', 'rejected', 'missed']
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // Duration in seconds
  },
  callType: {
    type: String,
    default: 'video',
    enum: ['video', 'audio']
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'auto'],
    default: 'auto'
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isVideoOff: {
      type: Boolean,
      default: false
    },
    screenSharing: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    networkQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    connectionType: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet', 'unknown']
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

videoCallSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

videoCallSchema.index({ caller: 1, createdAt: -1 });
videoCallSchema.index({ callee: 1, createdAt: -1 });
videoCallSchema.index({ status: 1 });
videoCallSchema.index({ startTime: -1 });

module.exports = mongoose.model('VideoCall', videoCallSchema);
