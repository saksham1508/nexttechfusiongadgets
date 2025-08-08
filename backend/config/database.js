const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set shorter timeout to fail fast if MongoDB is not available
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('🔄 Running in development mode without MongoDB - using mock data');
    
    // Disable mongoose buffering globally when connection fails
    mongoose.set('bufferCommands', false);
    
    // Don't exit in development mode, allow server to run with mock data
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

module.exports = connectDB;
