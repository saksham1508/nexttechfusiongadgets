const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['card', 'bank_account', 'digital_wallet', 'upi', 'crypto'],
    required: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'googlepay', 'phonepe', 'paytm', 'upi', 'square', 'bitcoin', 'ethereum'],
    required: true
  },
  // Card details (encrypted/tokenized)
  card: {
    last4: String,
    brand: String, // visa, mastercard, amex, etc.
    expMonth: Number,
    expYear: Number,
    fingerprint: String,
    funding: String, // credit, debit, prepaid
    country: String
  },
  // Bank account details (encrypted/tokenized)
  bankAccount: {
    last4: String,
    bankName: String,
    accountType: String, // checking, savings
    routingNumber: String
  },
  // Digital wallet details
  digitalWallet: {
    email: String,
    walletType: String // paypal, apple_pay, google_pay, etc.
  },
  // UPI details
  upi: {
    vpa: String, // Virtual Payment Address (e.g., user@paytm)
    name: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  // Crypto wallet details
  cryptoWallet: {
    address: String,
    currency: String // bitcoin, ethereum, etc.
  },
  // Provider-specific data
  providerData: {
    customerId: String,
    paymentMethodId: String,
    setupIntentId: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  nickname: String, // User-friendly name like "My Visa Card"
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Security and analytics
  lastUsed: {
    type: Date,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'expired'],
    default: 'pending'
  },
  verifiedAt: Date,
  expiresAt: Date,

  // Fraud detection
  fraudFlags: [{
    type: String,
    reason: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Compliance
  pciCompliant: {
    type: Boolean,
    default: true
  },

  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Methods for analytics and security
paymentMethodSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

paymentMethodSchema.methods.recordFailure = function() {
  this.failureCount += 1;
  this.riskScore = Math.min(this.riskScore + 10, 100);
  return this.save();
};

paymentMethodSchema.methods.addFraudFlag = function(type, reason, severity = 'medium') {
  this.fraudFlags.push({ type, reason, severity });
  this.riskScore = Math.min(this.riskScore + (severity === 'high' ? 30 : severity === 'medium' ? 20 : 10), 100);
  return this.save();
};

paymentMethodSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

paymentMethodSchema.methods.needsVerification = function() {
  return this.verificationStatus === 'pending' || this.verificationStatus === 'expired';
};

// Static methods for analytics
paymentMethodSchema.statics.getUsageStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: '$provider',
        count: { $sum: 1 },
        totalUsage: { $sum: '$usageCount' },
        avgRiskScore: { $avg: '$riskScore' },
        lastUsed: { $max: '$lastUsed' }
      }
    }
  ]);
};

// Index for better performance
paymentMethodSchema.index({ user: 1 });
paymentMethodSchema.index({ user: 1, isDefault: 1 });
paymentMethodSchema.index({ user: 1, provider: 1 });
paymentMethodSchema.index({ verificationStatus: 1 });
paymentMethodSchema.index({ riskScore: 1 });
paymentMethodSchema.index({ lastUsed: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
