const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const PaymentMethod = require('../models/PaymentMethod');
const User = require('../models/User');
const UserSubscription = require('../models/UserSubscription');

// Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = new Wallet({
        user: req.user.id,
        balance: 0,
        currency: 'USD'
      });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get wallet transactions
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      transactions,
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

// Add funds to wallet
exports.addFunds = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Create payment intent with Stripe (implement Stripe logic here)
    
    // For now, simulate successful payment
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id,
        balance: 0,
        currency: 'USD'
      });
    }

    wallet.balance += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      paymentMethod,
      description: `Added $${amount} to wallet`
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Withdraw funds
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, accountType, accountDetails } = req.body;

    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    wallet.balance -= amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      accountType,
      accountDetails,
      description: `Withdrawal of $${amount}`
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send money to another user
exports.sendMoney = async (req, res) => {
  try {
    const { recipientId, amount, message } = req.body;

    let senderWallet = await Wallet.findOne({ user: req.user.id });
    
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    let recipientWallet = await Wallet.findOne({ user: recipientId });
    
    if (!recipientWallet) {
      recipientWallet = new Wallet({
        user: recipientId,
        balance: 0,
        currency: 'USD'
      });
    }

    // Transfer funds
    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save();
    await recipientWallet.save();

    // Create transaction records
    const senderTransaction = new Transaction({
      user: req.user.id,
      type: 'send',
      amount,
      recipient: recipientId,
      status: 'completed',
      description: `Sent $${amount} to user`
    });

    const recipientTransaction = new Transaction({
      user: recipientId,
      type: 'receive',
      amount,
      sender: req.user.id,
      status: 'completed',
      description: `Received $${amount} from user`,
      message
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.status(200).json({
      success: true,
      balance: senderWallet.balance,
      transaction: senderTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Request money from another user
exports.requestMoney = async (req, res) => {
  try {
    const { senderId, amount, message } = req.body;

    const request = new Transaction({
      user: senderId,
      type: 'request',
      amount,
      requester: req.user.id,
      status: 'pending',
      description: `Money request from user`,
      message
    });

    await request.save();

    // Emit socket event to sender
    req.app.get('io').to(`user_${senderId}`).emit('money_request', {
      requestId: request._id,
      requester: req.user.id,
      amount,
      message
    });

    res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Accept money request
exports.acceptMoneyRequest = async (req, res) => {
  try {
    const request = await Transaction.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this request'
      });
    }

    let senderWallet = await Wallet.findOne({ user: req.user.id });
    
    if (!senderWallet || senderWallet.balance < request.amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    let recipientWallet = await Wallet.findOne({ user: request.requester});
    
    if (!recipientWallet) {
      recipientWallet = new Wallet({
        user: request.requester,
        balance: 0,
        currency: 'USD'
      });
    }

    // Transfer funds
    senderWallet.balance -= request.amount;
    recipientWallet.balance += request.amount;

    await senderWallet.save();
    await recipientWallet.save();

    // Update request status
    request.status = 'completed';
    await request.save();

    // Create transaction records
    const senderTransaction = new Transaction({
      user: req.user.id,
      type: 'send',
      amount: request.amount,
      recipient: request.requester,
      status: 'completed',
      description: `Sent $${request.amount} (accepted request)`
    });

    const recipientTransaction = new Transaction({
      user: request.requester,
      type: 'receive',
      amount: request.amount,
      sender: req.user.id,
      status: 'completed',
      description: `Received $${request.amount} (request accepted)`
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.status(200).json({
      success: true,
      balance: senderWallet.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Reject money request
exports.rejectMoneyRequest = async (req, res) => {
  try {
    const request = await Transaction.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reject this request'
      });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get money requests
exports.getMoneyRequests = async (req, res) => {
  try {
    const requests = await Transaction.find({
      $or: [
        { user: req.user.id, type: 'request' },
        { requester: req.user.id, type: 'request' }
      ]
    })
    .populate('user', 'username avatar')
    .populate('requester', 'username avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, details } = req.body;

    const paymentMethod = new PaymentMethod({
      user: req.user.id,
      type,
      details,
      isDefault: false
    });

    await paymentMethod.save();

    res.status(201).json({
      success: true,
      paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove payment method
exports.removePaymentMethod = async (req, res) => {
  try {
    await PaymentMethod.findByIdAndDelete(req.params.methodId);

    res.status(200).json({
      success: true,
      message: 'Payment method removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await Subscription.find({ isActive: true });

    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Subscribe to plan
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;

    const plan = await Subscription.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    // Create subscription record
    const userSubscription = new UserSubscription({
      user: req.user.id,
      plan: planId,
      paymentMethod: paymentMethodId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000), // duration in days
      amount: plan.price
    });

    await userSubscription.save();

    res.status(201).json({
      success: true,
      subscription: userSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user.id,
      status: 'active'
    }).populate('plan');

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Purchase premium features
exports.purchaseFeature = async (req, res) => {
  try {
    const { item, quantity, paymentMethodId } = req.body;

    let wallet = await Wallet.findOne({ user: req.user.id });
    
    const prices = {
      super_likes: 2,
      boosts: 5,
      profile_visibility: 10
    };

    const totalCost = prices[item] * quantity;

    if (!wallet || wallet.balance < totalCost) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    wallet.balance -= totalCost;
    await wallet.save();

    // Update user's feature count
    const user = await User.findById(req.user.id);
    if (item === 'super_likes') {
      user.superLikes = (user.superLikes || 0) + quantity;
    } else if (item === 'boosts') {
      user.boosts = (user.boosts || 0) + quantity;
    } else if (item === 'profile_visibility') {
      user.profileVisibilityBoosts = (user.profileVisibilityBoosts || 0) + quantity;
    }
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'purchase',
      amount: totalCost,
      status: 'completed',
      description: `Purchased ${quantity} ${item}`
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get purchase history
exports.getPurchaseHistory = async (req, res) => {
  try {
    const purchases = await Transaction.find({
      user: req.user.id,
      type: 'purchase'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get earnings (for creators)
exports.getEarnings = async (req, res) => {
  try {
    const earnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          type: 'earnings'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          monthly: {
            $sum: {
              $cond: {
                if: { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                then: '$amount',
                else: 0
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      earnings: earnings[0] || { total: 0, monthly: 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Withdraw earnings
exports.withdrawEarnings = async (req, res) => {
  try {
    const { amount, accountType, accountDetails } = req.body;

    // Check available earnings
    const totalEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          type: 'earnings'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const availableEarnings = totalEarnings[0]?.total || 0;

    if (amount > availableEarnings) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient earnings'
      });
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'earnings_withdrawal',
      amount,
      status: 'pending',
      accountType,
      accountDetails,
      description: `Earnings withdrawal of $${amount}`
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get earnings report
exports.getEarningsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchCondition = {
      user: req.user.id,
      type: 'earnings'
    };

    if (startDate || endDate) {
      matchCondition.createdAt = {};
      if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
      if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
    }

    const earnings = await Transaction.find(matchCondition)
      .sort({ createdAt: -1 });

    const total = earnings.reduce((sum, earning) => sum + earning.amount, 0);

    res.status(200).json({
      success: true,
      earnings,
      total,
      count: earnings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
