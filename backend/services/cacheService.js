const redis = require('redis');
const winston = require('winston');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
    
    this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        winston.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        winston.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        winston.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      winston.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  // Basic cache operations
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      winston.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      winston.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      winston.error('Cache delete error:', error);
      return false;
    }
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