const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const inProd = process.env.NODE_ENV === 'production';
const { auth } = inProd ? require('../middleware/auth') : require('../middleware/authFallback');

// Check if MongoDB is available (fallback to mock data when not)
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose');
    const mongoConnected = mongoose.connection.readyState === 1; // 1 = connected
    const forceMock = process.env.ENABLE_MOCK_DATA === 'true' && process.env.NODE_ENV === 'development';
    return mongoConnected && !forceMock;
  } catch (error) {
    return false;
  }
};

// Mock coupons for development/testing when MongoDB is unavailable
const mockCoupons = [
  {
    _id: 'mock_coupon_welcome10',
    code: 'WELCOME10',
    title: 'Welcome Offer 10% OFF',
    description: 'Get 10% off on your first order',
    type: 'welcome',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 200,
    minOrderValue: 500,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 1,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: [],
    isActive: true,
    priority: 10,
  },
  {
    _id: 'mock_coupon_upi50',
    code: 'UPI50',
    title: 'UPI Flat ₹50 OFF',
    description: 'Flat ₹50 off on UPI payments',
    type: 'bank',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 300,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 3,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: ['upi'],
    isActive: true,
    priority: 8,
  },
  {
    _id: 'mock_coupon_loyalty100',
    code: 'LOYALTY100',
    title: 'Loyalty Flat ₹100 OFF',
    description: 'Flat ₹100 off for loyal customers',
    type: 'loyalty',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 800,
    validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: null,
    usageCount: 0,
    userUsageLimit: 2,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    userRestrictions: { newUsersOnly: false, premiumUsersOnly: false, specificUsers: [] },
    paymentMethods: [],
    isActive: true,
    priority: 9,
  },
];

// In-memory user usage tracker for mock mode (per-process)
const mockUserUsage = new Map(); // key: `${userId}:${code}`, value: count

// Get all active coupons
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    let coupons = [];
    if (isMongoAvailable()) {
      coupons = await Coupon.find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }]
      }).sort({ priority: -1, createdAt: -1 });
    } else {
      // Use mock data when MongoDB is not available
      coupons = mockCoupons.filter(c => {
        const validFrom = new Date(c.validFrom);
        const validUntil = new Date(c.validUntil);
        return c.isActive && validFrom <= now && validUntil >= now &&
               (c.usageLimit == null || c.usageCount < c.usageLimit);
      }).sort((a, b) => b.priority - a.priority);
    }

    res.json(coupons);
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate coupon
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, orderValue, products, paymentMethod } = req.body;
    const userId = req.user._id;

    const now = new Date();

    // Pick data source based on Mongo availability
    let coupon = null;
    if (isMongoAvailable()) {
      coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    } else {
      coupon = mockCoupons.find(c => c.isActive && c.code === code.toUpperCase());
    }

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid coupon code'
      });
    }

    // Normalize access to fields for mock objects
    const couponValidFrom = new Date(coupon.validFrom);
    const couponValidUntil = new Date(coupon.validUntil);
    const couponUsageLimit = coupon.usageLimit;
    const couponUsageCount = coupon.usageCount || 0;
    const couponMinOrderValue = coupon.minOrderValue || 0;
    const couponUserUsageLimit = coupon.userUsageLimit || 1;
    const couponPaymentMethods = coupon.paymentMethods || [];
    const couponDiscountType = coupon.discountType;
    const couponDiscountValue = coupon.discountValue;
    const couponMaxDiscount = coupon.maxDiscount;

    // Check validity period
    if (couponValidFrom > now || couponValidUntil < now) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon has expired or not yet valid'
      });
    }

    // Check usage limit
    if (couponUsageLimit && couponUsageCount >= couponUsageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check minimum order value
    if (orderValue < couponMinOrderValue) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value should be ₹${couponMinOrderValue}`
      });
    }

    // Check user usage limit
    let userUsage = 0;
    if (isMongoAvailable()) {
      userUsage = (coupon.usedBy || []).filter(usage => usage.user.toString() === userId.toString()).length;
    } else {
      const key = `${userId}:${coupon.code}`;
      userUsage = mockUserUsage.get(key) || 0;
    }

    if (userUsage >= couponUserUsageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'You have already used this coupon'
      });
    }

    // Check payment method restrictions
    if (couponPaymentMethods.length > 0 && paymentMethod) {
      if (!couponPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          valid: false,
          message: `This coupon is only valid for ${couponPaymentMethods.join(', ')} payments`
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponDiscountType === 'percentage') {
      discountAmount = (orderValue * couponDiscountValue) / 100;
      if (couponMaxDiscount) {
        discountAmount = Math.min(discountAmount, couponMaxDiscount);
      }
    } else {
      discountAmount = couponDiscountValue;
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    return res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountType: couponDiscountType,
        discountValue: couponDiscountValue
      },
      discountAmount,
      finalAmount: orderValue - discountAmount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply coupon (when order is placed)
router.post('/apply', auth, async (req, res) => {
  try {
    const { code, orderValue, discountApplied } = req.body;
    const userId = req.user._id;

    if (isMongoAvailable()) {
      const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      // Add usage record
      coupon.usedBy.push({
        user: userId,
        usedAt: new Date(),
        orderValue,
        discountApplied
      });

      // Increment usage count
      coupon.usageCount += 1;

      await coupon.save();
      return res.json({ message: 'Coupon applied successfully' });
    } else {
      // Mock mode: track usage in-memory
      const key = `${userId}:${code.toUpperCase()}`;
      const current = mockUserUsage.get(key) || 0;
      mockUserUsage.set(key, current + 1);
      return res.json({ message: 'Coupon applied successfully (mock)' });
    }
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's available coupons
router.get('/user/available', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    let coupons = [];
    if (isMongoAvailable()) {
      coupons = await Coupon.find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }]
      });
    } else {
      coupons = mockCoupons.filter(c => c.isActive && new Date(c.validFrom) <= now && new Date(c.validUntil) >= now);
    }

    // Filter coupons based on user restrictions and usage
    const availableCoupons = coupons.filter(coupon => {
      // Check user usage limit
      let userUsage = 0;
      if (isMongoAvailable()) {
        userUsage = (coupon.usedBy || []).filter(
          usage => usage.user.toString() === userId.toString()
        ).length;
      } else {
        const key = `${userId}:${coupon.code}`;
        userUsage = mockUserUsage.get(key) || 0;
      }

      if (userUsage >= (coupon.userUsageLimit || 1)) {
        return false;
      }

      // Check specific user restrictions
      if (coupon.userRestrictions && coupon.userRestrictions.specificUsers && coupon.userRestrictions.specificUsers.length > 0) {
        return coupon.userRestrictions.specificUsers.includes(userId);
      }

      return true;
    });

    res.json(availableCoupons);
  } catch (error) {
    console.error('Get user coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create coupon (admin)
router.post('/', auth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coupon (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get coupon analytics (admin)
router.get('/analytics/:id', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('usedBy.user', 'name email');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const analytics = {
      totalUsage: coupon.usageCount,
      totalDiscount: coupon.usedBy.reduce((sum, usage) => sum + usage.discountApplied, 0),
      totalOrderValue: coupon.usedBy.reduce((sum, usage) => sum + usage.orderValue, 0),
      averageOrderValue:
        coupon.usedBy.length > 0
          ? coupon.usedBy.reduce((sum, usage) => sum + usage.orderValue, 0) / coupon.usedBy.length
          : 0,
      usageByDay: {} // You can implement daily usage analytics
    };

    res.json({
      coupon,
      analytics
    });
  } catch (error) {
    console.error('Coupon analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
