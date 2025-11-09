const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer', 'damage', 'expired'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: String,
  reference: {
    type: String // Order ID, Purchase Order, etc.
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cost: Number,
  notes: String
}, {
  timestamps: true
});

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStock: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  maxStock: {
    type: Number,
    default: 1000
  },
  location: {
    warehouse: String,
    zone: String,
    aisle: String,
    shelf: String,
    bin: String
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming suppliers are users with 'supplier' role
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  averageCost: {
    type: Number,
    default: 0
  },
  lastPurchasePrice: Number,
  lastPurchaseDate: Date,
  lastSaleDate: Date,
  expiryDate: Date,
  batchNumber: String,
  serialNumbers: [String],
  isPerishable: {
    type: Boolean,
    default: false
  },
  isTracked: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  transactions: [inventoryTransactionSchema],
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'overstock', 'expiry_warning', 'expired']
    },
    message: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate available stock before saving
inventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);

  // Update status based on stock levels
  if (this.currentStock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.currentStock <= this.reorderLevel) {
    // Add low stock alert if not already present
    const hasLowStockAlert = this.alerts.some(alert =>
      alert.type === 'low_stock' && alert.isActive
    );
    if (!hasLowStockAlert) {
      this.alerts.push({
        type: 'low_stock',
        message: `Stock level is low (${this.currentStock} remaining)`,
        isActive: true
      });
    }
  }

  next();
});

// Methods for inventory operations
inventorySchema.methods.addStock = function(quantity, type = 'purchase', performedBy, reason, cost) {
  this.currentStock += quantity;
  this.transactions.push({
    type,
    quantity,
    reason,
    performedBy,
    cost
  });

  if (cost) {
    // Update average cost using weighted average
    const totalValue = (this.averageCost * (this.currentStock - quantity)) + (cost * quantity);
    this.averageCost = totalValue / this.currentStock;
  }

  return this.save();
};

inventorySchema.methods.removeStock = function(quantity, type = 'sale', performedBy, reason, reference) {
  if (quantity > this.availableStock) {
    throw new Error('Insufficient stock available');
  }

  this.currentStock -= quantity;
  this.transactions.push({
    type,
    quantity: -quantity,
    reason,
    reference,
    performedBy
  });

  return this.save();
};

inventorySchema.methods.reserveStock = function(quantity) {
  if (quantity > this.availableStock) {
    throw new Error('Insufficient stock available for reservation');
  }

  this.reservedStock += quantity;
  return this.save();
};

inventorySchema.methods.releaseReservedStock = function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  return this.save();
};

// Indexes for better performance
inventorySchema.index({ product: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ status: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
