const PartyRoom = require('../models/PartyRoom');
const User = require('../models/User');
const Report = require('../models/Report');

// Create a new party room
exports.createPartyRoom = async (req, res) => {
  try {
    const { name, description, type, maxParticipants, isPrivate, password } = req.body;

    const partyRoom = new PartyRoom({
      name,
      description,
      type: type || 'both',
      maxParticipants: maxParticipants || 10,
      isPrivate: isPrivate || false,
      password: password || undefined,
      createdBy: req.user.id,
      participants: [req.user.id],
      moderators: [req.user.id]
    });

    await partyRoom.save();
    await partyRoom.populate('participants', 'username avatar firstName lastName');
    await partyRoom.populate('createdBy', 'username avatar firstName lastName');

    res.status(201).json({
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

// Get all party rooms
exports.getPartyRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const partyRooms = await PartyRoom.find({
      $or: [
        { isPrivate: false },
        { participants: req.user.id }
      ]
    })
    .populate('participants', 'username avatar firstName lastName isOnline')
    .populate('createdBy', 'username avatar firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await PartyRoom.countDocuments({
      $or: [
        { isPrivate: false },
        { participants: req.user.id }
      ]
    });

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
exports.getPartyRoom = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId)
      .populate('participants', 'username avatar firstName lastName isOnline')
      .populate('createdBy', 'username avatar firstName lastName')
      .populate('moderators', 'username avatar firstName lastName');

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (!partyRoom.participants.includes(req.user.id) && partyRoom.isPrivate) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this party room'
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

// Join party room
exports.joinPartyRoom = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Already in this party room'
      });
    }

    if (partyRoom.participants.length >= partyRoom.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'Party room is full'
      });
    }

    if (partyRoom.isPrivate && partyRoom.password !== req.body.password) {
      return res.status(403).json({
        success: false,
        error: 'Invalid password'
      });
    }

    partyRoom.participants.push(req.user.id);
    await partyRoom.save();

    await partyRoom.populate('participants', 'username avatar firstName lastName');

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_joined_party', {
      userId: req.user.id,
      partyRoom
    });

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

// Leave party room
exports.leavePartyRoom = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    partyRoom.participants = partyRoom.participants.filter(
      participantId => participantId.toString() !== req.user.id
    );

    // Remove from moderators if user was a moderator
    partyRoom.moderators = partyRoom.moderators.filter(
      moderatorId => moderatorId.toString() !== req.user.id
    );

    // If no participants left, delete the party room
    if (partyRoom.participants.length === 0) {
      await PartyRoom.findByIdAndDelete(req.params.partyId);
    } else {
      // If creator left, assign new creator
      if (partyRoom.createdBy.toString() === req.user.id && partyRoom.participants.length > 0) {
        partyRoom.createdBy = partyRoom.participants[0];
        partyRoom.moderators.push(partyRoom.participants[0]);
      }
      await partyRoom.save();
    }

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_left_party', {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Left party room successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update party room
exports.updatePartyRoom = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this party room'
      });
    }

    const { name, description, maxParticipants, isPrivate } = req.body;

    if (name) partyRoom.name = name;
    if (description) partyRoom.description = description;
    if (maxParticipants) partyRoom.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) partyRoom.isPrivate = isPrivate;

    await partyRoom.save();
    await partyRoom.populate('participants', 'username avatar firstName lastName');

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

    if (partyRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this party room'
      });
    }

    // Emit socket event to all participants
    req.app.get('io').to(`party_${req.params.partyId}`).emit('party_room_deleted', {
      partyRoomId: req.params.partyId
    });

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

