const winston = require('winston');
const RedisConfig = require('../config/redis');

/**
 * Fallback Cache Service
 * Provides caching functionality with graceful Redis fallback to in-memory cache
 */
class FallbackCacheService {
  constructor() {
    this.redisClient = null;
    this.isRedisConnected = false;
    this.memoryCache = new Map();
    this.defaultTTL = 3600; // 1 hour
    this.maxMemoryItems = 1000; // Prevent memory overflow
    
    this.initializeRedis();
  }

  async initializeRedis() {
    // Skip Redis initialization if disabled
    if (process.env.DISABLE_REDIS === 'true' || process.env.REDIS_DISABLED === 'true') {
      console.log('ℹ️  Redis disabled for cache service, using memory cache only');
      this.isRedisConnected = false;
      this.redisClient = null;
      return;
    }

    try {
      this.redisClient = await RedisConfig.createClient();

      this.redisClient.on('connect', () => {
        console.log('✅ Fallback cache service Redis connected');
        this.isRedisConnected = true;
      });

      this.redisClient.on('error', (err) => {
        console.log('⚠️ Fallback cache service Redis error, using memory cache:', err.message);
        this.isRedisConnected = false;
      });

      this.redisClient.on('end', () => {
        console.log('🔌 Fallback cache service Redis disconnected, using memory cache');
        this.isRedisConnected = false;
      });

      // Try to connect with timeout
      const connectPromise = this.redisClient.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Redis connected successfully for fallback cache service');
      
    } catch (error) {
      console.log('⚠️ Redis initialization failed for cache service, using memory cache only:', error.message);
      this.isRedisConnected = false;
      this.redisClient = null;
    }
  }

  // Memory cache management
  _cleanupMemoryCache() {
    if (this.memoryCache.size > this.maxMemoryItems) {
      // Remove oldest 20% of items
      const itemsToRemove = Math.floor(this.maxMemoryItems * 0.2);
      const keys = Array.from(this.memoryCache.keys());
      for (let i = 0; i < itemsToRemove; i++) {
        this.memoryCache.delete(keys[i]);
      }
      winston.info(`🧹 Memory cache cleanup: removed ${itemsToRemove} items`);
    }
  }

  _setMemoryCache(key, value, ttl) {
    this._cleanupMemoryCache();
    
    const expiresAt = Date.now() + (ttl * 1000);
    this.memoryCache.set(key, { value, expiresAt });
    
    // Set cleanup timer
    setTimeout(() => {
      this.memoryCache.delete(key);
    }, ttl * 1000);
  }

  _getMemoryCache(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Basic cache operations with fallback
  async get(key) {
    try {
      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value !== null) {
          return JSON.parse(value);
        }
      }
    } catch (error) {
      winston.warn('Redis get error, falling back to memory cache:', error.message);
      this.isRedisConnected = false;
    }
    
    // Fallback to memory cache
    const memValue = this._getMemoryCache(key);
    return memValue;
  }

  async set(key, value, ttl = this.defaultTTL) {
    const serialized = JSON.stringify(value);
    let redisSuccess = false;
    
    try {
      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttl, serialized);
        redisSuccess = true;
      }
    } catch (error) {
      winston.warn('Redis set error, using memory cache only:', error.message);
      this.isRedisConnected = false;
    }
    
    // Always set in memory cache as backup
    this._setMemoryCache(key, value, ttl);
    
    return true; // Always return success since we have memory fallback
  }

  async del(key) {
    try {
      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
      }
    } catch (error) {
      winston.warn('Redis delete error:', error.message);
      this.isRedisConnected = false;
    }
    
    // Always delete from memory cache
    this.memoryCache.delete(key);
    return true;
  }

  async exists(key) {
    try {
      // Try Redis first
      if (this.isRedisConnected && this.redisClient) {
        const result = await this.redisClient.exists(key);
        return result === 1;
      }
    } catch (error) {
      winston.warn('Redis exists error:', error.message);
      this.isRedisConnected = false;
    }
    
    // Fallback to memory cache
    return this.memoryCache.has(key) && this._getMemoryCache(key) !== null;
  }

  // Specialized caching methods
  async cacheProduct(productId, productData, ttl = 1800) {
    return await this.set(`product:${productId}`, productData, ttl);
  }

  async getCachedProduct(productId) {
    return await this.get(`product:${productId}`);
  }

  async invalidateProduct(productId) {
    return await this.del(`product:${productId}`);
  }

  async cacheUserSession(userId, sessionData, ttl = 86400) {
    return await this.set(`session:${userId}`, sessionData, ttl);
  }

  async getCachedUserSession(userId) {
    return await this.get(`session:${userId}`);
  }

  async invalidateUserSession(userId) {
    return await this.del(`session:${userId}`);
  }

  // Rate limiting with fallback
  async checkRateLimit(identifier, limit, window) {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const key = `rate_limit:${identifier}`;
        const current = await this.redisClient.incr(key);
        
        if (current === 1) {
          await this.redisClient.expire(key, window);
        }
        
        const remaining = Math.max(0, limit - current);
        const allowed = current <= limit;
        
        return { allowed, remaining, current };
      }
    } catch (error) {
      winston.warn('Redis rate limit error, allowing request:', error.message);
      this.isRedisConnected = false;
    }
    
    // Fallback: allow all requests when Redis is unavailable
    return { allowed: true, remaining: limit, current: 0 };
  }

  // Health check
  getStatus() {
    return {
      redis: {
        connected: this.isRedisConnected,
        client: !!this.redisClient
      },
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.maxMemoryItems
      },
      fallbackActive: !this.isRedisConnected
    };
  }

  // Cleanup
  async shutdown() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch (error) {
        winston.warn('Error closing Redis connection:', error.message);
      }
    }
    this.memoryCache.clear();
  }
}

module.exports = FallbackCacheService;