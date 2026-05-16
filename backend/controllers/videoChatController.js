const VideoCall = require('../models/VideoCall');
const User = require('../models/User');
const Report = require('../models/Report');

// Find random chat partner
exports.findRandomPartner = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user preferences or use defaults
    const preferences = user.videoChatPreferences || {
      maxAge: 100,
      gender: 'any',
      interests: []
    };

    // Find potential partners
    const potentialPartners = await User.find({
      _id: { $ne: req.user.id },
      $and: [
        { blockedUsers: { $ne: req.user.id } },
        { blockedUsers: { $nin: [req.user.id] } },
        { isOnline: true },
        { 'videoChatPreferences.lookingForPartner': true }
      ]
    });

    // Filter based on preferences
    const filteredPartners = potentialPartners.filter(partner => {
      if (preferences.gender !== 'any' && partner.gender !== preferences.gender) {
        return false;
      }
      
      if (partner.age && partner.age > preferences.maxAge) {
        return false;
      }

      if (preferences.interests.length > 0) {
        const hasCommonInterest = partner.interests.some(interest => 
          preferences.interests.includes(interest)
        );
        if (!hasCommonInterest) {
          return false;
        }
      }

      return true;
    });

    if (filteredPartners.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No available partners found'
      });
    }

    // Select random partner
    const randomPartner = filteredPartners[Math.floor(Math.random() * filteredPartners.length)];

    res.status(200).json({
      success: true,
      partner: {
        _id: randomPartner._id,
        username: randomPartner.username,
        avatar: randomPartner.avatar,
        interests: randomPartner.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Start video call with specific user
exports.startVideoCall = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and is not blocked
    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (currentUser.blockedUsers.includes(userId) || targetUser.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot start call with this user'
      });
    }

    // Check if there's already an active call
    const existingCall = await VideoCall.findOne({
      $or: [
        { caller: req.user.id, callee: userId, status: 'active' },
        { caller: userId, callee: req.user.id, status: 'active' }
      ]
    });

    if (existingCall) {
      return res.status(400).json({
        success: false,
        error: 'Call already in progress'
      });
    }

    // Create new video call
    const videoCall = new VideoCall({
      caller: req.user.id,
      callee: userId,
      status: 'ringing',
      startTime: new Date()
    });

    await videoCall.save();
    await videoCall.populate([
      { path: 'caller', select: 'username avatar' },
      { path: 'callee', select: 'username avatar' }
    ]);

    // Emit socket event to callee
    req.app.get('io').to(`user_${userId}`).emit('incoming_call', {
      callId: videoCall._id,
      caller: videoCall.caller
    });

    res.status(201).json({
      success: true,
      call: videoCall
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Accept video call
exports.acceptVideoCall = async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.callId);

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    if (videoCall.callee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this call'
      });
    }

    if (videoCall.status !== 'ringing') {
      return res.status(400).json({
        success: false,
        error: 'Call is no longer ringing'
      });
    }

    videoCall.status = 'active';
    videoCall.startTime = new Date();
    await videoCall.save();

    // Emit socket event to caller
    req.app.get('io').to(`user_${videoCall.caller}`).emit('call_accepted', {
      callId: videoCall._id,
      callee: videoCall.callee
    });

    res.status(200).json({
      success: true,
      call: videoCall
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Reject video call
exports.rejectVideoCall = async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.callId);

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    if (videoCall.callee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reject this call'
      });
    }

    videoCall.status = 'rejected';
    videoCall.endTime = new Date();
    await videoCall.save();

    // Emit socket event to caller
    req.app.get('io').to(`user_${videoCall.caller}`).emit('call_rejected', {
      callId: videoCall._id
    });

    res.status(200).json({
      success: true,
      message: 'Call rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// End video call
exports.endVideoCall = async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.callId);

    if (!videoCall) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    if (videoCall.caller.toString() !== req.user.id && videoCall.callee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to end this call'
      });
    }

    videoCall.status = 'ended';
    videoCall.endTime = new Date();
    
    if (videoCall.startTime) {
      videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000); // Duration in seconds
    }

    await videoCall.save();

    // Emit socket event to both participants
    req.app.get('io').to(`user_${videoCall.caller}`).emit('call_ended', {
      callId: videoCall._id
    });
    req.app.get('io').to(`user_${videoCall.callee}`).emit('call_ended', {
      callId: videoCall._id
    });

    res.status(200).json({
      success: true,
      message: 'Call ended'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const calls = await VideoCall.find({
      $or: [
        { caller: req.user.id },
        { callee: req.user.id }
      ]
    })
    .populate('caller', 'username avatar')
    .populate('callee', 'username avatar')
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit);

    const total = await VideoCall.countDocuments({
      $or: [
        { caller: req.user.id },
        { callee: req.user.id }
      ]
    });

    res.status(200).json({
      success: true,
      calls,
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

// Get active calls
exports.getActiveCalls = async (req, res) => {
  try {
    const activeCalls = await VideoCall.find({
      $or: [
        { caller: req.user.id, status: 'active' },
        { callee: req.user.id, status: 'active' }
      ]
    })
    .populate('caller', 'username avatar')
    .populate('callee', 'username avatar');

    res.status(200).json({
      success: true,
      activeCalls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Report user in video chat
exports.reportUser = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const report = new Report({
      reporter: req.user.id,
      target: req.params.userId,
      targetType: 'video_chat',
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'User reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Block user from video chat
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.blockedUsers.includes(req.params.userId)) {
      user.blockedUsers.push(req.params.userId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.blockedUsers = user.blockedUsers.filter(
      userId => userId.toString() !== req.params.userId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('blockedUsers', 'username avatar firstName lastName');

    res.status(200).json({
      success: true,
      blockedUsers: user.blockedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update video chat preferences
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = req.body;

    user.videoChatPreferences = {
      ...user.videoChatPreferences,
      ...preferences
    };

    await user.save();

    res.status(200).json({
      success: true,
      preferences: user.videoChatPreferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get video chat statistics
exports.getStats = async (req, res) => {
  try {
    const totalCalls = await VideoCall.countDocuments({
      $or: [
        { caller: req.user.id },
        { callee: req.user.id }
      ]
    });

    const activeCalls = await VideoCall.countDocuments({
      $or: [
        { caller: req.user.id, status: 'active' },
        { callee: req.user.id, status: 'active' }
      ]
    });

    const averageCallDuration = await VideoCall.aggregate([
      {
        $match: {
          $or: [
            { caller: req.user.id },
            { callee: req.user.id }
          ],
          duration: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCalls,
        activeCalls,
        averageCallDuration: averageCallDuration[0]?.avgDuration || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
