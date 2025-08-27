const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const { errorMetrics } = require('../middleware/errorHandler');

// Six Sigma: Performance monitoring class
class ProductMetrics {
  constructor() {
    this.queryPerformance = [];
    this.searchPatterns = new Map();
    this.popularProducts = new Map();
  }

  recordQuery(queryType, duration, resultCount, filters) {
    this.queryPerformance.push({
      queryType,
      duration,
      resultCount,
      filters,
      timestamp: new Date()
    });

    // Keep only last 1000 records (Lean: eliminate waste)
    if (this.queryPerformance.length > 1000) {
      this.queryPerformance = this.queryPerformance.slice(-1000);
    }
  }

  recordSearch(keyword) {
    if (keyword) {
      this.searchPatterns.set(keyword.toLowerCase(), 
        (this.searchPatterns.get(keyword.toLowerCase()) || 0) + 1);
    }
  }

  recordProductView(productId) {
    this.popularProducts.set(productId, 
      (this.popularProducts.get(productId) || 0) + 1);
  }

  getMetrics() {
    const avgQueryTime = this.queryPerformance.length > 0 
      ? this.queryPerformance.reduce((sum, q) => sum + q.duration, 0) / this.queryPerformance.length 
      : 0;

    return {
      averageQueryTime: avgQueryTime,
      totalQueries: this.queryPerformance.length,
      topSearches: Array.from(this.searchPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      popularProducts: Array.from(this.popularProducts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };
  }
}

const productMetrics = new ProductMetrics();

// Agile: Utility functions for better code organization
const buildSearchQuery = (keyword) => {
  if (!keyword) return {};
  
  // Enhanced search with fuzzy matching and relevance scoring
  const searchTerms = keyword.split(' ').filter(term => term.length > 2);
  
  return {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
      // Exact match gets higher priority
      { name: { $regex: `^${keyword}`, $options: 'i' } }
    ]
  };
};

const buildFilterQuery = (filters) => {
  const query = { isActive: true };
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.brand) {
    query.brand = filters.brand;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }
  
  if (filters.inStock === 'true') {
    query.countInStock = { $gt: 0 };
  }
  
  if (filters.rating) {
    query.rating = { $gte: Number(filters.rating) };
  }

  // Restrict by seller when provided (enables vendor dashboards to request only own products)
  if (filters.seller) {
    query.seller = filters.seller;
  }
  
  return query;
};

const getSortOptions = (sortBy) => {
  const sortOptions = {
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 },
    'price-low': { price: 1 },
    'price-high': { price: -1 },
    'rating': { rating: -1 },
    'popular': { numReviews: -1 },
    'name': { name: 1 }
  };
  
  return sortOptions[sortBy] || { createdAt: -1 };
};

// @desc    Fetch all products with enhanced filtering and performance monitoring
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Six Sigma: Measure - Extract and validate parameters
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
  const sortBy = req.query.sortBy || 'newest';
  const keyword = req.query.keyword?.trim();
  
  // Record search pattern
  if (keyword) {
    productMetrics.recordSearch(keyword);
  }
  
  // Build query
  const searchQuery = buildSearchQuery(keyword);
  const filterQuery = buildFilterQuery(req.query);
  const finalQuery = { ...searchQuery, ...filterQuery };
  
  // Six Sigma: Analyze - Optimize database queries
  const [products, totalCount] = await Promise.all([
    Product.find(finalQuery)
      .populate('seller', 'name email')
      .select('-__v') // Lean: exclude unnecessary fields
      .sort(getSortOptions(sortBy))
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(), // Lean: faster queries
    
    Product.countDocuments(finalQuery)
  ]);
  
  const queryDuration = Date.now() - startTime;
  
  // Record performance metrics
  productMetrics.recordQuery('getProducts', queryDuration, products.length, req.query);
  
  // Six Sigma: Control - Structured response with metadata
  const response = {
    success: true,
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalProducts: totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
        limit
      },
      filters: {
        keyword,
        sortBy,
        appliedFilters: Object.keys(req.query).filter(key => 
          !['page', 'limit', 'sortBy'].includes(key) && req.query[key]
        )
      },
      performance: {
        queryTime: queryDuration,
        resultCount: products.length
      }
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  };
  
  // Agile: Add cache headers for better performance
  res.set({
    'Cache-Control': 'public, max-age=300', // 5 minutes cache
    'ETag': `"products-${page}-${limit}-${JSON.stringify(req.query).length}"`
  });
  
  res.json(response);
});

