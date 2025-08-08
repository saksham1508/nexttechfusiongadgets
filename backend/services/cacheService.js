const redis = require('redis');
const winston = require('winston');
const RedisConfig = require('../config/redis');

// Ensure environment variables are loaded
require('dotenv').config();

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
    this.memoryCache = new Map(); // Fallback memory cache
    
    this.connect();
  }

  async connect() {
    try {
      // Check if Redis is explicitly disabled
      if (process.env.DISABLE_REDIS === 'true') {
        winston.info('Cache service Redis disabled by configuration, using memory cache only');
        this.isConnected = false;
        return;
      }

      this.client = await RedisConfig.createClient();

      this.client.on('connect', () => {
        winston.info('Cache service Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          winston.warn('Fallback cache service Redis error, using memory cache:', err.message);
        }
        this.isConnected = false;
      });

      this.client.on('end', () => {
        winston.info('Cache service Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        winston.warn('Failed to connect Cache service to Redis, using memory cache:', error.message);
      }
      this.isConnected = false;
    }
  }

  // Basic cache operations with memory fallback
  async get(key) {
    if (this.isConnected) {
      try {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        winston.error('Cache get error:', error);
      }
    }
    
    // Fallback to memory cache
    const memValue = this.memoryCache.get(key);
    if (memValue && memValue.expires > Date.now()) {
      return memValue.data;
    } else if (memValue) {
      this.memoryCache.delete(key); // Clean up expired
    }
    return null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    let success = false;
    
    if (this.isConnected) {
      try {
        const serialized = JSON.stringify(value);
        await this.client.setEx(key, ttl, serialized);
        success = true;
      } catch (error) {
        winston.error('Cache set error:', error);
      }
    }
    
    // Always set in memory cache as fallback
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000)
    });
    
    return success || true; // Return true if at least memory cache worked
  }

  async del(key) {
    let success = false;
    
    if (this.isConnected) {
      try {
        await this.client.del(key);
        success = true;
      } catch (error) {
        winston.error('Cache delete error:', error);
      }
    }
    
    // Also delete from memory cache
    this.memoryCache.delete(key);
    
    return success || true; // Return true if at least memory cache worked
  }

  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      winston.error('Cache exists error:', error);
      return false;
    }
  }

  // Advanced cache operations
  async mget(keys) {
    if (!this.isConnected) return {};
    
    try {
      const values = await this.client.mGet(keys);
      const result = {};
      
      keys.forEach((key, index) => {
        result[key] = values[index] ? JSON.parse(values[index]) : null;
      });
      
      return result;
    } catch (error) {
      winston.error('Cache mget error:', error);
      return {};
    }
  }

  async mset(keyValuePairs, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      const pipeline = this.client.multi();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        pipeline.setEx(key, ttl, serialized);
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      winston.error('Cache mset error:', error);
      return false;
    }
  }

  // Pattern-based operations
  async keys(pattern) {
    if (!this.isConnected) return [];
    
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      winston.error('Cache keys error:', error);
      return [];
    }
  }

  async deletePattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      winston.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Hash operations for complex data
  async hget(key, field) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      winston.error('Cache hget error:', error);
      return null;
    }
  }

  async hset(key, field, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      await this.client.hSet(key, field, serialized);
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      winston.error('Cache hset error:', error);
      return false;
    }
  }

  async hgetall(key) {
    if (!this.isConnected) return {};
    
    try {
      const hash = await this.client.hGetAll(key);
      const result = {};
      
      Object.entries(hash).forEach(([field, value]) => {
        result[field] = JSON.parse(value);
      });
      
      return result;
    } catch (error) {
      winston.error('Cache hgetall error:', error);
      return {};
    }
  }

  // List operations for queues and logs
  async lpush(key, value) {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      await this.client.lPush(key, serialized);
      return true;
    } catch (error) {
      winston.error('Cache lpush error:', error);
      return false;
    }
  }

  async rpop(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.rPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      winston.error('Cache rpop error:', error);
      return null;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    if (!this.isConnected) return [];
    
    try {
      const values = await this.client.lRange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      winston.error('Cache lrange error:', error);
      return [];
    }
  }

  // Specialized caching methods for the application
  
  // Product caching
  async cacheProduct(productId, productData, ttl = 1800) { // 30 minutes
    return await this.set(`product:${productId}`, productData, ttl);
  }

  async getCachedProduct(productId) {
    return await this.get(`product:${productId}`);
  }

  async invalidateProduct(productId) {
    return await this.del(`product:${productId}`);
  }

  // User session caching
  async cacheUserSession(userId, sessionData, ttl = 86400) { // 24 hours
    return await this.set(`session:${userId}`, sessionData, ttl);
  }

  async getCachedUserSession(userId) {
    return await this.get(`session:${userId}`);
  }

  async invalidateUserSession(userId) {
    return await this.del(`session:${userId}`);
  }

  // Payment method caching
  async cachePaymentMethods(userId, methods, ttl = 3600) { // 1 hour
    return await this.set(`payment_methods:${userId}`, methods, ttl);
  }

  async getCachedPaymentMethods(userId) {
    return await this.get(`payment_methods:${userId}`);
  }

  async invalidatePaymentMethods(userId) {
    return await this.del(`payment_methods:${userId}`);
  }

  // Cart caching
  async cacheCart(userId, cartData, ttl = 1800) { // 30 minutes
    return await this.set(`cart:${userId}`, cartData, ttl);
  }

  async getCachedCart(userId) {
    return await this.get(`cart:${userId}`);
  }

  async invalidateCart(userId) {
    return await this.del(`cart:${userId}`);
  }

  // Search results caching
  async cacheSearchResults(query, filters, results, ttl = 600) { // 10 minutes
    const key = `search:${this.generateSearchKey(query, filters)}`;
    return await this.set(key, results, ttl);
  }

  async getCachedSearchResults(query, filters) {
    const key = `search:${this.generateSearchKey(query, filters)}`;
    return await this.get(key);
  }

  generateSearchKey(query, filters) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return Buffer.from(`${query}|${filterString}`).toString('base64');
  }

  // Analytics caching
  async cacheAnalytics(type, period, data, ttl = 300) { // 5 minutes
    const key = `analytics:${type}:${period}`;
    return await this.set(key, data, ttl);
  }

  async getCachedAnalytics(type, period) {
    const key = `analytics:${type}:${period}`;
    return await this.get(key);
  }

  // Rate limiting
  async checkRateLimit(identifier, limit, window) {
    if (!this.isConnected) return { allowed: true, remaining: limit };
    
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, window);
      }
      
      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;
      
      return { allowed, remaining, current };
    } catch (error) {
      winston.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Lock mechanism for critical operations
  async acquireLock(resource, ttl = 30) {
    if (!this.isConnected) return null;
    
    try {
      const lockKey = `lock:${resource}`;
      const lockValue = Date.now().toString();
      
      const result = await this.client.set(lockKey, lockValue, {
        NX: true,
        EX: ttl
      });
      
      return result === 'OK' ? lockValue : null;
    } catch (error) {
      winston.error('Lock acquisition error:', error);
      return null;
    }
  }

  async releaseLock(resource, lockValue) {
    if (!this.isConnected) return false;
    
    try {
      const lockKey = `lock:${resource}`;
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.client.eval(script, {
        keys: [lockKey],
        arguments: [lockValue]
      });
      
      return result === 1;
    } catch (error) {
      winston.error('Lock release error:', error);
      return false;
    }
  }

  // Cache statistics
  async getStats() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      winston.error('Cache stats error:', error);
      return null;
    }
  }

  // Cleanup and maintenance
  async flushAll() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      winston.error('Cache flush error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
    }
  }
}

module.exports = new CacheService();