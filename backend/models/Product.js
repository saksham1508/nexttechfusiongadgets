const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryPath: [String], // For breadcrumb navigation
  brand: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    alt: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  warranty: {
    type: String,
    default: '1 year'
  },
  
  // AI Inventory Management fields
  autoReorder: {
    type: Boolean,
    default: false
  },
  
  minStock: {
    type: Number,
    default: 10
  },
  
  maxStock: {
    type: Number,
    default: 100
  },
  
  leadTime: {
    type: Number,
    default: 7 // days
  },
  
  supplier: {
    type: String,
    default: 'Default Supplier'
  },
  
  lastReorderDate: Date,
  
  reorderCount: {
    type: Number,
    default: 0
  },
  
  demandForecast: {
    accuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    lastUpdated: Date,
    nextReorderDate: Date
  },
  // Enhanced ecommerce features
  sku: {
    type: String,
    unique: true,
    required: true
  },
  barcode: String,
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'm'],
      default: 'cm'
    }
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'fragile', 'heavy'],
    default: 'standard'
  },
  taxClass: {
    type: String,
    enum: ['standard', 'reduced', 'zero', 'exempt'],
    default: 'standard'
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  variants: [{
    name: String, // e.g., "Color", "Size"
    value: String, // e.g., "Red", "Large"
    price: Number,
    stock: Number,
    sku: String,
    image: String
  }],
  digitalProduct: {
    isDigital: {
      type: Boolean,
      default: false
    },
    downloadUrl: String,
    downloadLimit: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    downloadExpiry: {
      type: Number,
      default: 30 // days
    }
  },
  subscription: {
    isSubscription: {
      type: Boolean,
      default: false
    },
    interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    intervalCount: {
      type: Number,
      default: 1
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    wishlistAdds: {
      type: Number,
      default: 0
    },
    cartAdds: {
      type: Number,
      default: 0
    }
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  stockStatus: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
    default: 'in-stock'
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sku: 1 });
productSchema.index({ stockStatus: 1 });

// Pre-save middleware to update stock status
productSchema.pre('save', function(next) {
  if (this.countInStock <= 0) {
    this.stockStatus = 'out-of-stock';
  } else if (this.countInStock <= this.lowStockThreshold) {
    this.stockStatus = 'low-stock';
  } else {
    this.stockStatus = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
