const DatingProfile = require('../models/DatingProfile');
const Match = require('../models/Match');
const User = require('../models/User');
const Report = require('../models/Report');

// Get dating profile
exports.getDatingProfile = async (req, res) => {
  try {
    let profile = await DatingProfile.findOne({ user: req.user.id })
      .populate('user', 'username avatar firstName lastName');

    if (!profile) {
      // Create default profile if doesn't exist
      profile = new DatingProfile({
        user: req.user.id,
        bio: '',
        interests: [],
        lookingFor: [],
        ageRange: { min: 18, max: 100 },
        maxDistance: 50,
        photos: [],
        verificationStatus: 'pending'
      });
      await profile.save();
      await profile.populate('user', 'username avatar firstName lastName');
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create/update dating profile
exports.updateDatingProfile = async (req, res) => {
  try {
    const profile = await DatingProfile.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'username avatar firstName lastName');

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Upload dating profile photos
exports.uploadPhotos = async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Dating profile not found'
      });
    }

    const photos = req.files ? req.files.map(file => ({
      url: file.path,
      isPrimary: profile.photos.length === 0 // First photo is primary
    })) : [];

    profile.photos.push(...photos);
    await profile.save();

    res.status(200).json({
      success: true,
      photos: profile.photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete dating profile photo
exports.deletePhoto = async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Dating profile not found'
      });
    }

    profile.photos = profile.photos.filter(photo => photo._id.toString() !== req.params.photoId);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Set primary photo
