const redis = require('redis');
const winston = require('winston');

class RedisConfig {
  static getConnectionOptions() {
    // Priority 1: Use REDIS_URL if provided
    if (process.env.REDIS_URL && process.env.REDIS_URL !== 'your_redis_connection_string') {
      return {
        url: process.env.REDIS_URL // ✅ Directly use URL for Redis v4
      };
    }

    // Priority 2: Use individual environment variables
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
    const db = process.env.REDIS_DB || 0;

    return {
      url: `redis://${password}${host}:${port}/${db}`
    };
  }

  static async createClient() {
    const options = this.getConnectionOptions();

    winston.info('Creating Redis client with options:', options);

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
    if (process.env.REDIS_DISABLED === 'true' || process.env.DISABLE_REDIS === 'true') {
      console.log('ℹ️  Redis disabled by configuration, using memory cache only');
      return false;
    }

    let client = null;
    try {
      client = await this.createClient();

      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000) // ⬆️ timeout thoda zyada rakha
      );

      await Promise.race([connectPromise, timeoutPromise]);

      // Test basic operations
      await client.set('test:connection', 'success', { EX: 10 });
      const result = await client.get('test:connection');
      await client.del('test:connection');

      if (result === 'success') {
        console.log('✅ Redis connection test successful');
        return true;
      }
      console.log('❌ Redis connection test failed: unexpected result');
      return false;

    } catch (error) {
      console.log('❌ Redis connection test failed:', error.message);
      console.log('ℹ️  Continuing with memory cache only');
      return false;
    } finally {
      if (client) {
        try {
          await client.quit();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }
}

module.exports = RedisConfig;
