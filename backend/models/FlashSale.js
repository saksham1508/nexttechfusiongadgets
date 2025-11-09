const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    originalPrice: {
      type: Number,
      required: true
    },
    salePrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      required: true
    },
    maxQuantity: {
      type: Number,
      default: 100
    },
    soldQuantity: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  },
  bannerImage: {
    type: String
  },
  terms: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for time-based queries
flashSaleSchema.index({ startTime: 1, endTime: 1 });
flashSaleSchema.index({ isActive: 1, priority: -1 });

module.exports = mongoose.model('FlashSale', flashSaleSchema);
