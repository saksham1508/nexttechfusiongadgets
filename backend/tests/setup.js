// Agile: Comprehensive test setup with Six Sigma quality principles
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Six Sigma: Define - Test environment setup
const setupTestEnvironment = async () => {
  // Create in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('✅ Test database connected');
};

// Clean up test environment
const teardownTestEnvironment = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log('🧹 Test database cleaned up');
};

// Clear all collections between tests
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Test data factories for consistent test data
const createTestUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  role: 'customer', // align with User.role enum ['customer','seller','admin']
  isVerified: true,
  ...overrides
});

const createTestProduct = (overrides = {}) => {
  // Base defaults
  const base = {
    name: 'Test Product',
    description: 'This is a test product description',
    price: 99.99,
    category: new mongoose.Types.ObjectId(), // default ObjectId
    brand: 'TestBrand',
    stock: 10,
    countInStock: 10,
    isActive: true,
    images: [{ url: 'test-image.jpg', alt: 'Test Image' }],
    seller: new mongoose.Types.ObjectId(),
    sku: `SKU-${Date.now()}-${Math.floor(Math.random()*100000)}`,
    specifications: {
      color: 'Black',
      weight: '1kg'
    },
    tags: ['test', 'electronics']
  };

  // Merge overrides first
  const data = { ...base, ...overrides };

  // Normalize fields to satisfy schema
  // 1) Category: convert non-ObjectId strings to ObjectId placeholder (tests don't rely on Category population)
  if (typeof data.category === 'string' && !data.category.match(/^[0-9a-fA-F]{24}$/)) {
    data.category = new mongoose.Types.ObjectId();
  }

  // 2) Images: map strings to { url }
  if (Array.isArray(data.images)) {
    data.images = data.images.map(img => typeof img === 'string' ? { url: img } : img);
  } else {
    data.images = [{ url: 'test-image.jpg', alt: 'Test Image' }];
  }

  // 3) Ensure seller exists
  if (!data.seller) {
    data.seller = new mongoose.Types.ObjectId();
  }

  // 4) Ensure SKU exists
  if (!data.sku) {
    data.sku = `SKU-${Date.now()}-${Math.floor(Math.random()*100000)}`;
  }

  // 5) Ensure stock/countInStock numbers
  data.stock = typeof data.stock === 'number' ? data.stock : 10;
  data.countInStock = typeof data.countInStock === 'number' ? data.countInStock : 10;

  return data;
};

const createTestOrder = (userId, productId, overrides = {}) => ({
  user: userId,
  orderItems: [{
    product: productId,
    quantity: 1,
    price: 99.99
  }],
  shippingAddress: {
    address: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country'
  },
  paymentMethod: 'stripe',
  totalPrice: 99.99,
  status: 'pending',
  ...overrides
});

// Performance testing utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  startTimer(operation) {
    return {
      operation,
      startTime: process.hrtime.bigint()
    };
  }

  endTimer(timer) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - timer.startTime) / 1000000; // Convert to milliseconds

    this.metrics.push({
      operation: timer.operation,
      duration,
      timestamp: new Date()
    });

    return duration;
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageTime(operation) {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    if (operationMetrics.length === 0) {return 0;}

    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  reset() {
    this.metrics = [];
  }
}

// Test assertion helpers
const assertValidResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('timestamp');

  if (response.body.success) {
    expect(response.body).toHaveProperty('data');
  } else {
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('type');
    expect(response.body.error).toHaveProperty('message');
  }
};

const assertValidPagination = (response) => {
  expect(response.body.data).toHaveProperty('pagination');
  const pagination = response.body.data.pagination;

  expect(pagination).toHaveProperty('currentPage');
  expect(pagination).toHaveProperty('totalPages');
  expect(pagination).toHaveProperty('totalProducts');
  expect(pagination).toHaveProperty('hasNextPage');
  expect(pagination).toHaveProperty('hasPrevPage');
  expect(pagination).toHaveProperty('limit');

  expect(typeof pagination.currentPage).toBe('number');
  expect(typeof pagination.totalPages).toBe('number');
  expect(typeof pagination.totalProducts).toBe('number');
  expect(typeof pagination.hasNextPage).toBe('boolean');
  expect(typeof pagination.hasPrevPage).toBe('boolean');
  expect(typeof pagination.limit).toBe('number');
};

const assertValidProduct = (product) => {
  expect(product).toHaveProperty('_id');
  expect(product).toHaveProperty('name');
  expect(product).toHaveProperty('description');
  expect(product).toHaveProperty('price');
  expect(product).toHaveProperty('category');
  expect(product).toHaveProperty('brand');
  expect(product).toHaveProperty('countInStock');
  expect(product).toHaveProperty('isActive');
  expect(product).toHaveProperty('createdAt');
  expect(product).toHaveProperty('updatedAt');

  expect(typeof product.name).toBe('string');
  expect(typeof product.price).toBe('number');
  expect(typeof product.countInStock).toBe('number');
  expect(typeof product.isActive).toBe('boolean');
  expect(product.price).toBeGreaterThan(0);
  expect(product.countInStock).toBeGreaterThanOrEqual(0);
};

// Load testing utilities
const generateLoadTestData = (count, factory) => {
  return Array.from({ length: count }, (_, index) =>
    factory({ name: `Test Item ${index + 1}` })
  );
};

const runLoadTest = async (testFunction, iterations = 100) => {
  const monitor = new PerformanceMonitor();
  const results = [];

  for (let i = 0; i < iterations; i++) {
    const timer = monitor.startTimer(`load-test-${i}`);

    try {
      const result = await testFunction();
      const duration = monitor.endTimer(timer);

      results.push({
        iteration: i + 1,
        success: true,
        duration,
        result
      });
    } catch (error) {
      const duration = monitor.endTimer(timer);

      results.push({
        iteration: i + 1,
        success: false,
        duration,
        error: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const averageTime = monitor.getAverageTime('load-test-0');

  return {
    totalIterations: iterations,
    successCount,
    failureCount,
    successRate: (successCount / iterations) * 100,
    averageResponseTime: averageTime,
    results
  };
};

module.exports = {
  setupTestEnvironment,
  teardownTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestProduct,
  createTestOrder,
  PerformanceMonitor,
  assertValidResponse,
  assertValidPagination,
  assertValidProduct,
  generateLoadTestData,
  runLoadTest
};
