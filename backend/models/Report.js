const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['post', 'user', 'dating_profile', 'message', 'video_chat', 'party_room', 'comment']
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'harassment', 'fake', 'violence', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'resolved', 'dismissed']
  },
  action: {
    type: String,
    enum: ['ignore', 'warn', 'suspend', 'delete', 'ban']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
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

reportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
