const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification Type and Content
  type: {
    type: String,
    enum: [
      'like', 'love', 'care', 'haha', 'wow', 'sad', 'angry',
      'comment', 'reply', 'mention', 'share', 'save', 'follow',
      'friend_request', 'friend_accepted', 'message', 'message_request',
      'match', 'super_like', 'profile_view', 'story_view', 'reel_view',
      'video_call', 'voice_call', 'missed_call', 'call_ended',
      'party_invite', 'party_started', 'party_joined', 'party_left',
      'wallet_deposit', 'wallet_withdrawal', 'gift_received', 'subscription',
      'system', 'moderation', 'warning', 'suspension', 'verification',
      'birthday', 'anniversary', 'milestone', 'achievement', 'level_up',
      'trending', 'news', 'update', 'promotion', 'reminder', 'alert'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Related Objects
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  relatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  relatedParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party'
  },
  relatedCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCall'
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Media
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'gif', 'icon']
    },
    url: String,
    thumbnail: String,
    alt: String
  },
  
  // Actions
  actions: [{
    type: {
      type: String,
      enum: ['view', 'accept', 'decline', 'reply', 'follow', 'unfollow', 'block', 'report', 'delete', 'mark_read']
    },
    label: String,
    url: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    },
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isSeen: {
    type: Boolean,
    default: false
  },
  seenAt: Date,
  isClicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Delivery Status
  deliveryStatus: {
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      delivered: {
        type: Boolean,
        default: false
      },
      failed: {
        type: Boolean,
        default: false
      },
      error: String,
      sentAt: Date,
      deliveredAt: Date,
      failedAt: Date
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      delivered: {
        type: Boolean,
        default: false
      },
      failed: {
        type: Boolean,
        default: false
      },
      error: String,
      sentAt: Date,
      deliveredAt: Date,
      failedAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      delivered: {
        type: Boolean,
        default: false
      },
      failed: {
        type: Boolean,
        default: false
      },
      error: String,
      sentAt: Date,
      deliveredAt: Date,
      failedAt: Date
    },
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      delivered: {
        type: Boolean,
        default: true
      },
      failed: {
        type: Boolean,
        default: false
      },
      error: String,
      sentAt: {
        type: Date,
        default: Date.now
      },
      deliveredAt: {
        type: Date,
        default: Date.now
      },
      failedAt: Date
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Grouping
  group: String, // For grouping similar notifications
  count: {
    type: Number,
    default: 1
  },
  
  // Device Targeting
  targetDevices: [{
    type: String,
    enum: ['web', 'ios', 'android', 'all'],
    default: 'all'
  }],
  
  // User Preferences
  respectUserPreferences: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual Fields
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

notificationSchema.virtual('deliverySuccess').get(function() {
  const methods = ['push', 'email', 'sms', 'inApp'];
  const successfulMethods = methods.filter(method => 
    this.deliveryStatus[method].delivered
  );
  return successfulMethods.length;
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, isSeen: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSeen = function() {
  this.isSeen = true;
  this.seenAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsClicked = function() {
  this.isClicked = true;
  this.clickedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = function(method) {
  if (this.deliveryStatus[method]) {
    this.deliveryStatus[method].delivered = true;
    this.deliveryStatus[method].deliveredAt = new Date();
  }
  return this.save();
};

notificationSchema.methods.markAsFailed = function(method, error) {
  if (this.deliveryStatus[method]) {
    this.deliveryStatus[method].failed = true;
    this.deliveryStatus[method].error = error;
    this.deliveryStatus[method].failedAt = new Date();
  }
  return this.save();
};

notificationSchema.methods.addAction = function(actionType, label, url, method = 'GET', data = {}) {
  this.actions.push({
    type: actionType,
    label,
    url,
    method,
    data
  });
  return this.save();
};

notificationSchema.methods.incrementCount = function() {
  this.count += 1;
  return this.save();
};

// Static Methods
notificationSchema.statics.findUnreadNotifications = function(userId, limit = 20) {
  return this.find({
    recipient: userId,
    isRead: false,
    isExpired: { $ne: true }
  })
  .populate('sender', 'username fullName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

notificationSchema.statics.findUserNotifications = function(userId, options = {}) {
  const { limit = 20, skip = 0, type = null, isRead = null, priority = null } = options;
  
  const query = {
    recipient: userId,
    isExpired: { $ne: true }
  };
  
  if (type) {
    query.type = type;
  }
  
  if (isRead !== null) {
    query.isRead = isRead;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  return this.find(query)
    .populate('sender', 'username fullName profilePicture')
    .populate('relatedPost', 'content.text')
    .populate('relatedUser', 'username fullName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.countUnreadNotifications = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isExpired: { $ne: true }
  });
};

notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Send push notification if enabled
  if (notification.respectUserPreferences) {
    const User = mongoose.model('User');
    const user = await User.findById(notification.recipient);
    
    if (user && user.preferences.notifications.push) {
      // Queue push notification
      await this.sendPushNotification(notification, user);
    }
  }
  
  return notification;
};

notificationSchema.statics.sendPushNotification = async function(notification, user) {
  try {
    // This would integrate with Firebase Cloud Messaging or similar service
    const pushPayload = {
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: notification._id.toString(),
        type: notification.type,
        relatedPost: notification.relatedPost?.toString(),
        relatedUser: notification.relatedUser?.toString()
      },
      sound: 'default',
      badge: await this.countUnreadNotifications(user._id)
    };
    
    // Send to user's devices
    const activeDevices = user.devices.filter(device => device.isActive);
    
    for (const device of activeDevices) {
      if (device.pushToken) {
        // Send push notification to device
        await this.sendToDevice(device.pushToken, pushPayload);
        
        notification.deliveryStatus.push.sent = true;
        notification.deliveryStatus.push.sentAt = new Date();
        notification.deliveryStatus.push.delivered = true;
        notification.deliveryStatus.push.deliveredAt = new Date();
      }
    }
    
    await notification.save();
  } catch (error) {
    console.error('Push notification failed:', error);
    notification.deliveryStatus.push.failed = true;
    notification.deliveryStatus.push.error = error.message;
    notification.deliveryStatus.push.failedAt = new Date();
    await notification.save();
  }
};

notificationSchema.statics.sendToDevice = async function(pushToken, payload) {
  // This would use Firebase Admin SDK or similar service
  // For now, this is a placeholder
  console.log('Sending push notification to device:', pushToken, payload);
};

notificationSchema.statics.createBulkNotifications = async function(recipients, notificationData) {
  const notifications = recipients.map(recipientId => ({
    ...notificationData,
    recipient: recipientId
  }));
  
  const createdNotifications = await this.insertMany(notifications);
  
  // Send push notifications in bulk
  for (const notification of createdNotifications) {
    if (notification.respectUserPreferences) {
      const User = mongoose.model('User');
      const user = await User.findById(notification.recipient);
      
      if (user && user.preferences.notifications.push) {
        await this.sendPushNotification(notification, user);
      }
    }
  }
  
  return createdNotifications;
};

notificationSchema.statics.cleanupExpiredNotifications = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

notificationSchema.statics.getNotificationStats = function(userId, timeRange = '7d') {
  const timeRanges = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const days = timeRanges[timeRange] || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        recipient: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        clicked: {
          $sum: { $cond: [{ $eq: ['$isClicked', true] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Notification', notificationSchema);
