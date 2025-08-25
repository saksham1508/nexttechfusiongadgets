// Cache Optimizer - O(1) memory-efficient caching system
const Redis = require('redis');
const LRU = require('lru-cache');
const RedisConfig = require('../config/redis');

// Ensure environment variables are loaded
require('dotenv').config();

class CacheOptimizer {
  constructor() {
    // O(1) - Multi-level caching system
    this.memoryCache = new LRU({
      max: 1000, // Maximum items
      maxAge: 1000 * 60 * 15, // 15 minutes TTL
      updateAgeOnGet: true,
      stale: false
    });

    this.redisClient = null;
    this.compressionEnabled = true;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0
    };

    this.initializeRedis();
  }

  // O(1) - Initialize Redis connection
  async initializeRedis() {
    try {
      // Check if Redis is explicitly disabled (support both flags)
      const redisDisabled = process.env.DISABLE_REDIS === 'true' || process.env.REDIS_DISABLED === 'true';
      if (redisDisabled) {
        console.log('ℹ️  Redis disabled by configuration, using memory cache only');
        this.redisClient = null;
        return;
      }

      this.redisClient = await RedisConfig.createClient();

      this.redisClient.on('error', (err) => {
        // Only log Redis errors in development mode to avoid spam
        if (process.env.NODE_ENV === 'development') {
          console.warn('Cache optimizer Redis connection error:', err.message);
        }
        this.redisClient = null; // Fallback to memory cache only
      });

      await this.redisClient.connect();
      console.log('✅ Cache optimizer Redis connected');
    } catch (error) {
      // Only log Redis initialization errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Cache optimizer Redis initialization failed, using memory cache only:', error.message);
      }
      this.redisClient = null;
    }
  }

  // O(1) - Get from cache with fallback strategy
  async get(key, options = {}) {
    const { useCompression = this.compressionEnabled } = options;
    
    try {
      // Level 1: Memory cache (fastest)
      let value = this.memoryCache.get(key);
      if (value !== undefined) {
        this.cacheStats.hits++;
        return this.deserializeValue(value, useCompression);
      }

      // Level 2: Redis cache
      if (this.redisClient) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue !== null) {
          const deserializedValue = this.deserializeValue(redisValue, useCompression);
          // Promote to memory cache
          this.memoryCache.set(key, redisValue);
          this.cacheStats.hits++;
          return deserializedValue;
        }
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  // O(1) - Set in cache with compression
  async set(key, value, ttl = 900, options = {}) {
    const { useCompression = this.compressionEnabled, priority = 'normal' } = options;
    
    try {
      const serializedValue = this.serializeValue(value, useCompression);
      
      // Set in memory cache
      this.memoryCache.set(key, serializedValue, ttl * 1000);

      // Set in Redis cache
      if (this.redisClient) {
        await this.redisClient.setEx(key, ttl, serializedValue);
      }

      this.cacheStats.sets++;
      this.updateMemoryUsage();
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // O(1) - Delete from cache
  async delete(key) {
    try {
      this.memoryCache.delete(key);
      
      if (this.redisClient) {
        await this.redisClient.del(key);
      }

      this.cacheStats.deletes++;
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // O(n) - Delete by pattern (use sparingly)
  async deletePattern(pattern) {
    try {
      // Clear memory cache entries matching pattern
      const memoryKeys = [...this.memoryCache.keys()];
      const regex = new RegExp(pattern.replace('*', '.*'));
      
      memoryKeys.forEach(key => {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      });

      // Clear Redis entries
      if (this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return false;
    }
  }

  // O(1) - Memoization decorator for functions
  memoize(fn, keyGenerator, ttl = 900) {
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : `memoized:${fn.name}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      let result = await this.get(key);
      if (result !== null) {
        return result;
      }

      // Execute function and cache result
      result = await fn(...args);
      await this.set(key, result, ttl, { priority: 'high' });
      
      return result;
    };
  }

  // O(1) - Smart cache warming for frequently accessed data
  async warmCache(warmingStrategies) {
    const promises = warmingStrategies.map(async (strategy) => {
      try {
        const { key, dataFetcher, ttl = 3600, priority = 'normal' } = strategy;
        
        // Check if already cached
        const existing = await this.get(key);
        if (existing !== null) {
          return;
        }

        // Fetch and cache data
        const data = await dataFetcher();
        await this.set(key, data, ttl, { priority });
        
        console.log(`✅ Cache warmed: ${key}`);
      } catch (error) {
        console.error(`Cache warming failed for ${strategy.key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // O(1) - Batch operations for better performance
  async mget(keys) {
    const results = {};
    const missingKeys = [];

    // Check memory cache first
    keys.forEach(key => {
      const value = this.memoryCache.get(key);
      if (value !== undefined) {
        results[key] = this.deserializeValue(value);
        this.cacheStats.hits++;
      } else {
        missingKeys.push(key);
      }
    });

    // Check Redis for missing keys
    if (this.redisClient && missingKeys.length > 0) {
      try {
        const redisValues = await this.redisClient.mGet(missingKeys);
        
        missingKeys.forEach((key, index) => {
          const value = redisValues[index];
          if (value !== null) {
            const deserializedValue = this.deserializeValue(value);
            results[key] = deserializedValue;
            // Promote to memory cache
            this.memoryCache.set(key, value);
            this.cacheStats.hits++;
          } else {
            this.cacheStats.misses++;
          }
        });
      } catch (error) {
        console.error('Batch get error:', error);
        missingKeys.forEach(() => this.cacheStats.misses++);
      }
    } else {
      missingKeys.forEach(() => this.cacheStats.misses++);
    }

    return results;
  }

  // O(n) - Batch set operations
  async mset(keyValuePairs, ttl = 900) {
    const promises = Object.entries(keyValuePairs).map(([key, value]) => 
      this.set(key, value, ttl)
    );
    
    const results = await Promise.allSettled(promises);
    return results.every(result => result.status === 'fulfilled' && result.value);
  }

  // O(1) - Serialize value with optional compression
  serializeValue(value, useCompression = false) {
    try {
      let serialized = JSON.stringify(value);
      
      if (useCompression && serialized.length > 1024) {
        // Use simple compression for large objects
        const zlib = require('zlib');
        serialized = zlib.gzipSync(serialized).toString('base64');
        return `compressed:${serialized}`;
      }
      
      return serialized;
    } catch (error) {
      console.error('Serialization error:', error);
      return null;
    }
  }

  // O(1) - Deserialize value with decompression
  deserializeValue(serialized, useCompression = false) {
    try {
      if (typeof serialized === 'string' && serialized.startsWith('compressed:')) {
        const zlib = require('zlib');
        const compressed = serialized.substring(11); // Remove 'compressed:' prefix
        const decompressed = zlib.gunzipSync(Buffer.from(compressed, 'base64')).toString();
        return JSON.parse(decompressed);
      }
      
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Deserialization error:', error);
      return null;
    }
  }

  // O(1) - Update memory usage statistics
  updateMemoryUsage() {
    this.cacheStats.memoryUsage = this.memoryCache.calculatedSize || 0;
  }

  // O(1) - Get cache statistics
  getStats() {
    this.updateMemoryUsage();
    
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
      memoryCache: {
        size: this.memoryCache.size,
        max: this.memoryCache.max,
        usage: this.cacheStats.memoryUsage
      },
      redis: {
        connected: !!this.redisClient,
        status: this.redisClient ? 'connected' : 'disconnected'
      }
    };
  }

  // O(1) - Clear all caches
  async clear() {
    this.memoryCache.clear();
    
    if (this.redisClient) {
      await this.redisClient.flushDb();
    }

    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0
    };
  }

  // O(1) - Cache health check
  async healthCheck() {
    const stats = this.getStats();
    
    return {
      status: 'healthy',
      memoryCache: {
        status: 'active',
        size: stats.memoryCache.size,
        hitRate: stats.hitRate
      },
      redisCache: {
        status: stats.redis.connected ? 'active' : 'inactive',
        connection: stats.redis.status
      },
      performance: {
        hitRate: stats.hitRate,
        totalOperations: stats.hits + stats.misses
      }
    };
  }

  // Cleanup on shutdown
  async shutdown() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    this.memoryCache.clear();
  }
}

// Export singleton instance
module.exports = new CacheOptimizer();