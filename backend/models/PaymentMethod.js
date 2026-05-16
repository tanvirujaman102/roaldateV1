const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['card', 'bank', 'paypal']
  },
  details: {
    // For card payments
    last4: String,
    brand: String,
    expMonth: Number,
    expYear: Number,
    cardholderName: String,
    
    // For bank transfers
    accountNumber: String,
    routingNumber: String,
    bankName: String,
    accountHolderName: String,
    
    // For PayPal
    email: String,
    paypalId: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  stripePaymentMethodId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
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

paymentMethodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

paymentMethodSchema.index({ user: 1 });
paymentMethodSchema.index({ type: 1 });
paymentMethodSchema.index({ isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
