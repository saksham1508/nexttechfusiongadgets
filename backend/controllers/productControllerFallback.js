const asyncHandler = require('express-async-handler');

// Mock products database
let mockProducts = [
  {
    _id: 'product_1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced features',
    price: 99999,
    category: 'Smartphones',
    brand: 'Apple',
    countInStock: 25,
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'],
    seller: 'vendor_1',
    isActive: true,
    rating: 4.5,
    numReviews: 120,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'product_2',
    name: 'MacBook Air M2',
    description: 'Powerful laptop for professionals',
    price: 114900,
    category: 'Laptops',
    brand: 'Apple',
    countInStock: 12,
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300'],
    seller: 'vendor_2',
    isActive: true,
    rating: 4.8,
    numReviews: 85,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    _id: 'product_3',
    name: 'AirPods Pro',
    description: 'Premium wireless earbuds',
    price: 24900,
    category: 'Audio',
    brand: 'Apple',
    countInStock: 50,
    images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300'],
    seller: 'vendor_3',
    isActive: true,
    rating: 4.6,
    numReviews: 200,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  
  // Filter by seller if requested
  let filteredProducts = mockProducts.filter(p => p.isActive);
  
  if (req.query.seller) {
    filteredProducts = filteredProducts.filter(p => p.seller === req.query.seller);
  }
  
  // Apply keyword search
  if (req.query.keyword) {
    const keyword = req.query.keyword.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword)
    );
  }
  
  // Apply category filter
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  // Apply price range filter
  if (req.query.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(req.query.maxPrice));
  }
  
  // Sort products
  const sortBy = req.query.sortBy || 'newest';
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.numReviews - a.numReviews;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  const totalCount = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);
  
  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalProducts: totalCount,
        hasNextPage: skip + limit < totalCount,
        hasPrevPage: page > 1
      }
    },
    mockMode: true,
    timestamp: new Date().toISOString()
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'RESOURCE_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Increment view analytics in mock mode
  product.analytics = product.analytics || { views: 0, clicks: 0 };
  product.analytics.views = Number(product.analytics.views || 0) + 1;
  product.updatedAt = new Date();
  
  // Get related products (same category, different product)
  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p._id !== product._id && p.isActive)
    .slice(0, 4);
  
  res.json({
    success: true,
    data: {
      product: {
        ...product,
        isInStock: product.countInStock > 0,
        stockStatus: product.countInStock > 10 ? 'in-stock' : 
                    product.countInStock > 0 ? 'low-stock' : 'out-of-stock',
        averageRating: product.rating || 0,
        totalReviews: product.numReviews || 0
      },
      relatedProducts
    },
    mockMode: true,
    timestamp: new Date().toISOString()
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, category, brand, countInStock, images
  } = req.body;
  
  // Check for duplicate products
  const existingProduct = mockProducts.find(p => 
    p.name.toLowerCase() === name.toLowerCase() &&
    p.brand.toLowerCase() === brand.toLowerCase() &&
    p.seller === req.user._id
  );
  
  if (existingProduct) {
    return res.status(409).json({
      success: false,
      error: {
        type: 'DUPLICATE_RESOURCE',
        message: 'A product with this name and brand already exists in your catalog',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Support MRP (originalPrice), SKU and variants like Meesho-style catalogs
  const sellingPrice = Number(price);
  const mrp = req.body.originalPrice ? Number(req.body.originalPrice) : sellingPrice;
  const safeMrp = isNaN(mrp) || mrp < sellingPrice ? sellingPrice : mrp;
  const providedSku = (req.body.sku || '').trim();
  const autoSku = `${(brand || 'SKU').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const variants = Array.isArray(req.body.variants) ? req.body.variants : [];

  // Normalize sales channels/tags from request (supports tags, channels, or single channel)
  const rawChannels = Array.isArray(req.body.tags)
    ? req.body.tags
    : Array.isArray(req.body.channels)
    ? req.body.channels
    : (req.body.channel ? [req.body.channel] : []);
  const normalizedChannels = rawChannels
    .map((t) => String(t).toLowerCase().trim())
    .filter(Boolean);
  const productTags = normalizedChannels.length ? normalizedChannels : ['e-commerce'];

  const newProduct = {
    _id: `product_${Date.now()}`,
    name: name.trim(),
    description: description.trim(),
    price: sellingPrice,
    originalPrice: safeMrp,
    category: category.trim(),
    brand: brand.trim(),
    sku: providedSku || autoSku,
    countInStock: Number(countInStock) || 0,
    images: images || ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
    variants,
    tags: productTags,
    seller: req.user._id,
    isActive: true,
    rating: 0,
    numReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProducts.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Product created successfully (Mock Mode)',
    data: {
      product: newProduct
    },
    mockMode: true,
    timestamp: new Date().toISOString()
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
  const productIndex = mockProducts.findIndex(p => p._id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'RESOURCE_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  const product = mockProducts[productIndex];
  
  // Check if user owns this product or is admin
  if (product.seller !== req.user._id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        type: 'FORBIDDEN',
        message: 'Not authorized to update this product',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Update product
  // Enforce safe pricing and keep SKU if not provided
  const nextPrice = req.body.price != null ? Number(req.body.price) : product.price;
  const nextMrpRaw = req.body.originalPrice != null ? Number(req.body.originalPrice) : (product.originalPrice || nextPrice);
  const nextMrp = isNaN(nextMrpRaw) || nextMrpRaw < nextPrice ? nextPrice : nextMrpRaw;

  // Normalize and preserve channels/tags
  const rawChannels = Array.isArray(req.body.tags)
    ? req.body.tags
    : Array.isArray(req.body.channels)
    ? req.body.channels
    : (req.body.channel ? [req.body.channel] : product.tags || []);
  const normalizedChannels = rawChannels.map((t) => String(t).toLowerCase().trim()).filter(Boolean);

  const updatedProduct = {
    ...product,
    ...req.body,
    price: nextPrice,
    originalPrice: nextMrp,
    sku: (req.body.sku || product.sku || `${(product.brand || 'SKU').slice(0,3).toUpperCase()}-${product._id.slice(-6)}`).trim(),
    variants: Array.isArray(req.body.variants) ? req.body.variants : (product.variants || []),
    tags: normalizedChannels.length ? normalizedChannels : (product.tags || ['e-commerce']),
    _id: product._id, // Preserve ID
    seller: product.seller, // Preserve seller
    updatedAt: new Date()
  };
  
  mockProducts[productIndex] = updatedProduct;
  
  res.json({
    success: true,
    message: 'Product updated successfully (Mock Mode)',
    data: {
      product: updatedProduct
    },
    mockMode: true,
    timestamp: new Date().toISOString()
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
  const productIndex = mockProducts.findIndex(p => p._id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'RESOURCE_NOT_FOUND',
        message: 'Product not found',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  const product = mockProducts[productIndex];
  
  // Check if user owns this product or is admin
  if (product.seller !== req.user._id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        type: 'FORBIDDEN',
        message: 'Not authorized to delete this product',
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Remove product from array
  mockProducts.splice(productIndex, 1);
  
  res.json({
    success: true,
    message: 'Product deleted successfully (Mock Mode)',
    mockMode: true,
    timestamp: new Date().toISOString()
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  // Redirect to getProducts with search parameters
  req.query.keyword = req.query.q || req.query.keyword;
  return getProducts(req, res);
});

const getMockProducts = () => mockProducts;

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getMockProducts
};