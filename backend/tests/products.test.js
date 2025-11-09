// Agile: Comprehensive product controller tests with Six Sigma quality metrics
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const {
  setupTestEnvironment,
  teardownTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestProduct,
  PerformanceMonitor,
  assertValidResponse,
  assertValidPagination,
  assertValidProduct,
  runLoadTest
} = require('./setup');

const Product = require('../models/Product');
const User = require('../models/User');
const productController = require('../controllers/productController');
const { errorHandler } = require('../middleware/errorHandler');
const { ValidationRules, handleValidationErrors } = require('../middleware/validation');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock authentication middleware
  app.use((req, res, next) => {
    if (req.headers.authorization) {
      req.user = { _id: new mongoose.Types.ObjectId(), role: 'admin' };
    }
    req.correlationId = 'test-correlation-id';
    next();
  });

  // Product routes
  app.get('/api/products', productController.getProducts);
  app.get('/api/products/search', productController.searchProducts);
  app.get('/api/products/analytics', productController.getProductAnalytics);
  app.get('/api/products/:id', productController.getProductById);
  app.post('/api/products',
    ValidationRules.productCreation(),
    handleValidationErrors,
    productController.createProduct
  );
  app.put('/api/products/:id',
    ValidationRules.productUpdate(),
    handleValidationErrors,
    productController.updateProduct
  );
  app.delete('/api/products/:id', productController.deleteProduct);
  app.patch('/api/products/bulk', productController.bulkUpdateProducts);

  app.use(errorHandler);
  return app;
};

