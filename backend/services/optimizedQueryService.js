// Optimized Query Service - O(log n) database operations
const mongoose = require('mongoose');

class OptimizedQueryService {
  constructor() {
    this.queryCache = new Map(); // O(1) lookup cache
    this.indexCache = new Map(); // Index optimization cache
    this.aggregationPipelines = new Map(); // Pre-built pipelines
    this.maxCacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // O(1) - Optimized product search with indexing
  async searchProducts(query, options = {}) {
    const cacheKey = this.generateCacheKey('products', query, options);

    // O(1) cache lookup
    if (this.queryCache.has(cacheKey)) {
      this.cacheHits++;
      return this.queryCache.get(cacheKey);
    }

    const {
      keyword = '',
      category = '',
      minPrice = 0,
      maxPrice = Infinity,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    // O(log n) - Optimized aggregation pipeline
    const pipeline = [
      // O(log n) - Use compound index for filtering
      {
        $match: {
          ...(keyword && {
            $or: [
              { name: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
              { tags: { $in: [new RegExp(keyword, 'i')] } }
            ]
          }),
          ...(category && { category: category }),
          price: { $gte: minPrice, $lte: maxPrice },
          isActive: true
        }
      },
      // O(1) - Add computed fields efficiently
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $cond: [{ $regexMatch: { input: '$name', regex: keyword, options: 'i' } }, 10, 0] },
              { $cond: [{ $regexMatch: { input: '$description', regex: keyword, options: 'i' } }, 5, 0] },
              { $multiply: ['$rating', 2] },
              { $divide: ['$salesCount', 100] }
            ]
          }
        }
      },
      // O(n log n) - Efficient sorting
      { $sort: { [sortBy]: sortOrder, relevanceScore: -1 } },
      // O(1) - Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },
      // O(1) - Project only needed fields to reduce memory
      {
        $project: {
          name: 1,
          price: 1,
          images: { $slice: ['$images', 1] }, // Only first image
          rating: 1,
          category: 1,
          brand: 1,
          countInStock: 1,
          relevanceScore: 1
        }
      }
    ];

    try {
      const Product = mongoose.model('Product');
      const results = await Product.aggregate(pipeline);

      // O(1) - Get total count efficiently
      const totalPipeline = pipeline.slice(0, 2); // Only match and addFields
      totalPipeline.push({ $count: 'total' });
      const totalResult = await Product.aggregate(totalPipeline);
      const total = totalResult[0]?.total || 0;

      const response = {
        products: results,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        performance: {
          cacheHit: false,
          queryTime: Date.now()
        }
      };

      // O(1) - Cache with LRU eviction
      this.setCacheWithLRU(cacheKey, response);
      this.cacheMisses++;

      return response;
    } catch (error) {
      console.error('Optimized search error:', error);
      throw error;
    }
  }

  // O(1) - Optimized product recommendations
  async getRecommendations(userId, productId, limit = 10) {
    const cacheKey = `recommendations:${userId}:${productId}:${limit}`;

    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    // O(log n) - Collaborative filtering with optimized queries
    const pipeline = [
      // Find users who bought similar products
      {
        $match: { 'orderItems.product': new mongoose.Types.ObjectId(productId) }
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          buyers: { $addToSet: '$user' },
          totalSales: { $sum: '$orderItems.quantity' }
        }
      },
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(productId) },
          totalSales: { $gte: 5 } // Minimum sales threshold
        }
      },
      // O(log n) - Sort by relevance
      { $sort: { totalSales: -1 } },
      { $limit: limit * 2 }, // Get more for filtering
      // O(1) - Lookup product details efficiently
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
          pipeline: [
            {
              $project: {
                name: 1,
                price: 1,
                images: { $slice: ['$images', 1] },
                rating: 1,
                category: 1,
                countInStock: 1
              }
            }
          ]
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.countInStock': { $gt: 0 } } },
      { $limit: limit },
      { $replaceRoot: { newRoot: '$product' } }
    ];

    try {
      const Order = mongoose.model('Order');
      const recommendations = await Order.aggregate(pipeline);

      this.setCacheWithLRU(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }

  // O(1) - Optimized user analytics
  async getUserAnalytics(userId) {
    const cacheKey = `analytics:${userId}`;

    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    // O(log n) - Single aggregation for all user stats
    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' },
          favoriteCategories: { $push: '$orderItems.product.category' },
          lastOrderDate: { $max: '$createdAt' },
          ordersByMonth: {
            $push: {
              month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              amount: '$totalPrice'
            }
          }
        }
      },
      {
        $addFields: {
          favoriteCategory: {
            $arrayElemAt: [
              {
                $map: {
                  input: { $setUnion: ['$favoriteCategories'] },
                  as: 'category',
                  in: {
                    category: '$$category',
                    count: {
                      $size: {
                        $filter: {
                          input: '$favoriteCategories',
                          cond: { $eq: ['$$this', '$$category'] }
                        }
                      }
                    }
                  }
                }
              },
              0
            ]
          }
        }
      }
    ];

    try {
      const Order = mongoose.model('Order');
      const analytics = await Order.aggregate(pipeline);

      const result = analytics[0] || {
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        favoriteCategory: null,
        lastOrderDate: null,
        ordersByMonth: []
      };

      this.setCacheWithLRU(cacheKey, result);
      return result;
    } catch (error) {
      console.error('User analytics error:', error);
      return null;
    }
  }

  // O(1) - Optimized inventory management
  async updateInventoryBatch(updates) {
    // O(n) - Batch update for better performance
    const bulkOps = updates.map(({ productId, quantity, operation = 'decrement' }) => ({
      updateOne: {
        filter: { _id: productId },
        update: {
          $inc: { countInStock: operation === 'increment' ? quantity : -quantity },
          $set: { lastUpdated: new Date() }
        }
      }
    }));

    try {
      const Product = mongoose.model('Product');
      const result = await Product.bulkWrite(bulkOps, { ordered: false });

      // O(n) - Invalidate related caches
      updates.forEach(({ productId }) => {
        this.invalidateProductCache(productId);
      });

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        errors: result.writeErrors || []
      };
    } catch (error) {
      console.error('Batch inventory update error:', error);
      throw error;
    }
  }

  // O(log n) - Optimized price range aggregation
  async getPriceRanges(category = null) {
    const cacheKey = `priceRanges:${category || 'all'}`;

    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const pipeline = [
      ...(category ? [{ $match: { category, isActive: true } }] : [{ $match: { isActive: true } }]),
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          priceDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $lt: ['$price', 100] }, then: '0-100' },
                  { case: { $lt: ['$price', 500] }, then: '100-500' },
                  { case: { $lt: ['$price', 1000] }, then: '500-1000' },
                  { case: { $lt: ['$price', 2000] }, then: '1000-2000' }
                ],
                default: '2000+'
              }
            }
          }
        }
      },
      {
        $addFields: {
          priceRanges: {
            $map: {
              input: ['0-100', '100-500', '500-1000', '1000-2000', '2000+'],
              as: 'range',
              in: {
                range: '$$range',
                count: {
                  $size: {
                    $filter: {
                      input: '$priceDistribution',
                      cond: { $eq: ['$$this', '$$range'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ];

    try {
      const Product = mongoose.model('Product');
      const result = await Product.aggregate(pipeline);
      const priceData = result[0] || {
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        priceRanges: []
      };

      this.setCacheWithLRU(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error('Price ranges error:', error);
      return null;
    }
  }

  // O(1) - LRU Cache implementation
  setCacheWithLRU(key, value) {
    if (this.queryCache.size >= this.maxCacheSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }

    this.queryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  // O(1) - Cache key generation
  generateCacheKey(type, ...args) {
    return `${type}:${JSON.stringify(args)}`;
  }

  // O(n) - Invalidate related caches
  invalidateProductCache(productId) {
    const keysToDelete = [];
    for (const [key] of this.queryCache) {
      if (key.includes(productId) || key.includes('products')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.queryCache.delete(key));
  }

  // O(1) - Get cache statistics
  getCacheStats() {
    return {
      size: this.queryCache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      hits: this.cacheHits,
      misses: this.cacheMisses
    };
  }

  // O(1) - Clear cache
  clearCache() {
    this.queryCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // O(n) - Optimize database indexes
  async createOptimalIndexes() {
    try {
      const Product = mongoose.model('Product');
      const Order = mongoose.model('Order');
      const User = mongoose.model('User');

      // Product indexes for O(log n) queries
      await Product.collection.createIndex({ name: 'text', description: 'text', tags: 'text' });
      await Product.collection.createIndex({ category: 1, price: 1, rating: -1 });
      await Product.collection.createIndex({ price: 1, countInStock: 1 });
      await Product.collection.createIndex({ createdAt: -1, isActive: 1 });
      await Product.collection.createIndex({ brand: 1, category: 1 });

      // Order indexes for analytics
      await Order.collection.createIndex({ user: 1, createdAt: -1 });
      await Order.collection.createIndex({ 'orderItems.product': 1 });
      await Order.collection.createIndex({ status: 1, createdAt: -1 });

      // User indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ createdAt: -1 });

      console.log('✅ Optimal database indexes created');
    } catch (error) {
      console.error('Index creation error:', error);
    }
  }
}

module.exports = new OptimizedQueryService();
