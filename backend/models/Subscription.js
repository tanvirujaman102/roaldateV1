const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // Duration in days
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    included: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number // For features with limits (e.g., super likes per month)
    }
  }],
  tier: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stripePriceId: {
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

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

subscriptionSchema.index({ tier: 1 });
subscriptionSchema.index({ isActive: 1 });
subscriptionSchema.index({ price: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