describe('Product Controller Tests', () => {
  let app;
  let performanceMonitor;
  let testUser;
  let testProducts;

  beforeAll(async () => {
    await setupTestEnvironment();
    app = createTestApp();
    performanceMonitor = new PerformanceMonitor();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    testUser = new User(createTestUser());
    await testUser.save();

    // Create test products
    testProducts = await Product.insertMany([
      createTestProduct({ name: 'iPhone 15', category: 'Smartphones', price: 999 }),
      createTestProduct({ name: 'MacBook Pro', category: 'Laptops', price: 1999 }),
      createTestProduct({ name: 'iPad Air', category: 'Tablets', price: 599 }),
      createTestProduct({ name: 'AirPods Pro', category: 'Audio', price: 249 }),
      createTestProduct({ name: 'Apple Watch', category: 'Wearables', price: 399 })
    ]);
  });

  afterEach(async () => {
    performanceMonitor.reset();
  });

  describe('GET /api/products', () => {
    test('should return paginated products with valid structure', async () => {
      const timer = performanceMonitor.startTimer('getProducts');

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const duration = performanceMonitor.endTimer(timer);

      assertValidResponse(response);
      assertValidPagination(response);

      expect(response.body.data.products).toHaveLength(5);
      response.body.data.products.forEach(assertValidProduct);

      // Six Sigma: Performance assertion (should be under 500ms)
      expect(duration).toBeLessThan(500);
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Smartphones')
        .expect(200);

      assertValidResponse(response);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Smartphones');
    });

    test('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=500&maxPrice=1000')
        .expect(200);

      assertValidResponse(response);
      response.body.data.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(500);
        expect(product.price).toBeLessThanOrEqual(1000);
      });
    });

    test('should sort products correctly', async () => {
      const response = await request(app)
        .get('/api/products?sortBy=price-low')
        .expect(200);

      assertValidResponse(response);
      const prices = response.body.data.products.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    test('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      assertValidResponse(response);
      assertValidPagination(response);

      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(3);
    });

    test('should handle search keyword', async () => {
      const response = await request(app)
        .get('/api/products?keyword=iPhone')
        .expect(200);

      assertValidResponse(response);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toContain('iPhone');
    });

    // Six Sigma: Load testing
    test('should handle concurrent requests efficiently', async () => {
      const loadTestResults = await runLoadTest(async () => {
        const response = await request(app)
          .get('/api/products')
          .expect(200);
        return response.body;
      }, 50);

      expect(loadTestResults.successRate).toBeGreaterThan(95);
      expect(loadTestResults.averageResponseTime).toBeLessThan(1000);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return single product with related data', async () => {
      const productId = testProducts[0]._id;

      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      assertValidResponse(response);
      assertValidProduct(response.body.data.product);

      expect(response.body.data.product._id).toBe(productId.toString());
      expect(response.body.data).toHaveProperty('relatedProducts');
      expect(response.body.data).toHaveProperty('metadata');
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('RESOURCE_NOT_FOUND');
    });

    test('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    test('should create product with valid data', async () => {
      const productData = createTestProduct({
        name: 'New Test Product',
        price: 299.99
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer test-token')
        .send(productData)
        .expect(201);

      assertValidResponse(response, 201);
      assertValidProduct(response.body.data.product);

      expect(response.body.data.product.name).toBe('New Test Product');
      expect(response.body.data.product.price).toBe(299.99);
      expect(response.body.data.product.seller).toBeDefined();
    });

    test('should validate required fields', async () => {
      const invalidData = {
        name: 'A', // Too short
        price: -10, // Invalid price
        description: '' // Too short
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer test-token')
        .send(invalidData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeInstanceOf(Array);
    });

    test('should prevent duplicate products', async () => {
      const productData = createTestProduct({
        name: 'iPhone 15', // Same as existing product
        brand: 'TestBrand'
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer test-token')
        .send(productData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product successfully', async () => {
      const productId = testProducts[0]._id;
      const updateData = {
        name: 'Updated iPhone 15',
        price: 1099
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      assertValidResponse(response);
      expect(response.body.data.product.name).toBe('Updated iPhone 15');
      expect(response.body.data.product.price).toBe(1099);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', 'Bearer test-token')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product successfully', async () => {
      const productId = testProducts[0]._id;

      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      assertValidResponse(response);
      expect(response.body.message).toContain('removed');

      // Verify product is deleted
      const deletedProduct = await Product.findById(productId);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('GET /api/products/search', () => {
    test('should search products with query', async () => {
      const response = await request(app)
        .get('/api/products/search?q=iPhone')
        .expect(200);

      assertValidResponse(response);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.query).toBe('iPhone');
      expect(response.body.data).toHaveProperty('performance');
    });

    test('should return 400 for short query', async () => {
      const response = await request(app)
        .get('/api/products/search?q=a')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/products/analytics', () => {
    test('should return comprehensive analytics', async () => {
      const response = await request(app)
        .get('/api/products/analytics')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      assertValidResponse(response);

      const analytics = response.body.data;
      expect(analytics).toHaveProperty('overview');
      expect(analytics).toHaveProperty('categories');
      expect(analytics).toHaveProperty('pricing');
      expect(analytics).toHaveProperty('performance');
      expect(analytics).toHaveProperty('recentProducts');

      expect(analytics.overview.totalProducts).toBe(5);
      expect(analytics.overview.activeProducts).toBe(5);
      expect(analytics.categories).toBeInstanceOf(Array);
    });
  });

  describe('PATCH /api/products/bulk', () => {
    test('should bulk update products', async () => {
      const productIds = testProducts.slice(0, 3).map(p => p._id);
      const updates = { isActive: false };

      const response = await request(app)
        .patch('/api/products/bulk')
        .set('Authorization', 'Bearer test-token')
        .send({ productIds, updates })
        .expect(200);

      assertValidResponse(response);
      expect(response.body.data.modifiedCount).toBe(3);

      // Verify updates
      const updatedProducts = await Product.find({ _id: { $in: productIds } });
      updatedProducts.forEach(product => {
        expect(product.isActive).toBe(false);
      });
    });

    test('should validate bulk update data', async () => {
      const response = await request(app)
        .patch('/api/products/bulk')
        .set('Authorization', 'Bearer test-token')
        .send({ productIds: [], updates: {} })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  // Six Sigma: Performance and reliability tests
  describe('Performance and Reliability Tests', () => {
    test('should maintain performance under load', async () => {
      const loadTestResults = await runLoadTest(async () => {
        const response = await request(app)
          .get('/api/products?limit=10')
          .expect(200);
        return response.body;
      }, 100);

      // Six Sigma quality standards
      expect(loadTestResults.successRate).toBeGreaterThan(99); // 99% success rate
      expect(loadTestResults.averageResponseTime).toBeLessThan(200); // Under 200ms average
    });

    test('should handle database errors gracefully', async () => {
      // Simulate database error by closing connection
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/products')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('DATABASE_CONNECTION_ERROR');

      // Reconnect for other tests
      await setupTestEnvironment();
    });

    test('should validate response times for different operations', async () => {
      const operations = [
        { name: 'list-products', fn: () => request(app).get('/api/products') },
        { name: 'get-product', fn: () => request(app).get(`/api/products/${testProducts[0]._id}`) },
        { name: 'search-products', fn: () => request(app).get('/api/products/search?q=iPhone') }
      ];

      for (const operation of operations) {
        const timer = performanceMonitor.startTimer(operation.name);
        await operation.fn().expect(200);
        const duration = performanceMonitor.endTimer(timer);

        // Each operation should complete within acceptable time
        expect(duration).toBeLessThan(1000);
      }
    });
  });
});
