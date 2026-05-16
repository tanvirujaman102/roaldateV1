const Notification = require('../models/Notification');
const User = require('../models/User');
const webpush = require('web-push');

// Configure web-push with error handling
try {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@roaldate.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.warn('⚠️ Web Push not configured:', err.message);
}

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user.id })
      .populate('from', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this notification'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    await Notification.findByIdAndDelete(req.params.notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationSettings');

    res.status(200).json({
      success: true,
      settings: user.notificationSettings || {
        push: true,
        email: true,
        inApp: true,
        types: {
          likes: true,
          comments: true,
          shares: true,
          follows: true,
          messages: true,
          matches: true,
          mentions: true,
          system: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.notificationSettings = {
      ...user.notificationSettings,
      ...req.body
    };

    await user.save();

    res.status(200).json({
      success: true,
      settings: user.notificationSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Subscribe to push notifications
exports.subscribeToPush = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.pushSubscriptions) {
      user.pushSubscriptions = [];
    }

    // Check if subscription already exists
    const existingIndex = user.pushSubscriptions.findIndex(
      sub => sub.endpoint === endpoint
    );

    if (existingIndex !== -1) {
      user.pushSubscriptions[existingIndex] = { endpoint, keys };
    } else {
      user.pushSubscriptions.push({ endpoint, keys });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Push subscription saved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unsubscribe from push notifications
exports.unsubscribeFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    const user = await User.findById(req.user.id);
    
    if (user.pushSubscriptions) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Push subscription removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send test notification (for development)
exports.sendTestNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // Create in-app notification
    const notification = new Notification({
      user: req.user.id,
      type: type || 'info',
      title,
      message,
      isRead: false
    });

    await notification.save();

    // Send push notification if enabled
    const user = await User.findById(req.user.id);
    
    if (user.notificationSettings?.push && user.pushSubscriptions?.length > 0) {
      const payload = JSON.stringify({
        title,
        message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        data: {
          url: '/notifications'
        }
      });

      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (error) {
          console.error('Push notification failed:', error);
        }
      }
    }

    // Emit socket event
    req.app.get('io').to(`user_${req.user.id}`).emit('new_notification', notification);

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $match: { user: req.user.id }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats[0]) {
      stats[0].byType.forEach(item => {
        typeStats[item.type] = (typeStats[item.type] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        total: stats[0]?.total || 0,
        unread: stats[0]?.unread || 0,
        byType: typeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to create notifications (used by other controllers)
exports.createNotification = async (userId, type, title, message, from = null, relatedObject = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      from,
      relatedObject,
      isRead: false
    });

    await notification.save();

    // Get user settings
    const user = await User.findById(userId);
    
    // Send push notification if enabled
    if (user.notificationSettings?.push && user.notificationSettings?.types?.[type] && user.pushSubscriptions?.length > 0) {
      const payload = JSON.stringify({
        title,
        message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: `${type}-notification`,
        data: {
          url: relatedObject ? `/notifications/${notification._id}` : '/notifications'
        }
      });

      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (error) {
          console.error('Push notification failed:', error);
        }
      }
    }

    // Emit socket event
    if (user.notificationSettings?.inApp) {
      req.app.get('io').to(`user_${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
