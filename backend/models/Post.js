const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      maxlength: 5000,
      default: ''
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video', 'gif', 'audio'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      thumbnail: String, // For videos
      duration: Number, // For videos/audio in seconds
      size: Number, // File size in bytes
      dimensions: {
        width: Number,
        height: Number
      },
      caption: String,
      alt: String
    }],
    feelings: {
      type: String,
      enum: [
        'happy', 'loved', 'excited', 'grateful', 'blessed', 'motivated',
        'sad', 'angry', 'frustrated', 'lonely', 'worried', 'stressed',
        'surprised', 'confused', 'curious', 'proud', 'relieved', 'hopeful'
      ]
    },
    activity: {
      type: String,
      enum: [
        'traveling', 'working', 'studying', 'exercising', 'cooking', 'reading',
        'gaming', 'shopping', 'watching', 'listening', 'celebrating', 'relaxing'
      ]
    },
    location: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    hashtags: [String],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    }]
  },
  
  // Post Type
  postType: {
    type: String,
    enum: ['post', 'story', 'reel', 'live'],
    default: 'post'
  },
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private', 'custom'],
    default: 'public'
  },
  customAudience: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    media: [{
      type: String,
      enum: ['image', 'gif', 'sticker'],
      url: String,
      alt: String
    }],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    }],
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: 500
      },
      mentions: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String
      }],
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    shareType: {
      type: String,
      enum: ['share', 'repost', 'quote'],
      default: 'share'
    },
    caption: String
  }],
  saves: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Story Specific Fields
  storyData: {
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    viewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    interactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['reply', 'reaction', 'share'],
        default: 'reply'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Reel Specific Fields
  reelData: {
    duration: Number,
    audio: {
      title: String,
      artist: String,
      url: String,
      isOriginal: {
        type: Boolean,
        default: true
      }
    },
    effects: [String],
    filters: [String],
    trending: {
      isTrending: {
        type: Boolean,
        default: false
      },
      rank: Number,
      category: String
    }
  },
  
  // Live Stream Specific Fields
  liveData: {
    streamKey: String,
    streamUrl: String,
    isLive: {
      type: Boolean,
      default: false
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    viewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date
    }],
    peakViewers: {
      type: Number,
      default: 0
    },
    category: String,
    title: String,
    description: String
  },
  
  // Status
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  moderation: {
    isApproved: {
      type: Boolean,
      default: true
    },
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    aiModerationScore: Number,
    toxicContentDetected: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    shareRate: {
      type: Number,
      default: 0
    },
    saveRate: {
      type: Number,
      default: 0
    }
  },
  
  // Scheduled Posts
  scheduledFor: Date,
  
  // Cross-posting
  crossPosted: [{
    platform: {
      type: String,
      enum: ['twitter', 'instagram', 'facebook', 'tiktok', 'youtube']
    },
    postId: String,
    postedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Fields
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

postSchema.virtual('saveCount').get(function() {
  return this.saves.length;
});

postSchema.virtual('totalEngagement').get(function() {
  return this.likeCount + this.commentCount + this.shareCount;
});

postSchema.virtual('isLikedBy').get(function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
});

postSchema.virtual('isSavedBy').get(function(userId) {
  return this.saves.some(save => save.user.toString() === userId.toString());
});

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'content.hashtags': 1 });
postSchema.index({ 'content.mentions.user': 1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ visibility: 1, isDeleted: 1 });
postSchema.index({ 'moderation.isApproved': 1, 'moderation.isFlagged': 1 });
postSchema.index({ scheduledFor: 1 });
postSchema.index({ 'storyData.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Methods
postSchema.methods.addLike = function(userId, reaction = 'like') {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    existingLike.reaction = reaction;
  } else {
    this.likes.push({ user: userId, reaction });
  }
  
  this.analytics.engagement = this.totalEngagement;
  return this.save();
};

postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  this.analytics.engagement = this.totalEngagement;
  return this.save();
};

postSchema.methods.addComment = function(userId, text, media = null) {
  const comment = {
    user: userId,
    text,
    media: media || []
  };
  
  this.comments.push(comment);
  this.analytics.engagement = this.totalEngagement;
  return this.save();
};

postSchema.methods.addView = function(userId) {
  this.analytics.views += 1;
  return this.save();
};

postSchema.methods.isExpiredStory = function() {
  if (this.postType !== 'story') return false;
  return new Date() > this.storyData.expiresAt;
};

// Static Methods
postSchema.statics.findActivePosts = function(filter = {}) {
  return this.find({
    ...filter,
    isDeleted: false,
    'moderation.isApproved': true,
    'moderation.isFlagged': false,
    $or: [
      { postType: { $ne: 'story' } },
      { postType: 'story', 'storyData.expiresAt': { $gt: new Date() } }
    ]
  }).populate('author', 'username fullName profilePicture verificationBadge');
};

postSchema.statics.findTrendingPosts = function(limit = 10) {
  return this.find({
    isDeleted: false,
    'moderation.isApproved': true,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  })
  .sort({ 'analytics.engagement': -1 })
  .limit(limit)
  .populate('author', 'username fullName profilePicture verificationBadge');
};

postSchema.statics.findByHashtag = function(hashtag, limit = 20) {
  return this.find({
    'content.hashtags': hashtag,
    isDeleted: false,
    'moderation.isApproved': true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('author', 'username fullName profilePicture verificationBadge');
};

module.exports = mongoose.model('Post', postSchema);
