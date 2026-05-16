const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Balances
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  coins: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusCoins: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Currency Settings
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'CNY', 'AUD', 'CAD'],
    default: 'USD'
  },
  
  // Subscription Information
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'premium', 'vip'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: String,
    stripeSubscriptionId: String,
    features: [{
      name: String,
      enabled: Boolean,
      limit: Number
    }]
  },
  
  // Payment Methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'bank_account', 'paypal', 'crypto'],
      required: true
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'coinbase', 'manual'],
      required: true
    },
    providerId: String, // Stripe payment method ID, etc.
    last4: String,
    brand: String, // visa, mastercard, etc.
    expiryMonth: Number,
    expiryYear: Number,
    isDefault: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Transactions
  transactions: [{
    type: {
      type: String,
      enum: [
        'deposit', 'withdrawal', 'payment', 'refund', 'bonus', 'penalty',
        'subscription', 'gift_sent', 'gift_received', 'creator_payout',
        'video_call_fee', 'premium_feature', 'boost_purchase', 'coin_purchase'
      ],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    coins: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    transactionId: String, // External transaction ID
    referenceId: String, // Internal reference
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,
    receipt: String, // Receipt URL or data
    invoice: String // Invoice URL or data
  }],
  
  // Withdrawals
  withdrawals: [{
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      required: true
    },
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'crypto', 'check'],
      required: true
    },
    destination: String, // Bank account, PayPal email, crypto address
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    processingFee: {
      type: Number,
      default: 0
    },
    taxWithheld: {
      type: Number,
      default: 0
    },
    netAmount: Number,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    cancelledAt: Date,
    failureReason: String,
    reference: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Gifts & Donations
  gifts: [{
    type: {
      type: String,
      enum: ['sent', 'received'],
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    giftType: {
      type: String,
      enum: ['coins', 'money', 'virtual_item', 'subscription'],
      required: true
    },
    amount: Number,
    coins: Number,
    itemName: String,
    itemImage: String,
    message: String,
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Creator Earnings (for content creators)
  creatorEarnings: {
    total: {
      type: Number,
      default: 0
    },
    monthly: {
      type: Number,
      default: 0
    },
    weekly: {
      type: Number,
      default: 0
    },
    daily: {
      type: Number,
      default: 0
    },
    withdrawable: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    lastPayout: Date,
    nextPayout: Date,
    payoutHistory: [{
      amount: Number,
      method: String,
      status: String,
      processedAt: Date,
      reference: String
    }]
  },
  
  // Spending Limits
  spendingLimits: {
    daily: {
      enabled: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number,
        default: 100
      }
    },
    weekly: {
      enabled: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number,
        default: 500
      }
    },
    monthly: {
      enabled: {
        type: Boolean,
        default: false
      },
      amount: {
        type: Number,
        default: 2000
      }
    }
  },
  
  // Security
  security: {
    pin: String, // 4-digit PIN for transactions
    twoFactorRequired: {
      type: Boolean,
      default: false
    },
    biometricEnabled: {
      type: Boolean,
      default: false
    },
    deviceVerification: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics
  analytics: {
    totalSpent: {
      type: Number,
      default: 0
    },
    totalReceived: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    totalDeposited: {
      type: Number,
      default: 0
    },
    totalGiftsSent: {
      type: Number,
      default: 0
    },
    totalGiftsReceived: {
      type: Number,
      default: 0
    },
    subscriptionSpending: {
      type: Number,
      default: 0
    },
    featurePurchases: {
      type: Number,
      default: 0
    },
    averageMonthlySpending: {
      type: Number,
      default: 0
    },
    lastTransactionDate: Date,
    transactionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Virtual Fields
walletSchema.virtual('totalBalance').get(function() {
  return this.balance + (this.coins * 0.01); // Assuming 1 coin = $0.01
});

walletSchema.virtual('availableBalance').get(function() {
  return this.balance; // Available for withdrawal
});

walletSchema.virtual('pendingWithdrawals').get(function() {
  return this.withdrawals
    .filter(w => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + w.amount, 0);
});

walletSchema.virtual('monthlySpending').get(function() {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.transactions
    .filter(t => t.createdAt > oneMonthAgo && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

// Indexes
walletSchema.index({ 'transactions.createdAt': -1 });
walletSchema.index({ 'withdrawals.status': 1 });
walletSchema.index({ 'subscription.endDate': 1 });
walletSchema.index({ balance: 1 });

// Methods
walletSchema.methods.addBalance = function(amount, description, type = 'deposit', metadata = {}) {
  this.balance += amount;
  
  this.transactions.push({
    type,
    amount,
    currency: this.currency,
    description,
    status: 'completed',
    metadata,
    completedAt: new Date()
  });
  
  this.analytics.totalDeposited += amount;
  this.analytics.transactionCount += 1;
  this.analytics.lastTransactionDate = new Date();
  
  return this.save();
};

walletSchema.methods.deductBalance = function(amount, description, type = 'payment', metadata = {}) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  
  this.transactions.push({
    type,
    amount: -amount,
    currency: this.currency,
    description,
    status: 'completed',
    metadata,
    completedAt: new Date()
  });
  
  this.analytics.totalSpent += amount;
  this.analytics.transactionCount += 1;
  this.analytics.lastTransactionDate = new Date();
  
  return this.save();
};

walletSchema.methods.addCoins = function(coins, description, type = 'bonus', metadata = {}) {
  this.coins += coins;
  
  this.transactions.push({
    type,
    amount: 0,
    coins,
    currency: this.currency,
    description,
    status: 'completed',
    metadata,
    completedAt: new Date()
  });
  
  return this.save();
};

walletSchema.methods.deductCoins = function(coins, description, type = 'payment', metadata = {}) {
  if (this.coins < coins) {
    throw new Error('Insufficient coins');
  }
  
  this.coins -= coins;
  
  this.transactions.push({
    type,
    amount: 0,
    coins: -coins,
    currency: this.currency,
    description,
    status: 'completed',
    metadata,
    completedAt: new Date()
  });
  
  return this.save();
};

walletSchema.methods.requestWithdrawal = function(amount, method, destination) {
  if (amount > this.balance) {
    throw new Error('Insufficient balance for withdrawal');
  }
  
  if (amount < 1) {
    throw new Error('Minimum withdrawal amount is $1');
  }
  
  const processingFee = amount * 0.025; // 2.5% processing fee
  const netAmount = amount - processingFee;
  
  this.withdrawals.push({
    amount,
    currency: this.currency,
    method,
    destination,
    processingFee,
    netAmount,
    status: 'pending'
  });
  
  // Freeze the amount
  this.balance -= amount;
  
  return this.save();
};

walletSchema.methods.processWithdrawal = function(withdrawalId, status, failureReason = null) {
  const withdrawal = this.withdrawals.id(withdrawalId);
  
  if (!withdrawal) {
    throw new Error('Withdrawal not found');
  }
  
  withdrawal.status = status;
  
  if (status === 'completed') {
    withdrawal.completedAt = new Date();
    this.analytics.totalWithdrawn += withdrawal.amount;
  } else if (status === 'failed' || status === 'cancelled') {
    withdrawal.failedAt = new Date();
    withdrawal.failureReason = failureReason;
    // Refund the amount back to balance
    this.balance += withdrawal.amount;
  }
  
  return this.save();
};

walletSchema.methods.sendGift = function(recipientId, giftType, amount = 0, coins = 0, message = '', isAnonymous = false) {
  if (amount > 0 && this.balance < amount) {
    throw new Error('Insufficient balance for gift');
  }
  
  if (coins > 0 && this.coins < coins) {
    throw new Error('Insufficient coins for gift');
  }
  
  // Deduct from sender
  if (amount > 0) {
    this.balance -= amount;
  }
  if (coins > 0) {
    this.coins -= coins;
  }
  
  this.gifts.push({
    type: 'sent',
    to: recipientId,
    giftType,
    amount,
    coins,
    message,
    isAnonymous
  });
  
  this.transactions.push({
    type: 'gift_sent',
    amount: -amount,
    coins: -coins,
    currency: this.currency,
    description: `Gift sent to user ${recipientId}`,
    status: 'completed',
    metadata: { recipientId, giftType, isAnonymous },
    completedAt: new Date()
  });
  
  this.analytics.totalGiftsSent += amount;
  
  return this.save();
};

walletSchema.methods.receiveGift = function(senderId, giftType, amount = 0, coins = 0, message = '', isAnonymous = false) {
  // Add to receiver
  if (amount > 0) {
    this.balance += amount;
  }
  if (coins > 0) {
    this.coins += coins;
  }
  
  this.gifts.push({
    type: 'received',
    from: senderId,
    giftType,
    amount,
    coins,
    message,
    isAnonymous
  });
  
  this.transactions.push({
    type: 'gift_received',
    amount,
    coins,
    currency: this.currency,
    description: `Gift received from user ${senderId}`,
    status: 'completed',
    metadata: { senderId, giftType, isAnonymous },
    completedAt: new Date()
  });
  
  this.analytics.totalGiftsReceived += amount;
  
  return this.save();
};

walletSchema.methods.updateSubscription = function(type, startDate, endDate, paymentMethod) {
  this.subscription.type = type;
  this.subscription.startDate = startDate;
  this.subscription.endDate = endDate;
  this.subscription.paymentMethod = paymentMethod;
  
  return this.save();
};

walletSchema.methods.checkSpendingLimit = function(amount) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const dailySpending = this.transactions
    .filter(t => t.createdAt > oneDayAgo && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const weeklySpending = this.transactions
    .filter(t => t.createdAt > oneWeekAgo && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const monthlySpending = this.transactions
    .filter(t => t.createdAt > oneMonthAgo && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  if (this.spendingLimits.daily.enabled && dailySpending + amount > this.spendingLimits.daily.amount) {
    return { allowed: false, reason: 'daily_limit_exceeded', limit: this.spendingLimits.daily.amount };
  }
  
  if (this.spendingLimits.weekly.enabled && weeklySpending + amount > this.spendingLimits.weekly.amount) {
    return { allowed: false, reason: 'weekly_limit_exceeded', limit: this.spendingLimits.weekly.amount };
  }
  
  if (this.spendingLimits.monthly.enabled && monthlySpending + amount > this.spendingLimits.monthly.amount) {
    return { allowed: false, reason: 'monthly_limit_exceeded', limit: this.spendingLimits.monthly.amount };
  }
  
  return { allowed: true };
};

// Static Methods
walletSchema.statics.findWalletByUser = function(userId) {
  return this.findOne({ user: userId }).populate('user', 'username email');
};

walletSchema.statics.getTransactionHistory = function(userId, options = {}) {
  const { limit = 50, skip = 0, type = null, status = null } = options;
  
  const query = { user: userId };
  
  if (type) {
    query['transactions.type'] = type;
  }
  
  if (status) {
    query['transactions.status'] = status;
  }
  
  return this.findOne({ user: userId })
    .select('transactions')
    .then(wallet => {
      if (!wallet) return [];
      
      let transactions = wallet.transactions;
      
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      
      if (status) {
        transactions = transactions.filter(t => t.status === status);
      }
      
      return transactions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + limit);
    });
};

module.exports = mongoose.model('Wallet', walletSchema);
