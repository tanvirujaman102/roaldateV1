const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !this.media;
    },
    maxlength: 2000
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file']
    },
    url: String,
    thumbnail: String,
    size: Number,
    filename: String
  },
  messageType: {
    type: String,
    default: 'text',
    enum: ['text', 'image', 'video', 'audio', 'file', 'system']
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
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

messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

messageSchema.index({ chatRoom: 1, timestamp: -1 });
messageSchema.index({ author: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
