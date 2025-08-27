const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: String,
  // Vendor-managed per-item fulfillment status
  vendorStatus: {
    type: String,
    enum: ['packaging','dispatched','shipped','out_for_delivery','delivered'],
    default: 'packaging'
  },
  vendorStatusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  // Store payment method as a simple string (e.g., 'cod', 'razorpay', 'paypal', 'stripe', 'upi')
  paymentMethod: {
    type: String,
    required: true
  },
  // Provider is optional; default to 'cod' for offline
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'cod', 'googlepay', 'phonepe', 'upi'],
    default: 'cod'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'returned'],
    default: 'pending'
  },
  trackingNumber: String,
  // Enhanced order features
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  notes: String,
  customerNotes: String,
  adminNotes: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  returnWindow: {
    type: Number,
    default: 30 // days
  },
  isReturnable: {
    type: Boolean,
    default: true
  },
  isRefundable: {
    type: Boolean,
    default: true
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  shippingCarrier: String,
  shippingService: String,
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  giftMessage: String,
  isGift: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Index for better performance
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
