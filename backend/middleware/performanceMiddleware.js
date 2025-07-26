// Performance Middleware - O(1) request monitoring and optimization
const cacheOptimizer = require('../services/cacheOptimizer');
const algorithmOptimizer = require('../utils/algorithmOptimizer');

class PerformanceMiddleware {
  constructor() {
    this.requestMetrics = new Map();
    this.slowQueryThreshold = 100; // ms
    this.memoryThreshold = 0.8; // 80% of heap
    this.activeRequests = 0;
    this.maxConcurrentRequests = 1000;
  }

  // O(1) - Request timing middleware
  requestTimer() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();
      
      req.startTime = startTime;
      req.startMemory = startMemory;
      this.activeRequests++;

      // O(1) - Response time tracking
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to ms
        const endMemory = process.memoryUsage();
        
        this.activeRequests--;
        
        // O(1) - Store metrics
        const metrics = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
          timestamp: Date.now()
        };

        this.recordMetrics(req.url, metrics);
        
        // O(1) - Add performance headers
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        res.setHeader('X-Memory-Usage', `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        
        // Warn about slow queries
        if (duration > this.slowQueryThreshold) {
          console.warn(`Slow query detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
        }
      });

      next();
    };
  }

  // O(1) - Rate limiting with sliding window
  rateLimiter(windowMs = 900000, maxRequests = 100) {
    const requests = new Map();

    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // O(1) - Get or create request log
      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);
      
      // O(k) where k is requests in window - Remove old requests
      const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
      requests.set(key, validRequests);

      if (validRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
      }

      // O(1) - Add current request
      validRequests.push(now);
      next();
    };
  }

  // O(1) - Memory monitoring middleware
  memoryMonitor() {
    return (req, res, next) => {
      const memoryUsage = process.memoryUsage();
      const heapUsedRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;

      if (heapUsedRatio > this.memoryThreshold) {
        console.warn(`High memory usage: ${(heapUsedRatio * 100).toFixed(2)}%`);
        
        // O(1) - Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // O(1) - Clear expired caches
        cacheOptimizer.clearExpiredCache();
      }

      req.memoryUsage = memoryUsage;
      next();
    };
  }

  // O(1) - Request compression middleware
  compressionOptimizer() {
    return (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // O(1) - Compress large responses
        if (typeof data === 'string' && data.length > 1024) {
          const acceptEncoding = req.headers['accept-encoding'] || '';
          
          if (acceptEncoding.includes('gzip')) {
            const zlib = require('zlib');
            const compressed = zlib.gzipSync(data);
            
            if (compressed.length < data.length * 0.8) { // Only if 20% smaller
              res.setHeader('Content-Encoding', 'gzip');
              res.setHeader('Content-Length', compressed.length);
              return originalSend.call(this, compressed);
            }
          }
        }
        
        return originalSend.call(this, data);
      };

      next();
    };
  }

  // O(1) - Query optimization middleware
  queryOptimizer() {
    return (req, res, next) => {
      // O(1) - Add query hints
      if (req.query) {
        // Sanitize and optimize query parameters
        req.query = this.optimizeQueryParams(req.query);
      }

      // O(1) - Add database query optimization context
      req.dbHints = {
        useIndex: true,
        maxTimeMS: 5000,
        readPreference: 'secondaryPreferred'
      };

      next();
    };
  }

  // O(1) - Cache middleware
  cacheMiddleware(ttl = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `route:${req.originalUrl}`;
      
      try {
        // O(1) - Check cache
        const cached = await cacheOptimizer.get(cacheKey);
        if (cached) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Cache-Control', `public, max-age=${ttl}`);
          return res.json(cached);
        }

        // O(1) - Cache miss - intercept response
        const originalJson = res.json;
        res.json = function(data) {
          // O(1) - Cache successful responses
          if (res.statusCode === 200) {
            cacheOptimizer.set(cacheKey, data, ttl);
          }
          
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('Cache-Control', `public, max-age=${ttl}`);
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // O(1) - Circuit breaker pattern
  circuitBreaker(failureThreshold = 5, resetTimeout = 60000) {
    const circuits = new Map();

    return (req, res, next) => {
      const key = `${req.method}:${req.route?.path || req.url}`;
      
      if (!circuits.has(key)) {
        circuits.set(key, {
          failures: 0,
          lastFailure: 0,
          state: 'CLOSED' // CLOSED, OPEN, HALF_OPEN
        });
      }

      const circuit = circuits.get(key);
      const now = Date.now();

      // O(1) - Check circuit state
      if (circuit.state === 'OPEN') {
        if (now - circuit.lastFailure > resetTimeout) {
          circuit.state = 'HALF_OPEN';
        } else {
          return res.status(503).json({
            success: false,
            error: {
              type: 'CIRCUIT_BREAKER_OPEN',
              message: 'Service temporarily unavailable'
            }
          });
        }
      }

      // O(1) - Monitor response
      res.on('finish', () => {
        if (res.statusCode >= 500) {
          circuit.failures++;
          circuit.lastFailure = now;
          
          if (circuit.failures >= failureThreshold) {
            circuit.state = 'OPEN';
            console.warn(`Circuit breaker opened for ${key}`);
          }
        } else if (circuit.state === 'HALF_OPEN') {
          // Success in half-open state
          circuit.failures = 0;
          circuit.state = 'CLOSED';
        }
      });

      next();
    };
  }

  // O(k) - Optimize query parameters
  optimizeQueryParams(query) {
    const optimized = {};
    
    for (const [key, value] of Object.entries(query)) {
      // O(1) - Type conversion and validation
      if (key === 'page' || key === 'limit') {
        const num = parseInt(value);
        optimized[key] = isNaN(num) ? (key === 'page' ? 1 : 20) : Math.max(1, num);
      } else if (key === 'sort') {
        // O(1) - Validate sort parameters
        optimized[key] = this.validateSortParam(value);
      } else if (typeof value === 'string') {
        // O(1) - Sanitize string inputs
        optimized[key] = value.trim().substring(0, 100);
      } else {
        optimized[key] = value;
      }
    }
    
    return optimized;
  }

  // O(1) - Validate sort parameters
  validateSortParam(sortParam) {
    const allowedFields = ['name', 'price', 'rating', 'createdAt', 'updatedAt'];
    const allowedOrders = ['asc', 'desc', '1', '-1'];
    
    if (typeof sortParam === 'string') {
      const [field, order = 'asc'] = sortParam.split(':');
      
      if (allowedFields.includes(field) && allowedOrders.includes(order)) {
        return `${field}:${order}`;
      }
    }
    
    return 'createdAt:desc'; // Default sort
  }

  // O(1) - Record performance metrics
  recordMetrics(url, metrics) {
    const key = `${metrics.method}:${url}`;
    
    if (!this.requestMetrics.has(key)) {
      this.requestMetrics.set(key, {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        errors: 0
      });
    }

    const stats = this.requestMetrics.get(key);
    stats.count++;
    stats.totalDuration += metrics.duration;
    stats.avgDuration = stats.totalDuration / stats.count;
    stats.maxDuration = Math.max(stats.maxDuration, metrics.duration);
    stats.minDuration = Math.min(stats.minDuration, metrics.duration);
    
    if (metrics.statusCode >= 400) {
      stats.errors++;
    }

    // O(1) - Keep only recent metrics (sliding window)
    if (stats.count > 1000) {
      stats.count = Math.floor(stats.count * 0.9);
      stats.totalDuration = stats.totalDuration * 0.9;
      stats.errors = Math.floor(stats.errors * 0.9);
    }
  }

  // O(1) - Get performance statistics
  getPerformanceStats() {
    const stats = {
      activeRequests: this.activeRequests,
      totalEndpoints: this.requestMetrics.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      endpoints: {}
    };

    // O(n) where n is number of unique endpoints
    for (const [endpoint, metrics] of this.requestMetrics) {
      stats.endpoints[endpoint] = {
        ...metrics,
        errorRate: metrics.count > 0 ? (metrics.errors / metrics.count) * 100 : 0
      };
    }

    return stats;
  }

  // O(1) - Health check endpoint
  healthCheck() {
    return (req, res) => {
      const memoryUsage = process.memoryUsage();
      const heapUsedRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          usage: `${(heapUsedRatio * 100).toFixed(2)}%`
        },
        performance: {
          activeRequests: this.activeRequests,
          avgResponseTime: this.calculateAvgResponseTime(),
          cacheStats: cacheOptimizer.getStats()
        }
      };

      // O(1) - Determine health status
      if (heapUsedRatio > 0.9 || this.activeRequests > this.maxConcurrentRequests * 0.8) {
        health.status = 'degraded';
      }

      res.json(health);
    };
  }

  // O(n) - Calculate average response time across all endpoints
  calculateAvgResponseTime() {
    let totalDuration = 0;
    let totalCount = 0;

    for (const metrics of this.requestMetrics.values()) {
      totalDuration += metrics.totalDuration;
      totalCount += metrics.count;
    }

    return totalCount > 0 ? totalDuration / totalCount : 0;
  }

  // O(1) - Reset metrics
  resetMetrics() {
    this.requestMetrics.clear();
    this.activeRequests = 0;
  }
}

module.exports = new PerformanceMiddleware();