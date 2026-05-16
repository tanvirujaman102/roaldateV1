const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'cancelled', 'expired', 'suspended']
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  cancelledAt: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  features: {
    superLikes: {
      type: Number,
      default: 0
    },
    boosts: {
      type: Number,
      default: 0
    },
    profileVisibility: {
      type: Boolean,
      default: false
    },
    unlimitedSwipes: {
      type: Boolean,
      default: false
    },
    seeWhoLikesYou: {
      type: Boolean,
      default: false
    },
    rewindProfile: {
      type: Number,
      default: 0
    }
  },
  stripeSubscriptionId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSubscriptionSchema.index({ user: 1 });
userSubscriptionSchema.index({ plan: 1 });
userSubscriptionSchema.index({ status: 1 });
userSubscriptionSchema.index({ endDate: 1 });
userSubscriptionSchema.index({ stripeSubscriptionId: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
