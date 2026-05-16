const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'send', 'receive', 'request', 'purchase', 'earnings', 'earnings_withdrawal']
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
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded']
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  message: {
    type: String,
    maxlength: 200,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['bank', 'paypal', 'card']
  },
  accountDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
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

transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
