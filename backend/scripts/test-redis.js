
/**
 * Redis Connection Test Script
 * Tests Redis connectivity and basic operations
 */

const dotenv = require('dotenv');
const path = require('path');
const winston = require('winston');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configure winston for this script
winston.configure({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const RedisConfig = require('../config/redis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n');

  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   REDIS_URL: ${process.env.REDIS_URL || 'Not set'}`);
  console.log(`   REDIS_HOST: ${process.env.REDIS_HOST || 'Not set'}`);
  console.log(`   REDIS_PORT: ${process.env.REDIS_PORT || 'Not set'}`);
  console.log(`   REDIS_DB: ${process.env.REDIS_DB || 'Not set'}`);
  console.log(`   REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '***' : 'Not set'}\n`);

  // Test connection
  const isConnected = await RedisConfig.testConnection();

  if (isConnected) {
    console.log('\n✅ Redis connection test PASSED');
    console.log('   Your Redis server is running and accessible');
    process.exit(0);
  } else {
    console.log('\n❌ Redis connection test FAILED');
    console.log('   Please check:');
    console.log('   1. Redis server is running (redis-server)');
    console.log('   2. Redis is accessible on the configured host/port');
    console.log('   3. Firewall settings allow Redis connections');
    console.log('   4. Redis authentication (if password is set)');
    console.log('\n   To start Redis locally:');
    console.log('   - Windows: Download and run Redis from https://redis.io/download');
    console.log('   - macOS: brew install redis && brew services start redis');
    console.log('   - Linux: sudo apt-get install redis-server && sudo systemctl start redis');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
testRedisConnection();
