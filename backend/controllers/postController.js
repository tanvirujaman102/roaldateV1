const Post = require('../models/Post');
const User = require('../models/User');
const Report = require('../models/Report');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, tags, location, feeling } = req.body;
    const media = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 
            file.mimetype.startsWith('audio/') ? 'audio' : 'file',
      url: file.path,
      thumbnail: file.mimetype.startsWith('video/') ? file.path.replace(/\.[^/.]+$/, '_thumb.jpg') : undefined
    })) : [];

    const post = new Post({
      author: req.user.id,
      content,
      media,
      tags: tags || [],
      location: location || undefined,
      feeling: feeling || undefined
    });

    await post.save();
    await post.populate('author', 'username avatar firstName lastName');

    res.status(201).json({
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

// Get all posts (feed)
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $and: [
        { author: { $nin: req.user.blockedUsers } },
        { author: { $ne: req.user.id } }
      ]
    })
    .populate('author', 'username avatar firstName lastName')
    .populate('likes', 'username avatar')
    .populate('comments.author', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({
      $and: [
        { author: { $nin: req.user.blockedUsers } },
        { author: { $ne: req.user.id } }
      ]
    });

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

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    const { content, tags } = req.body;

    if (content) post.content = content;
    if (tags) post.tags = tags;

    post.updatedAt = new Date();
    await post.save();

    await post.populate('author', 'username avatar firstName lastName');

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

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
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

// Like post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Post already liked'
      });
    }

    post.likes.push(req.user.id);
    await post.save();

    await post.populate('author', 'username avatar firstName lastName');

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

// Unlike post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    await post.save();

    await post.populate('author', 'username avatar firstName lastName');

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

// Add comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const { content } = req.body;

    const comment = {
      author: req.user.id,
      content,
      timestamp: new Date()
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.author', 'username avatar firstName lastName');

    res.status(201).json({
      success: true,
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get post comments
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('comments.author', 'username avatar firstName lastName')
      .select('comments');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    const { content } = req.body;
    comment.content = content;
    comment.updatedAt = new Date();

    await post.save();

    await post.populate('comments.author', 'username avatar firstName lastName');

    res.status(200).json({
      success: true,
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user.id && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Share post
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    post.shares += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post shared successfully',
      shares: post.shares
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Save post
exports.savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.savedPosts.includes(req.params.postId)) {
      return res.status(400).json({
        success: false,
        error: 'Post already saved'
      });
    }

    user.savedPosts.push(req.params.postId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Post saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unsave post
exports.unsavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Post unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedPosts',
        populate: [
          { path: 'author', select: 'username avatar firstName lastName' },
          { path: 'likes', select: 'username avatar' }
        ],
        options: { skip, limit, sort: { createdAt: -1 } }
      });

    const total = user.savedPosts.length;

    res.status(200).json({
      success: true,
      posts: user.savedPosts,
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

// Report post
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const { reason, description } = req.body;

    const report = new Report({
      reporter: req.user.id,
      target: post._id,
      targetType: 'post',
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Post reported successfully'
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
      .populate('author', 'username avatar firstName lastName')
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

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Calculate trending score based on likes, comments, shares, and recency
    const posts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('author', 'username avatar firstName lastName')
    .populate('likes', 'username avatar')
    .sort({ 
      score: -1,
      createdAt: -1 
    })
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
