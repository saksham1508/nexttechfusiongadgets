const redis = require('redis');
const winston = require('winston');

/**
 * Redis Configuration Module
 * Supports both REDIS_URL and individual Redis environment variables
 */

class RedisConfig {
  static getConnectionOptions() {
    // Priority 1: Use REDIS_URL if provided
    if (process.env.REDIS_URL && process.env.REDIS_URL !== 'your_redis_connection_string') {
      try {
        const url = new URL(process.env.REDIS_URL);
        return {
          socket: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
          },
          password: url.password || undefined,
          database: url.pathname ? parseInt(url.pathname.slice(1)) : 0,
          retry_strategy: this.getRetryStrategy()
        };
      } catch (error) {
        winston.warn('Invalid REDIS_URL format, falling back to individual variables:', error.message);
      }
    }

    // Priority 2: Use individual environment variables
    return {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB) || 0,
      retry_strategy: this.getRetryStrategy()
    };
  }

  static getRetryStrategy() {
    return (retries, cause) => {
      if (cause && cause.code === 'ECONNREFUSED') {
        // Only log in development mode to avoid spam
        if (process.env.NODE_ENV === 'development') {
          winston.warn('Redis server connection refused - Redis may not be running');
        }
        return new Error('Redis server connection refused');
      }
      
      if (retries > 2) { // Reduced retry attempts to fail faster
        if (process.env.NODE_ENV === 'development') {
          winston.warn('Redis retry attempts exhausted - falling back to memory-only cache');
        }
        return new Error('Redis retry attempts exhausted');
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(retries * 200 + Math.random() * 100, 1000);
      if (process.env.NODE_ENV === 'development') {
        winston.info(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
      }
      return delay;
    };
  }

  static async createClient() {
    const options = this.getConnectionOptions();
    
    winston.info('Creating Redis client with options:', {
      host: options.socket.host,
      port: options.socket.port,
      database: options.database,
      hasPassword: !!options.password
    });

    const client = redis.createClient(options);

    // Event handlers
    client.on('connect', () => {
      winston.info('✅ Redis client connected successfully');
    });

    client.on('ready', () => {
      winston.info('✅ Redis client ready for commands');
    });

    client.on('error', (err) => {
      winston.error('❌ Redis client error:', err.message);
    });

    client.on('end', () => {
      winston.info('🔌 Redis client connection ended');
    });

    client.on('reconnecting', () => {
      winston.info('🔄 Redis client reconnecting...');
    });

    return client;
  }

  static async testConnection() {
    // Skip Redis connection test if explicitly disabled
    if (process.env.REDIS_DISABLED === 'true' || process.env.DISABLE_REDIS === 'true') {
      console.log('ℹ️  Redis disabled by configuration, using memory cache only');
      return false;
    }

    let client = null;
    try {
      client = await this.createClient();
      
      // Set a short timeout for connection test
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 2000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Test basic operations
      await client.set('test:connection', 'success', { EX: 10 });
      const result = await client.get('test:connection');
      await client.del('test:connection');
      
      if (result === 'success') {
        console.log('✅ Redis connection test successful');
        return true;
      } else {
        console.log('❌ Redis connection test failed: unexpected result');
        return false;
      }
    } catch (error) {
      console.log('❌ Redis connection test failed:', error.message);
      console.log('ℹ️  Continuing with memory cache only');
      return false;
    } finally {
      if (client) {
        try {
          await client.quit();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  }
}

module.exports = RedisConfig;