// Kick participant from party room
exports.kickParticipant = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to kick participants'
      });
    }

    partyRoom.participants = partyRoom.participants.filter(
      participantId => participantId.toString() !== req.params.userId
    );

    await partyRoom.save();

    // Emit socket events
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_kicked', {
      userId: req.params.userId
    });
    req.app.get('io').to(`user_${req.params.userId}`).emit('kicked_from_party', {
      partyRoomId: req.params.partyId
    });

    res.status(200).json({
      success: true,
      message: 'Participant kicked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Ban participant from party room
exports.banParticipant = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to ban participants'
      });
    }

    if (!partyRoom.bannedUsers) {
      partyRoom.bannedUsers = [];
    }

    partyRoom.bannedUsers.push(req.params.userId);
    partyRoom.participants = partyRoom.participants.filter(
      participantId => participantId.toString() !== req.params.userId
    );

    await partyRoom.save();

    // Emit socket events
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_banned', {
      userId: req.params.userId
    });
    req.app.get('io').to(`user_${req.params.userId}`).emit('banned_from_party', {
      partyRoomId: req.params.partyId
    });

    res.status(200).json({
      success: true,
      message: 'Participant banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unban participant from party room
exports.unbanParticipant = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to unban participants'
      });
    }

    partyRoom.bannedUsers = partyRoom.bannedUsers.filter(
      userId => userId.toString() !== req.params.userId
    );

    await partyRoom.save();

    res.status(200).json({
      success: true,
      message: 'Participant unbanned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get party room participants
exports.getParticipants = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId)
      .populate('participants', 'username avatar firstName lastName isOnline')
      .populate('moderators', 'username avatar firstName lastName');

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (!partyRoom.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view participants'
      });
    }

    res.status(200).json({
      success: true,
      participants: partyRoom.participants,
      moderators: partyRoom.moderators
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mute/unmute participant
exports.muteParticipant = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to mute participants'
      });
    }

    if (!partyRoom.mutedUsers) {
      partyRoom.mutedUsers = [];
    }

    if (!partyRoom.mutedUsers.includes(req.params.userId)) {
      partyRoom.mutedUsers.push(req.params.userId);
    }

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_muted', {
      userId: req.params.userId
    });

    res.status(200).json({
      success: true,
      message: 'Participant muted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.unmuteParticipant = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id && !partyRoom.moderators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to unmute participants'
      });
    }

    partyRoom.mutedUsers = partyRoom.mutedUsers.filter(
      userId => userId.toString() !== req.params.userId
    );

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('user_unmuted', {
      userId: req.params.userId
    });

    res.status(200).json({
      success: true,
      message: 'Participant unmuted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Make participant moderator
exports.makeModerator = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only creator can make moderators'
      });
    }

    if (!partyRoom.moderators.includes(req.params.userId)) {
      partyRoom.moderators.push(req.params.userId);
    }

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('moderator_added', {
      userId: req.params.userId
    });

    res.status(200).json({
      success: true,
      message: 'Moderator added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove moderator role
exports.removeModerator = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only creator can remove moderators'
      });
    }

    partyRoom.moderators = partyRoom.moderators.filter(
      moderatorId => moderatorId.toString() !== req.params.userId
    );

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('moderator_removed', {
      userId: req.params.userId
    });

    res.status(200).json({
      success: true,
      message: 'Moderator removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Start screen sharing
exports.startScreenShare = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (!partyRoom.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to share screen in this party room'
      });
    }

    partyRoom.screenSharing = {
      isActive: true,
      userId: req.user.id,
      startedAt: new Date()
    };

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('screen_share_started', {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Screen sharing started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Stop screen sharing
exports.stopScreenShare = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (partyRoom.screenSharing?.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to stop this screen share'
      });
    }

    partyRoom.screenSharing = {
      isActive: false,
      userId: null,
      startedAt: null
    };

    await partyRoom.save();

    // Emit socket event
    req.app.get('io').to(`party_${req.params.partyId}`).emit('screen_share_stopped');

    res.status(200).json({
      success: true,
      message: 'Screen sharing stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get party room history
exports.getPartyHistory = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId)
      .populate('history.user', 'username avatar')
      .sort({ 'history.timestamp': -1 });

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (!partyRoom.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view party history'
      });
    }

    res.status(200).json({
      success: true,
      history: partyRoom.history || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Report party room
exports.reportPartyRoom = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const report = new Report({
      reporter: req.user.id,
      target: req.params.partyId,
      targetType: 'party_room',
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Party room reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's party rooms
exports.getUserPartyRooms = async (req, res) => {
  try {
    const partyRooms = await PartyRoom.find({ participants: req.user.id })
      .populate('participants', 'username avatar firstName lastName isOnline')
      .populate('createdBy', 'username avatar firstName lastName')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      partyRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get party room statistics
exports.getPartyStats = async (req, res) => {
  try {
    const partyRoom = await PartyRoom.findById(req.params.partyId);

    if (!partyRoom) {
      return res.status(404).json({
        success: false,
        error: 'Party room not found'
      });
    }

    if (!partyRoom.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view party stats'
      });
    }

    const stats = {
      totalParticipants: partyRoom.participants.length,
      maxParticipants: partyRoom.maxParticipants,
      moderators: partyRoom.moderators.length,
      bannedUsers: partyRoom.bannedUsers?.length || 0,
      mutedUsers: partyRoom.mutedUsers?.length || 0,
      createdAt: partyRoom.createdAt,
      isActive: partyRoom.screenSharing?.isActive || false
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
