const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'test', // ✅ DB name from .env
      serverSelectionTimeoutMS: 10000, // 10s for Atlas
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000, // recommended for Atlas
      bufferCommands: false
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${process.env.DB_NAME}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('🔄 Running in development mode without MongoDB - using mock data');

    mongoose.set('bufferCommands', false);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1); // ✅ Production me bina DB ke process exit ho
    }
    return false;
  }
};

module.exports = connectDB;
