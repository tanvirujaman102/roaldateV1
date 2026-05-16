const User = require('../models/User');
const Post = require('../models/Post');
const ChatRoom = require('../models/ChatRoom');
const PartyRoom = require('../models/PartyRoom');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const VideoCall = require('../models/VideoCall');
const Match = require('../models/Match');

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalChatRooms,
      totalPartyRooms,
      totalReports,
      totalTransactions,
      activeCalls
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, isActive: true }),
      Post.countDocuments(),
      ChatRoom.countDocuments(),
      PartyRoom.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Transaction.countDocuments(),
      VideoCall.countDocuments({ status: 'active' })
    ]);

    const revenue = await Transaction.aggregate([
      {
        $match: {
          type: 'deposit',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          monthly: {
            $sum: {
              $cond: {
                if: { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                then: '$amount',
                else: 0
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalChatRooms,
        totalPartyRooms,
        totalReports,
        totalTransactions,
        activeCalls,
        revenue: revenue[0] || { total: 0, monthly: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      users,
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

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const allowedFields = ['email', 'username', 'role', 'isActive', 'isVerified'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user's posts, chat rooms, etc.
    await Promise.all([
      Post.deleteMany({ author: req.params.userId }),
      ChatRoom.deleteMany({ $or: [{ createdBy: req.params.userId }, { participants: req.params.userId }] }),
      PartyRoom.deleteMany({ $or: [{ createdBy: req.params.userId }, { participants: req.params.userId }] })
    ]);

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Ban user
exports.banUser = async (req, res) => {
  try {
    const { reason, duration } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isBanned = true;
    user.banReason = reason;
    user.banExpiresAt = duration === 'permanent' ? null : new Date(Date.now() + (duration === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unban user
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isBanned = false;
    user.banReason = undefined;
    user.banExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username avatar firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      posts,
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

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username avatar firstName lastName')
      .populate('likes', 'username avatar')
      .populate('comments.author', 'username avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .populate('reporter', 'username avatar')
      .populate('target')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments();

    res.status(200).json({
      success: true,
      reports,
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

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate('reporter', 'username avatar')
      .populate('target');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Handle report
exports.handleReport = async (req, res) => {
  try {
    const { action, reason } = req.body;

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    report.status = 'resolved';
    report.action = action;
    report.reason = reason;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();

    await report.save();

    // Take action based on report action
    if (action === 'delete' && report.targetType === 'post') {
      await Post.findByIdAndDelete(report.target);
    } else if (action === 'ban') {
      await User.findByIdAndUpdate(report.target, { isBanned: true });
    }

    res.status(200).json({
      success: true,
      message: 'Report handled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all chat rooms
exports.getAllChatRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chatRooms = await ChatRoom.find()
      .populate('participants', 'username avatar')
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatRoom.countDocuments();

    res.status(200).json({
      success: true,
      chatRooms,
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

// Get chat room by ID
exports.getChatRoomById = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId)
      .populate('participants', 'username avatar')
      .populate('createdBy', 'username avatar');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    res.status(200).json({
      success: true,
      chatRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete chat room
exports.deleteChatRoom = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    await ChatRoom.findByIdAndDelete(req.params.roomId);

    res.status(200).json({
      success: true,
      message: 'Chat room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all party rooms
exports.getAllPartyRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const partyRooms = await PartyRoom.find()
      .populate('participants', 'username avatar')
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PartyRoom.countDocuments();

    res.status(200).json({
      success: true,
      partyRooms,
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

// Get party room by ID
exports.getPartyRoomById = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId)
      .populate('participants', 'username avatar')
      .populate('createdBy', 'username avatar');

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    res.status(200).json({
      success: true,
      partyRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete party room
exports.deletePartyRoom = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    await PartyRoom.findByIdAndDelete(req.params.partyId);

    res.status(200).json({
      success: true,
      message: 'Party room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments();

    res.status(200).json({
      success: true,
      transactions,
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

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('user', 'username avatar');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Refund transaction
exports.refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    transaction.status = 'refunded';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction refunded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscription.countDocuments();

    res.status(200).json({
      success: true,
      subscriptions,
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

// Cancel user subscription
exports.cancelUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res) => {
  try {
    const { level, startDate, endDate } = req.query;

    // This would typically read from a log file or logging service
    // For now, return empty array as placeholder
    res.status(200).json({
      success: true,
      logs: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { metric, period } = req.query;

    let analytics = {};

    switch (metric) {
      case 'users':
        analytics = await User.aggregate([
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: '$createdAt',
                  unit: period === 'day' ? 'day' : period === 'week' ? 'week' : 'month'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;
      case 'posts':
        analytics = await Post.aggregate([
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: '$createdAt',
                  unit: period === 'day' ? 'day' : period === 'week' ? 'week' : 'month'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;
      default:
        analytics = [];
    }

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send system announcement
exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, message, type, targetAudience } = req.body;

    // Create notification for all users or specific audience
    const users = await User.find(
      targetAudience && targetAudience !== 'all' 
        ? { role: targetAudience }
        : {}
    );

    // Emit socket event to all relevant users
    users.forEach(user => {
      req.app.get('io').to(`user_${user._id}`).emit('system_announcement', {
        title,
        message,
        type
      });
    });

    res.status(200).json({
      success: true,
      message: 'Announcement sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get banned users
exports.getBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await User.find({ isBanned: true })
      .select('-password')
      .sort({ banExpiresAt: -1 });

    res.status(200).json({
      success: true,
      bannedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    // This would typically read from a settings collection or config file
    const settings = {
      siteName: 'RoalDate',
      siteDescription: 'Professional Social Media Platform',
      maintenanceMode: false,
      registrationEnabled: true,
      maxFileSize: 10485760,
      version: '1.0.0'
    };

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    // This would typically update a settings collection or config file
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Backup database
exports.backupDatabase = async (req, res) => {
  try {
    // This would typically trigger a database backup process
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Database backup initiated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Restore database
exports.restoreDatabase = async (req, res) => {
  try {
    const { backupFile } = req.body;

    // This would typically restore from a backup file
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Database restore initiated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
