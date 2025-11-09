
/**
 * Database Connection Test Script
 * Tests MongoDB connectivity and basic operations
 */

const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   MONGO_URI: ${process.env.MONGO_URI || 'Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}\n`);

  try {
    console.log('🔌 Connecting to MongoDB...');

    // Connect with timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Test basic operations
    console.log('\n🧪 Testing basic database operations...');

    // Create a test collection
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    }));

    // Insert test document
    const testDoc = new TestModel({ message: 'Database connection test successful!' });
    await testDoc.save();
    console.log('✅ Insert operation successful');

    // Read test document
    const foundDoc = await TestModel.findOne({ message: 'Database connection test successful!' });
    console.log('✅ Read operation successful');

    // Update test document
    await TestModel.updateOne(
      { _id: foundDoc._id },
      { message: 'Database connection test updated!' }
    );
    console.log('✅ Update operation successful');

    // Delete test document
    await TestModel.deleteOne({ _id: foundDoc._id });
    console.log('✅ Delete operation successful');

    // Clean up test collection
    await TestModel.collection.drop().catch(() => {}); // Ignore error if collection doesn't exist

    console.log('\n🎉 All database operations completed successfully!');
    console.log('\n📊 Database Status:');
    console.log(`   Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('   Collections: Available');
    console.log('   Operations: All working');

    await mongoose.connection.close();
    console.log('\n✅ Database connection test PASSED');
    process.exit(0);

  } catch (error) {
    console.log('\n❌ Database connection test FAILED');
    console.error('Error:', error.message);

    console.log('\n🔧 Troubleshooting Steps:');

    if (error.message.includes('ECONNREFUSED')) {
      console.log('   1. MongoDB server is not running');
      console.log('   2. Check if MongoDB service is started');
      console.log('   3. Verify MongoDB is installed');
      console.log('   4. Check connection string in .env file');
    } else if (error.message.includes('authentication failed')) {
      console.log('   1. Check username and password in connection string');
      console.log('   2. Verify user exists in MongoDB');
      console.log('   3. Check user permissions');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.log('   1. Check network connectivity');
      console.log('   2. Verify MongoDB server is accessible');
      console.log('   3. Check firewall settings');
      console.log('   4. For Atlas: Check IP whitelist');
    } else {
      console.log('   1. Check MongoDB server logs');
      console.log('   2. Verify connection string format');
      console.log('   3. Check network connectivity');
    }

    console.log('\n💡 Setup Options:');
    console.log('   • MongoDB Atlas (Cloud): https://www.mongodb.com/atlas');
    console.log('   • Local Installation: https://www.mongodb.com/try/download/community');
    console.log('   • Docker: docker run -d -p 27017:27017 mongo');

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
testDatabaseConnection();
