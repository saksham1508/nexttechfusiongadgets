const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri;

    if (process.env.NODE_ENV === 'test') {
      // Use in-memory MongoDB for testing
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    } else {
      mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error('MongoDB URI not found in environment variables');
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || (process.env.NODE_ENV === 'test' ? 'test' : 'nexfuga'),
      serverSelectionTimeoutMS: process.env.NODE_ENV === 'test' ? 5000 : 10000,
      connectTimeoutMS: process.env.NODE_ENV === 'test' ? 5000 : 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${process.env.DB_NAME || (process.env.NODE_ENV === 'test' ? 'test' : 'nexfuga')}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('🔄 Running in development mode without MongoDB - using mock data');

    mongoose.set('bufferCommands', false);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
