#!/usr/bin/env node

/**
 * Redis Manager Script
 * Helps manage Redis configuration and setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env');

function updateEnvVariable(key, value) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, envContent);
}

function getEnvVariable(key) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=(.*)$`, 'm');
  const match = envContent.match(regex);
  return match ? match[1] : null;
}

function disableRedis() {
  console.log('🔧 Disabling Redis...');
  updateEnvVariable('DISABLE_REDIS', 'true');
  console.log('✅ Redis disabled. Application will use memory cache only.');
  console.log('ℹ️  Restart your application to apply changes.');
}

function enableRedis() {
  console.log('🔧 Enabling Redis...');
  updateEnvVariable('DISABLE_REDIS', 'false');
  console.log('✅ Redis enabled. Make sure Redis server is running.');
  console.log('ℹ️  Restart your application to apply changes.');
}

function checkRedisStatus() {
  const disabled = getEnvVariable('DISABLE_REDIS') === 'true';
  console.log('📊 Redis Configuration Status:');
  console.log(`   Redis: ${disabled ? '❌ Disabled' : '✅ Enabled'}`);
  console.log(`   REDIS_URL: ${getEnvVariable('REDIS_URL') || 'Not set'}`);
  console.log(`   REDIS_HOST: ${getEnvVariable('REDIS_HOST') || 'Not set'}`);
  console.log(`   REDIS_PORT: ${getEnvVariable('REDIS_PORT') || 'Not set'}`);
  
  if (!disabled) {
    console.log('\n🔍 Testing Redis connection...');
    try {
      execSync('node scripts/test-redis.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (error) {
      console.log('\n💡 Redis connection failed. You can:');
      console.log('   1. Install Redis locally');
      console.log('   2. Use Docker: docker run -d --name redis -p 6379:6379 redis:alpine');
      console.log('   3. Disable Redis temporarily: npm run redis:disable');
    }
  }
}

function showHelp() {
  console.log('🚀 Redis Manager - Manage Redis configuration easily');
  console.log('');
  console.log('Usage: node scripts/redis-manager.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  status    Show current Redis configuration and test connection');
  console.log('  enable    Enable Redis caching');
  console.log('  disable   Disable Redis and use memory cache only');
  console.log('  help      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/redis-manager.js status');
  console.log('  node scripts/redis-manager.js disable');
  console.log('  node scripts/redis-manager.js enable');
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'disable':
    disableRedis();
    break;
  case 'enable':
    enableRedis();
    break;
  case 'status':
    checkRedisStatus();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.log(`❌ Unknown command: ${command}`);
      console.log('');
    }
    showHelp();
    process.exit(1);
}