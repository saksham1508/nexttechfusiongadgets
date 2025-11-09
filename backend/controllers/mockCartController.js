// Mock Cart Controller for development without MongoDB
const mockProducts = require('../data/mockProducts');

// In-memory cart storage (for development only)
let mockCarts = new Map();

// Mock product data for cart operations
const getMockProduct = (productId) => {
  // Try to find in mock products first
  let product = mockProducts.find(p => p._id === productId || p.id === productId);

  if (!product) {
    // Create a mock product if not found
    product = {
      _id: productId,
      id: productId,
      name: `Mock Product ${productId}`,
      price: 99.99,
      images: [{ url: '/placeholder-image.jpg', alt: 'Mock Product' }],
      stock: 10,
      category: 'Electronics',
      brand: 'Mock Brand'
    };
  }

  return product;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const cart = mockCarts.get(userId) || { items: [], totalAmount: 0 };

    // Populate product details
    const populatedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        product: getMockProduct(item.product)
      }))
    };

    res.json(populatedCart);
  } catch (error) {
    console.error('Mock cart get error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    console.log('🛒 Add to cart request:', { body: req.body, user: req.user });

    const { productId, quantity } = req.body;
    const userId = req.user._id || req.user.id;

    if (!req.user) {
      console.error('❌ No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!productId || !quantity) {
      console.error('❌ Missing productId or quantity:', { productId, quantity });
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const product = getMockProduct(productId);

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = mockCarts.get(userId) || { items: [], totalAmount: 0 };

    const existingItemIndex = cart.items.findIndex(
      item => item.product === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      const itemProduct = getMockProduct(item.product);
      return total + (itemProduct.price * item.quantity);
    }, 0);

    mockCarts.set(userId, cart);

    // Return populated cart
    const populatedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        product: getMockProduct(item.product)
      }))
    };

    console.log('✅ Cart updated successfully:', populatedCart);
    res.json(populatedCart);
  } catch (error) {
    console.error('❌ Mock cart add error:', error);
    res.status(500).json({ message: `Failed to add item to cart: ${error.message}` });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id || req.user.id;

    const cart = mockCarts.get(userId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      const itemProduct = getMockProduct(item.product);
      return total + (itemProduct.price * item.quantity);
    }, 0);

    mockCarts.set(userId, cart);

    // Return populated cart
    const populatedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        product: getMockProduct(item.product)
      }))
    };

    res.json(populatedCart);
  } catch (error) {
    console.error('Mock cart update error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const cart = mockCarts.get(userId);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product !== req.params.productId
    );

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      const itemProduct = getMockProduct(item.product);
      return total + (itemProduct.price * item.quantity);
    }, 0);

    mockCarts.set(userId, cart);

    // Return populated cart
    const populatedCart = {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        product: getMockProduct(item.product)
      }))
    };

    res.json(populatedCart);
  } catch (error) {
    console.error('Mock cart remove error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    mockCarts.set(userId, { items: [], totalAmount: 0 });
    res.json({ message: 'Cart cleared', items: [], totalAmount: 0 });
  } catch (error) {
    console.error('Mock cart clear error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
