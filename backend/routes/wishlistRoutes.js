const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { auth } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name price originalPrice images rating numReviews countInStock stockStatus category brand'
    });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      items: []
    });
  }

  // Check for price changes and stock status
  const itemsWithAlerts = wishlist.items.map(item => {
    const alerts = [];

    if (item.notifyOnPriceChange && item.product.price < item.priceWhenAdded) {
      alerts.push({
        type: 'price_drop',
        message: `Price dropped from $${item.priceWhenAdded} to $${item.product.price}`
      });
    }

    if (item.notifyOnStock && item.product.stockStatus === 'in-stock') {
      alerts.push({
        type: 'back_in_stock',
        message: 'Item is back in stock!'
      });
    }

    return {
      ...item.toObject(),
      alerts
    };
  });

  res.json({
    success: true,
    data: {
      ...wishlist.toObject(),
      items: itemsWithAlerts
    }
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/items
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, notifyOnPriceChange = false, notifyOnStock = false } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      items: []
    });
  }

  // Check if item already exists in wishlist
  const existingItemIndex = wishlist.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update existing item
    wishlist.items[existingItemIndex].notifyOnPriceChange = notifyOnPriceChange;
    wishlist.items[existingItemIndex].notifyOnStock = notifyOnStock;
  } else {
    // Add new item
    wishlist.items.push({
      product: productId,
      priceWhenAdded: product.price,
      notifyOnPriceChange,
      notifyOnStock
    });

    // Update product analytics
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'analytics.wishlistAdds': 1 }
    });
  }

  await wishlist.save();

  // Populate the wishlist before sending response
  await wishlist.populate({
    path: 'items.product',
    select: 'name price originalPrice images rating numReviews countInStock stockStatus'
  });

  res.json({
    success: true,
    message: 'Item added to wishlist',
    data: wishlist
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  const itemIndex = wishlist.items.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in wishlist');
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  res.json({
    success: true,
    message: 'Item removed from wishlist'
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.items = [];
  await wishlist.save();

  res.json({
    success: true,
    message: 'Wishlist cleared'
  });
});

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
const moveToCart = asyncHandler(async (req, res) => {
  const { quantity = 1 } = req.body;
  const Cart = require('../models/Cart');

  // Get wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  // Check if item exists in wishlist
  const itemIndex = wishlist.items.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in wishlist');
  }

  // Check product availability
  const product = await Product.findById(req.params.productId);
  if (!product || product.countInStock < quantity) {
    res.status(400);
    throw new Error('Product not available in requested quantity');
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Add to cart
  const existingCartItemIndex = cart.items.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (existingCartItemIndex > -1) {
    cart.items[existingCartItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: req.params.productId,
      quantity
    });
  }

  // Remove from wishlist
  wishlist.items.splice(itemIndex, 1);

  // Save both
  await Promise.all([cart.save(), wishlist.save()]);

  res.json({
    success: true,
    message: 'Item moved to cart successfully'
  });
});

// @desc    Update wishlist settings
// @route   PUT /api/wishlist/settings
// @access  Private
const updateWishlistSettings = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { name, description, isPublic },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    data: wishlist
  });
});

// Routes
router.route('/')
  .get(auth, getWishlist)
  .delete(auth, clearWishlist);

router.post('/items', auth, addToWishlist);
router.delete('/items/:productId', auth, removeFromWishlist);
router.post('/move-to-cart/:productId', auth, moveToCart);
router.put('/settings', auth, updateWishlistSettings);

module.exports = router;
