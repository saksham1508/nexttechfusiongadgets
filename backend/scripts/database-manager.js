
/**
 * Database Manager Script
 * Helps manage MongoDB configuration and connection
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

function setLocalDatabase() {
  console.log('🔧 Setting up local MongoDB connection...');
  updateEnvVariable('MONGO_URI', 'mongodb://localhost:27017/nexttechfusiongadgets');
  console.log('✅ Local MongoDB URI configured.');
  console.log('ℹ️  Make sure MongoDB is installed and running locally.');
  console.log('ℹ️  Test with: npm run test:db');
}

function setAtlasDatabase() {
  console.log('🔧 Setting up MongoDB Atlas connection...');
  console.log('');
  console.log('📋 Steps to get your Atlas connection string:');
  console.log('   1. Go to https://www.mongodb.com/atlas');
  console.log('   2. Create a free M0 cluster');
  console.log('   3. Create a database user');
  console.log('   4. Whitelist your IP address');
  console.log('   5. Get connection string from "Connect" button');
  console.log('');
  console.log('📝 Example Atlas URI:');
  console.log('   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nexttechfusiongadgets');
  console.log('');
  console.log('⚠️  Replace the MONGO_URI in your .env file with your Atlas connection string');
  console.log('ℹ️  Test with: npm run test:db');
}

function checkDatabaseStatus() {
  const mongoUri = getEnvVariable('MONGO_URI');
  console.log('📊 Database Configuration Status:');
  console.log(`   MONGO_URI: ${mongoUri || 'Not set'}`);

  if (mongoUri) {
    if (mongoUri.includes('mongodb+srv://')) {
      console.log('   Type: ☁️  MongoDB Atlas (Cloud)');
    } else if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.log('   Type: 🖥️  Local MongoDB');
    } else {
      console.log('   Type: 🌐 Remote MongoDB');
    }
  }

  console.log('\n🔍 Testing database connection...');
  try {
    execSync('node scripts/test-database.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (error) {
    console.log('\n💡 Database connection failed. Options:');
    console.log('   1. Set up MongoDB Atlas: npm run db:atlas');
    console.log('   2. Install MongoDB locally: npm run db:local');
    console.log('   3. Continue without database (app works with mock data)');
  }
}

function showDatabaseInfo() {
  console.log('📊 Database Information:');
  console.log('');
  console.log('🎯 Current Status:');
  const mongoUri = getEnvVariable('MONGO_URI');
  if (mongoUri) {
    console.log('   ✅ Database URI configured');
    console.log(`   🔗 ${mongoUri}`);
  } else {
    console.log('   ❌ No database URI configured');
  }

  console.log('');
  console.log('🚀 Available Options:');
  console.log('   • MongoDB Atlas (Cloud) - Recommended for development');
  console.log('   • Local MongoDB - Full control, offline development');
  console.log('   • Mock Data Mode - Continue without database');

  console.log('');
  console.log('📈 Application Behavior:');
  console.log('   ✅ With Database: Full functionality, data persistence');
  console.log('   ⚠️  Without Database: Mock data, limited persistence');

  console.log('');
  console.log('🛠️  Quick Commands:');
  console.log('   npm run db:status    - Check database connection');
  console.log('   npm run db:atlas     - Setup MongoDB Atlas');
  console.log('   npm run db:local     - Setup local MongoDB');
  console.log('   npm run test:db      - Test database connection');
}

function showHelp() {
  console.log('🚀 Database Manager - Manage MongoDB configuration easily');
  console.log('');
  console.log('Usage: node scripts/database-manager.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  status    Show current database configuration and test connection');
  console.log('  atlas     Setup MongoDB Atlas (cloud database)');
  console.log('  local     Setup local MongoDB connection');
  console.log('  info      Show database information and options');
  console.log('  help      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/database-manager.js status');
  console.log('  node scripts/database-manager.js atlas');
  console.log('  node scripts/database-manager.js local');
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
case 'atlas':
  setAtlasDatabase();
  break;
case 'local':
  setLocalDatabase();
  break;
case 'status':
  checkDatabaseStatus();
  break;
case 'info':
  showDatabaseInfo();
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
