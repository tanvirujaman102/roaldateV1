const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  type: {
    type: String,
    default: 'private',
    enum: ['private', 'group', 'broadcast']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVoiceCalls: {
      type: Boolean,
      default: true
    },
    allowVideoCalls: {
      type: Boolean,
      default: true
    }
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
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

chatRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ lastActivity: -1 });
chatRoomSchema.index({ type: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