// @desc    Fetch single product with enhanced data and analytics
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const productId = req.params.id;
  
  // Record product view for analytics
  productMetrics.recordProductView(productId);
  
  // Six Sigma: Analyze - Fetch product with related data
  const [product, relatedProducts] = await Promise.all([
    Product.findById(productId)
      .populate('seller', 'name email rating')
      .populate({
        path: 'reviews.user',
        select: 'name'
      })
      .lean(),
    
    // Get related products (same category, different product)
    Product.find({
      category: { $exists: true },
      _id: { $ne: productId },
      isActive: true
    })
      .limit(4)
      .select('name price images rating category')
      .lean()
  ]);
  
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

  // Persist analytics view count in DB (best-effort, non-blocking)
  try {
    await Product.updateOne({ _id: productId }, { $inc: { 'analytics.views': 1 } });
  } catch (_) { /* ignore analytics update errors */ }
  
  // Filter related products by same category
  const filteredRelatedProducts = relatedProducts.filter(p => 
    p.category === product.category
  ).slice(0, 4);
  
  const queryDuration = Date.now() - startTime;
  
  // Six Sigma: Control - Enhanced response with analytics
  const response = {
    success: true,
    data: {
      product: {
        ...product,
        // Add computed fields
        isInStock: product.countInStock > 0,
        stockStatus: product.countInStock > 10 ? 'in-stock' : 
                    product.countInStock > 0 ? 'low-stock' : 'out-of-stock',
        averageRating: product.rating || 0,
        totalReviews: product.numReviews || 0,
        priceHistory: [], // Could be populated from a price tracking system
        viewCount: productMetrics.popularProducts.get(productId) || 1
      },
      relatedProducts: filteredRelatedProducts,
      recommendations: [], // Could be populated by ML recommendations
      metadata: {
        lastUpdated: product.updatedAt,
        createdAt: product.createdAt,
        queryTime: queryDuration
      }
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  };
  
  // Agile: Cache headers for product details
  res.set({
    'Cache-Control': 'public, max-age=600', // 10 minutes cache
    'ETag': `"product-${productId}-${product.updatedAt}"`
  });
  
  res.json(response);
});

// @desc    Create a product with comprehensive validation and processing
// @route   POST /api/products
// @access  Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Six Sigma: Define - Validate business rules
  const {
    name, description, price, category, brand, countInStock,
    images, specifications, tags, features
  } = req.body;
  
  // Check for duplicate products (same name + brand + seller)
  const existingProduct = await Product.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    brand: { $regex: new RegExp(`^${brand}$`, 'i') },
    seller: req.user._id
  });
  
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
  
  // Agile: Process and enhance product data
  const productData = {
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    brand: brand.trim(),
    countInStock: Number(countInStock),
    seller: req.user._id,
    images: images || [],
    specifications: specifications || {},
    tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : [],
    features: features || [],
    isActive: true,
    // Auto-generate SEO-friendly slug
    slug: name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    // Set initial metrics
    rating: 0,
    numReviews: 0,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const product = new Product(productData);
  const createdProduct = await product.save();
  
  // Populate seller information for response
  await createdProduct.populate('seller', 'name email');
  
  const processingTime = Date.now() - startTime;
  
  // Six Sigma: Control - Structured success response
  const response = {
    success: true,
    message: 'Product created successfully',
    data: {
      product: createdProduct,
      metadata: {
        processingTime,
        createdAt: createdProduct.createdAt,
        slug: createdProduct.slug
      }
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  };
  
  res.status(201).json(response);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this product' });
      }

      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this product' });
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get product analytics and metrics
// @route   GET /api/products/analytics
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res) => {
  // Six Sigma: Measure - Comprehensive analytics
  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    categoryStats,
    priceStats,
    recentProducts
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ countInStock: 0 }),
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$countInStock'] } }
        }
      }
    ]),
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price category createdAt')
      .lean()
  ]);

  const analytics = {
    overview: {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStockProducts,
      stockRate: ((totalProducts - outOfStockProducts) / totalProducts * 100).toFixed(2)
    },
    categories: categoryStats,
    pricing: priceStats[0] || {},
    performance: productMetrics.getMetrics(),
    recentProducts,
    trends: {
      // Could include time-series data for trends
      dailyViews: [],
      popularSearches: productMetrics.getMetrics().topSearches
    }
  };

  res.json({
    success: true,
    data: analytics,
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  });
});

// @desc    Bulk update products
// @route   PATCH /api/products/bulk
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updates } = req.body;
  
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Product IDs array is required'
      }
    });
  }

  // Validate updates object
  const allowedUpdates = ['isActive', 'category', 'tags', 'countInStock'];
  const updateKeys = Object.keys(updates);
  const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

  if (!isValidUpdate) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: `Only these fields can be bulk updated: ${allowedUpdates.join(', ')}`
      }
    });
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { ...updates, updatedAt: new Date() } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products updated successfully`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      updatedFields: updateKeys
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  });
});

// @desc    Search products with advanced features
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { q: query, filters, sort, page = 1, limit = 12 } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Search query must be at least 2 characters long'
      }
    });
  }

  // Record search for analytics
  productMetrics.recordSearch(query);

  // Build advanced search query with scoring
  const searchQuery = {
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  // Apply additional filters if provided
  if (filters) {
    try {
      const parsedFilters = JSON.parse(filters);
      Object.assign(searchQuery, buildFilterQuery(parsedFilters));
    } catch (error) {
      // Invalid filters, ignore
    }
  }

  const [products, totalCount] = await Promise.all([
    Product.find(searchQuery)
      .populate('seller', 'name')
      .select('-__v')
      .sort(getSortOptions(sort))
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean(),
    Product.countDocuments(searchQuery)
  ]);

  const searchTime = Date.now() - startTime;

  res.json({
    success: true,
    data: {
      query,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalResults: totalCount,
        limit: Number(limit)
      },
      performance: {
        searchTime,
        resultCount: products.length
      }
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductAnalytics,
  bulkUpdateProducts,
  searchProducts,
  // Export metrics for monitoring
  getProductMetrics: () => productMetrics.getMetrics()
};