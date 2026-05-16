const Report = require('../models/Report');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all chat rooms for user
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user.id
    })
    .populate('participants', 'username avatar firstName lastName isOnline')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chatRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new chat room
exports.createChatRoom = async (req, res) => {
  try {
    const { participants, name, type } = req.body;

    // Check if private chat already exists
    if (type === 'private' && participants.length === 1) {
      const existingChat = await ChatRoom.findOne({
        type: 'private',
        participants: { $all: [req.user.id, participants[0]], $size: 2 }
      });

      if (existingChat) {
        return res.status(400).json({
          success: false,
          error: 'Private chat already exists'
        });
      }
    }

    const chatRoom = new ChatRoom({
      participants: [req.user.id, ...participants],
      name: name || undefined,
      type: type || 'private',
      createdBy: req.user.id
    });

    await chatRoom.save();
    await chatRoom.populate('participants', 'username avatar firstName lastName');

    res.status(201).json({
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

// Get specific chat room
exports.getChatRoom = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId)
      .populate('participants', 'username avatar firstName lastName isOnline')
      .populate('lastMessage');

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat room'
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

// Update chat room
exports.updateChatRoom = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (chatRoom.createdBy.toString() !== req.user.id && chatRoom.type !== 'private') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this chat room'
      });
    }

    const { name, description } = req.body;

    if (name) chatRoom.name = name;
    if (description) chatRoom.description = description;

    await chatRoom.save();
    await chatRoom.populate('participants', 'username avatar firstName lastName');

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

    if (chatRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this chat room'
      });
    }

    // Delete all messages in the chat room
    await Message.deleteMany({ chatRoom: chatRoom._id });

    // Delete the chat room
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

// Add participants to group chat
exports.addParticipants = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (chatRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add participants'
      });
    }

    const { participants } = req.body;

    // Filter out existing participants
    const newParticipants = participants.filter(
      participantId => !chatRoom.participants.includes(participantId)
    );

    chatRoom.participants.push(...newParticipants);
    await chatRoom.save();

    await chatRoom.populate('participants', 'username avatar firstName lastName');

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

// Remove participant from group chat
exports.removeParticipant = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (chatRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove participants'
      });
    }

    chatRoom.participants = chatRoom.participants.filter(
      participantId => participantId.toString() !== req.params.userId
    );

    await chatRoom.save();

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Leave chat room
exports.leaveChatRoom = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    chatRoom.participants = chatRoom.participants.filter(
      participantId => participantId.toString() !== req.user.id
    );

    // If no participants left, delete the chat room
    if (chatRoom.participants.length === 0) {
      await Message.deleteMany({ chatRoom: chatRoom._id });
      await ChatRoom.findByIdAndDelete(req.params.roomId);
    } else {
      await chatRoom.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left chat room successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get messages in chat room
exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat room'
      });
    }

    const messages = await Message.find({ chatRoom: req.params.roomId })
      .populate('author', 'username avatar firstName lastName')
      .populate('replyTo.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chatRoom: req.params.roomId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
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

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this chat room'
      });
    }

    const { content, messageType, replyTo } = req.body;
    const media = req.file ? {
      type: req.file.mimetype.startsWith('image/') ? 'image' : 
            req.file.mimetype.startsWith('video/') ? 'video' : 
            req.file.mimetype.startsWith('audio/') ? 'audio' : 'file',
      url: req.file.path
    } : undefined;

    const message = new Message({
      chatRoom: req.params.roomId,
      author: req.user.id,
      content: content || undefined,
      media,
      messageType: messageType || (media ? media.type : 'text'),
      replyTo: replyTo || undefined
    });

    await message.save();
    await message.populate([
      { path: 'author', select: 'username avatar firstName lastName' },
      { path: 'replyTo.author', select: 'username avatar' }
    ]);

    // Update last message in chat room
    chatRoom.lastMessage = message._id;
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    // Emit socket event
    req.app.get('io').to(`chat_${req.params.roomId}`).emit('new_message', message);

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

// Update message
exports.updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this message'
      });
    }

    const { content } = req.body;
    message.content = content;
    message.updatedAt = new Date();

    await message.save();
    await message.populate('author', 'username avatar firstName lastName');

    // Emit socket event
    req.app.get('io').to(`chat_${message.chatRoom}`).emit('message_updated', message);

    res.status(200).json({
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

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    if (message.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    // Emit socket event
    req.app.get('io').to(`chat_${message.chatRoom}`).emit('message_deleted', {
      messageId: req.params.messageId
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    const chatRoom = await ChatRoom.findById(message.chatRoom);

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this message'
      });
    }

    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark all messages as read
exports.markAllAsRead = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    await Message.updateMany(
      { 
        chatRoom: req.params.roomId,
        author: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $push: { readBy: req.user.id } }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ participants: req.user.id });
    const chatRoomIds = chatRooms.map(room => room._id);

    const unreadCount = await Message.countDocuments({
      chatRoom: { $in: chatRoomIds },
      author: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
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

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const chatRooms = await ChatRoom.find({ participants: req.user.id });
    const chatRoomIds = chatRooms.map(room => room._id);

    const messages = await Message.find({
      chatRoom: { $in: chatRoomIds },
      content: { $regex: q, $options: 'i' }
    })
    .populate('author', 'username avatar firstName lastName')
    .populate('chatRoom', 'name type')
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get typing users in chat room
exports.getTypingUsers = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat room'
      });
    }

    // This would typically be handled by Socket.IO
    // For now, return empty array
    res.status(200).json({
      success: true,
      typingUsers: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Start typing
exports.startTyping = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat room'
      });
    }

    // Emit typing event to other participants
    req.app.get('io').to(`chat_${req.params.roomId}`).emit('user_typing', {
      userId: req.user.id,
      chatRoomId: req.params.roomId
    });

    res.status(200).json({
      success: true,
      message: 'Typing event sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Stop typing
exports.stopTyping = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat room'
      });
    }

    // Emit stop typing event to other participants
    req.app.get('io').to(`chat_${req.params.roomId}`).emit('user_stop_typing', {
      userId: req.user.id,
      chatRoomId: req.params.roomId
    });

    res.status(200).json({
      success: true,
      message: 'Stop typing event sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Block user in chat
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToBlock = req.params.userId;

    if (!user.blockedUsers.includes(userToBlock)) {
      user.blockedUsers.push(userToBlock);
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

// Report message
exports.reportMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    const chatRoom = await ChatRoom.findById(message.chatRoom);

    if (!chatRoom.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to report this message'
      });
    }

    const { reason, description } = req.body;

    const report = new Report({
      reporter: req.user.id,
      target: message._id,
      targetType: 'message',
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Message reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