exports.setPrimaryPhoto = async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Dating profile not found'
      });
    }

    // Reset all photos to non-primary
    profile.photos.forEach(photo => {
      photo.isPrimary = false;
    });

    // Set selected photo as primary
    const primaryPhoto = profile.photos.id(req.params.photoId);
    if (primaryPhoto) {
      primaryPhoto.isPrimary = true;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Primary photo set successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get potential matches (swipe deck)
exports.getPotentialMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await DatingProfile.findOne({ user: req.user.id });

    if (!profile || profile.photos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please complete your profile and add photos first'
      });
    }

    // Get users already swiped
    const existingMatches = await Match.find({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    const swipedUserIds = existingMatches.map(match => 
      match.user1.toString() === req.user.id ? match.user2 : match.user1
    );

    // Get potential matches
    const potentialMatches = await DatingProfile.find({
      user: { 
        $ne: req.user.id,
        $nin: swipedUserIds,
        $nin: user.blockedUsers
      },
      photos: { $exists: true, $ne: [] },
      verificationStatus: { $ne: 'rejected' }
    })
    .populate('user', 'username avatar firstName lastName age location')
    .limit(20);

    res.status(200).json({
      success: true,
      profiles: potentialMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Swipe on profile
exports.swipeProfile = async (req, res) => {
  try {
    const { action } = req.body;
    const targetProfileId = req.params.profileId;

    const targetProfile = await DatingProfile.findById(targetProfileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Check if already swiped
    const existingMatch = await Match.findOne({
      $or: [
        { user1: req.user.id, user2: targetProfile.user },
        { user1: targetProfile.user, user2: req.user.id }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        error: 'Already swiped on this profile'
      });
    }

    // Create new match record
    const match = new Match({
      user1: req.user.id,
      user2: targetProfile.user,
      action1: action,
      timestamp: new Date()
    });

    await match.save();

    // Check if it's a mutual match
    if (action === 'like' || action === 'super_like') {
      const reciprocalMatch = await Match.findOne({
        user1: targetProfile.user,
        user2: req.user.id,
        action1: { $in: ['like', 'super_like'] }
      });

      if (reciprocalMatch) {
        // It's a match!
        match.isMatch = true;
        match.matchedAt = new Date();
        await match.save();

        // Emit socket event to both users
        req.app.get('io').to(`user_${req.user.id}`).emit('new_match', {
          matchId: match._id,
          partner: targetProfile.user
        });
        req.app.get('io').to(`user_${targetProfile.user}`).emit('new_match', {
          matchId: match._id,
          partner: req.user.id
        });
      }
    }

    res.status(201).json({
      success: true,
      match,
      isMatch: match.isMatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's matches
exports.getUserMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.user.id, isMatch: true },
        { user2: req.user.id, isMatch: true }
      ]
    })
    .populate([
      { path: 'user1', select: 'username avatar firstName lastName' },
      { path: 'user2', select: 'username avatar firstName lastName' }
    ])
    .sort({ matchedAt: -1 });

    res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get match details
exports.getMatchDetails = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate([
        { path: 'user1', select: 'username avatar firstName lastName' },
        { path: 'user2', select: 'username avatar firstName lastName' }
      ]);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user1._id.toString() !== req.user.id && match.user2._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this match'
      });
    }

    res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send message to match
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to message this match'
      });
    }

    const message = {
      sender: req.user.id,
      content,
      timestamp: new Date()
    };

    match.messages.push(message);
    await match.save();

    // Emit socket event
    const recipientId = match.user1.toString() === req.user.id ? match.user2 : match.user1;
    req.app.get('io').to(`user_${recipientId}`).emit('match_message', {
      matchId: match._id,
      message
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get conversation with match
exports.getMessages = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this conversation'
      });
    }

    res.status(200).json({
      success: true,
      messages: match.messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unmatch with user
exports.unmatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to unmatch this user'
      });
    }

    await Match.findByIdAndDelete(req.params.matchId);

    res.status(200).json({
      success: true,
      message: 'Unmatched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Report user
exports.reportUser = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const report = new Report({
      reporter: req.user.id,
      target: req.params.profileId,
      targetType: 'dating_profile',
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

// Block user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.blockedUsers.includes(req.params.profileId)) {
      user.blockedUsers.push(req.params.profileId);
      await user.save();
    }

    // Remove any existing matches
    await Match.deleteMany({
      $or: [
        { user1: req.user.id, user2: req.params.profileId },
        { user1: req.params.profileId, user2: req.user.id }
      ]
    });

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
      userId => userId.toString() !== req.params.profileId
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

// Get dating preferences
exports.getPreferences = async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      preferences: profile?.preferences || {
        ageRange: { min: 18, max: 100 },
        maxDistance: 50,
        interestedIn: ['male', 'female', 'other'],
        showOnlyVerified: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update dating preferences
exports.updatePreferences = async (req, res) => {
  try {
    const profile = await DatingProfile.findOneAndUpdate(
      { user: req.user.id },
      { preferences: req.body },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      preferences: profile.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get dating statistics
exports.getStats = async (req, res) => {
  try {
    const totalSwipes = await Match.countDocuments({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    });

    const totalMatches = await Match.countDocuments({
      $or: [
        { user1: req.user.id, isMatch: true },
        { user2: req.user.id, isMatch: true }
      ]
    });

    const totalLikes = await Match.countDocuments({
      $or: [
        { user1: req.user.id, action1: 'like' },
        { user2: req.user.id, action1: 'like' }
      ]
    });

    const totalSuperLikes = await Match.countDocuments({
      $or: [
        { user1: req.user.id, action1: 'super_like' },
        { user2: req.user.id, action1: 'super_like' }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSwipes,
        totalMatches,
        totalLikes,
        totalSuperLikes,
        matchRate: totalSwipes > 0 ? (totalMatches / totalSwipes * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Boost profile
exports.boostProfile = async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Dating profile not found'
      });
    }

    // Check if user has enough coins/tokens (implement payment logic here)
    
    profile.isBoosted = true;
    profile.boostedAt = new Date();
    profile.boostExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile boosted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get super likes count
exports.getSuperLikesCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      superLikesCount: user.superLikes || 5 // Default 5 super likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Purchase super likes
exports.purchaseSuperLikes = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);

    // Implement payment logic here
    
    user.superLikes = (user.superLikes || 0) + quantity;
    await user.save();

    res.status(200).json({
      success: true,
      superLikesCount: user.superLikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
