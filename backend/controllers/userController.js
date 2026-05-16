const User = require('../models/User');
const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate('blockedUsers', 'username');

    res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'bio', 'location', 'website', 'dateOfBirth'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Upload profile picture
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old avatar if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`roaldate/avatars/${publicId}`);
    }

    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      user: user.toSafeObject()
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
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        error: 'Already following this user'
      });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's followers
exports.getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username avatar firstName lastName');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's following
exports.getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username avatar firstName lastName');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        { blockedUsers: { $ne: req.user.id } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username avatar firstName lastName')
    .limit(20);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username avatar')
      .populate('likes', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: req.params.userId });

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

// Block user
exports.blockUser = async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (userToBlock._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot block yourself'
      });
    }

    if (currentUser.blockedUsers.includes(userToBlock._id)) {
      return res.status(400).json({
        success: false,
        error: 'User already blocked'
      });
    }

    currentUser.blockedUsers.push(userToBlock._id);

    // Remove from following/followers if exists
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToBlock._id.toString()
    );
    currentUser.followers = currentUser.followers.filter(
      id => id.toString() !== userToBlock._id.toString()
    );

    await currentUser.save();

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
    const currentUser = await User.findById(req.user.id);

    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== req.params.userId
    );

    await currentUser.save();

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

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Delete user's posts
    await Post.deleteMany({ author: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
