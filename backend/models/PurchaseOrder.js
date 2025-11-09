// Purchase Order Model for AI Inventory System
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'PO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  productName: {
    type: String,
    required: true
  },

  supplier: {
    name: {
      type: String,
      required: true,
      default: 'Default Supplier'
    },
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

  orderQuantity: {
    type: Number,
    required: true,
    min: 1
  },

  unitCost: {
    type: Number,
    required: true,
    min: 0
  },

  totalCost: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'ordered', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // AI-generated data
  aiGenerated: {
    type: Boolean,
    default: false,
    index: true
  },

  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },

  reorderPoint: {
    type: Number,
    min: 0
  },

  currentStock: {
    type: Number,
    min: 0
  },

  safetyStock: {
    type: Number,
    min: 0
  },

  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Dates
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  expectedDelivery: {
    type: Date,
    index: true
  },

  actualDelivery: Date,

  approvedDate: Date,

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tracking information
  tracking: {
    trackingNumber: String,
    carrier: String,
    trackingUrl: String,
    lastUpdate: Date,
    status: String
  },

  // Financial information
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'check', 'net_terms'],
      default: 'net_terms'
    },
    terms: {
      type: String,
      default: 'Net 30'
    },
    dueDate: Date,
    paidDate: Date,
    paidAmount: Number
  },

  // Quality control
  qualityCheck: {
    required: {
      type: Boolean,
      default: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    passed: Boolean
  },

  // Notes and comments
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Attachments
  attachments: [{
    filename: String,
    url: String,
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'quality_report', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Performance metrics
  metrics: {
    leadTime: Number, // Actual lead time in days
    deliveryAccuracy: Number, // 0-1 score
    qualityScore: Number, // 0-1 score
    costVariance: Number, // Difference from expected cost
    supplierRating: Number // 1-5 rating
  },

  // Audit trail
  auditLog: [{
    action: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
purchaseOrderSchema.index({ productId: 1, status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ expectedDelivery: 1 });
purchaseOrderSchema.index({ aiGenerated: 1, status: 1 });
purchaseOrderSchema.index({ priority: 1, status: 1 });

// Virtual for days until delivery
purchaseOrderSchema.virtual('daysUntilDelivery').get(function() {
  if (!this.expectedDelivery) {return null;}
  const today = new Date();
  const delivery = new Date(this.expectedDelivery);
  const diffTime = delivery - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for order age
purchaseOrderSchema.virtual('orderAge').get(function() {
  const today = new Date();
  const orderDate = new Date(this.orderDate);
  const diffTime = today - orderDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
purchaseOrderSchema.virtual('isOverdue').get(function() {
  if (!this.expectedDelivery || this.status === 'delivered') {return false;}
  return new Date() > new Date(this.expectedDelivery);
});

// Pre-save middleware
purchaseOrderSchema.pre('save', function(next) {
  // Calculate total cost
  if (this.isModified('orderQuantity') || this.isModified('unitCost')) {
    this.totalCost = this.orderQuantity * this.unitCost;
  }

  // Set payment due date based on terms
  if (this.isModified('payment.terms') && this.payment.terms) {
    const daysMatch = this.payment.terms.match(/Net (\d+)/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      this.payment.dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  next();
});

// Instance methods
purchaseOrderSchema.methods.approve = function(userId) {
  this.status = 'approved';
  this.approvedDate = new Date();
  this.approvedBy = userId;

  this.auditLog.push({
    action: 'approved',
    user: userId,
    details: { previousStatus: this.status }
  });

  return this.save();
};

purchaseOrderSchema.methods.cancel = function(userId, reason) {
  this.status = 'cancelled';

  this.auditLog.push({
    action: 'cancelled',
    user: userId,
    details: { reason, previousStatus: this.status }
  });

  return this.save();
};

purchaseOrderSchema.methods.updateTracking = function(trackingInfo) {
  this.tracking = {
    ...this.tracking,
    ...trackingInfo,
    lastUpdate: new Date()
  };

  return this.save();
};

purchaseOrderSchema.methods.markDelivered = function(userId) {
  this.status = 'delivered';
  this.actualDelivery = new Date();

  // Calculate metrics
  if (this.expectedDelivery) {
    const expectedTime = new Date(this.expectedDelivery).getTime();
    const actualTime = this.actualDelivery.getTime();
    this.metrics.deliveryAccuracy = actualTime <= expectedTime ? 1 : 0.5;
  }

  if (this.orderDate) {
    const orderTime = new Date(this.orderDate).getTime();
    const deliveryTime = this.actualDelivery.getTime();
    this.metrics.leadTime = Math.ceil((deliveryTime - orderTime) / (1000 * 60 * 60 * 24));
  }

  this.auditLog.push({
    action: 'delivered',
    user: userId,
    details: { deliveryDate: this.actualDelivery }
  });

  return this.save();
};

// Static methods
purchaseOrderSchema.statics.getAIPendingOrders = function() {
  return this.find({
    aiGenerated: true,
    status: 'pending'
  }).populate('productId', 'name category price countInStock');
};

purchaseOrderSchema.statics.getOverdueOrders = function() {
  return this.find({
    expectedDelivery: { $lt: new Date() },
    status: { $nin: ['delivered', 'cancelled'] }
  }).populate('productId', 'name category');
};

purchaseOrderSchema.statics.getOrdersByPriority = function(priority) {
  return this.find({ priority })
    .sort({ orderDate: -1 })
    .populate('productId', 'name category price');
};

purchaseOrderSchema.statics.getSupplierPerformance = function(supplierName) {
  return this.aggregate([
    { $match: { 'supplier.name': supplierName, status: 'delivered' } },
    {
      $group: {
        _id: '$supplier.name',
        totalOrders: { $sum: 1 },
        avgLeadTime: { $avg: '$metrics.leadTime' },
        avgDeliveryAccuracy: { $avg: '$metrics.deliveryAccuracy' },
        avgQualityScore: { $avg: '$metrics.qualityScore' },
        totalValue: { $sum: '$totalCost' }
      }
    }
  ]);
};

purchaseOrderSchema.statics.getInventoryInsights = function() {
  return this.aggregate([
    {
      $match: {
        aiGenerated: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$urgency',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalCost' },
        avgConfidence: { $avg: '$confidence' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
