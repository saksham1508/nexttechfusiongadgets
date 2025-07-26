const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

// Get all active coupons
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    res.json(coupons);

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate coupon
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderValue, products, paymentMethod } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid coupon code' 
      });
    }

    const now = new Date();

    // Check validity period
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Coupon has expired or not yet valid' 
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Coupon usage limit exceeded' 
      });
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum order value should be ₹${coupon.minOrderValue}` 
      });
    }

    // Check user usage limit
    const userUsage = coupon.usedBy.filter(usage => 
      usage.user.toString() === userId.toString()
    ).length;

    if (userUsage >= coupon.userUsageLimit) {
      return res.status(400).json({ 
        valid: false, 
        message: 'You have already used this coupon' 
      });
    }

    // Check user restrictions
    if (coupon.userRestrictions.newUsersOnly) {
      // Check if user is new (you can implement this logic)
    }

    if (coupon.userRestrictions.specificUsers.length > 0) {
      if (!coupon.userRestrictions.specificUsers.includes(userId)) {
        return res.status(400).json({ 
          valid: false, 
          message: 'This coupon is not available for your account' 
        });
      }
    }

    // Check payment method restrictions
    if (coupon.paymentMethods.length > 0 && paymentMethod) {
      if (!coupon.paymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ 
          valid: false, 
          message: `This coupon is only valid for ${coupon.paymentMethods.join(', ')} payments` 
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    res.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
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
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderValue, discountApplied } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

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

    res.json({ message: 'Coupon applied successfully' });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's available coupons
router.get('/user/available', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
      ]
    });

    // Filter coupons based on user restrictions and usage
    const availableCoupons = coupons.filter(coupon => {
      // Check user usage limit
      const userUsage = coupon.usedBy.filter(usage => 
        usage.user.toString() === userId.toString()
      ).length;

      if (userUsage >= coupon.userUsageLimit) {
        return false;
      }

      // Check specific user restrictions
      if (coupon.userRestrictions.specificUsers.length > 0) {
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
router.post('/', protect, async (req, res) => {
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
router.put('/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
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
router.get('/analytics/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('usedBy.user', 'name email');
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const analytics = {
      totalUsage: coupon.usageCount,
      totalDiscount: coupon.usedBy.reduce((sum, usage) => sum + usage.discountApplied, 0),
      totalOrderValue: coupon.usedBy.reduce((sum, usage) => sum + usage.orderValue, 0),
      averageOrderValue: coupon.usedBy.length > 0 ? 
        coupon.usedBy.reduce((sum, usage) => sum + usage.orderValue, 0) / coupon.usedBy.length : 0,
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