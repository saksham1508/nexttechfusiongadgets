const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const winston = require('winston');
const redis = require('redis');
const mongoose = require('mongoose');

// Load env vars (prefer .env.<NODE_ENV> and fallback to .env)
const envFile = path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`);
dotenv.config({ path: envFile });
dotenv.config(); // fallback to .env

// Debug log – confirm REDIS_URL loaded
console.log('Loaded REDIS_URL:', process.env.REDIS_URL);


// Import configs & middleware
const passport = require('./config/passport');
const { connectDB } = require('./config/database');
const RedisConfig = require('./config/redis');
const { errorHandler, getHealthMetrics } = require('./middleware/errorHandler');
const { rateLimits, sanitizeInput, addCorrelationId } = require('./middleware/validation');

// Respect Redis disable flags
if (process.env.DISABLE_REDIS === 'true' || process.env.REDIS_DISABLED === 'true') {
  console.log('ℹ️  Redis disabled by configuration, skipping direct Redis client setup');
} else {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  redisClient.on('error', (err) => console.log('Redis Client Error:', err));
  (async () => {
    try {
      await redisClient.connect();
      console.log('✅ Redis Cloud Connected Successfully');
    } catch (error) {
      console.log('❌ Redis Cloud connection failed:', error.message);
    }
  })();
}

// Configure Winston
winston.configure({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      )
    })
  ]
});

// Paytm configuration
const MID = process.env.PAYTM_MID;
const MKEY = process.env.PAYTM_KEY;
const WEBSITE = process.env.PAYTM_WEBSITE;
const CALLBACK = process.env.PAYTM_CALLBACK;

// Connect MongoDB
(async () => {
  await connectDB();
})();

// Initialize cache service with Redis fallback
const FallbackCacheService = require('./services/fallbackCacheService');
const cacheService = new FallbackCacheService();

// Respect Redis disable flags for startup test
if (process.env.DISABLE_REDIS !== 'true' && process.env.REDIS_DISABLED !== 'true') {
  RedisConfig.testConnection().then(isConnected => {
    if (isConnected) {
      console.log('✅ Redis connection verified on startup');
    } else {
      console.warn('⚠️  Redis connection failed - using memory cache fallback');
    }
  }).catch(error => {
    console.warn('⚠️  Redis connection test error:', error.message);
  });
}

const app = express();

/* ---------------- Security + Performance Middleware ---------------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
        fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
        imgSrc: ['\'self\'', 'data:', 'https://res.cloudinary.com'],
        scriptSrc: [
          '\'self\'',
          'https://pay.google.com',
          'https://www.gstatic.com',
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://checkout.razorpay.com',
          'https://www.paypal.com',
          'https://securegw-stage.paytm.in',
          'https://securegw.paytm.in'
        ],
        connectSrc: [
          '\'self\'',
          'https://api.stripe.com',
          'https://pay.google.com',
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://www.googleapis.com',
          'https://api.razorpay.com',
          'https://www.paypal.com',
          'https://securegw-stage.paytm.in',
          'https://securegw.paytm.in',
          'https://api-preprod.phonepe.com'
        ],
        frameSrc: [
          '\'self\'',
          'https://accounts.google.com',
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',
          'https://www.paypal.com',
          'https://securegw-stage.paytm.in',
          'https://securegw.paytm.in'
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// CORS config
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, 'https://nextfuga.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
};

app.use(cors(corsOptions));
app.use(compression());
app.use(addCorrelationId);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms [:date[clf]] :req[x-correlation-id]'));
app.use(express.json({ limit: '25mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(sanitizeInput);
app.use(passport.initialize());

/* ---------------- Routes ---------------- */
app.use('/api/auth', rateLimits.auth, require('./routes/authRoutesFallback'));
app.use('/api/products', rateLimits.api, require('./routes/productRoutesFallback'));
app.use('/api/categories', rateLimits.api, require('./routes/categoryRoutes'));
app.use('/api/cart', rateLimits.api, require('./routes/cartRoutes'));
app.use('/api/wishlist', rateLimits.api, require('./routes/wishlistRoutes'));
app.use('/api/orders', rateLimits.api, require('./routes/orderRoutes'));
app.use('/api/payment-methods', rateLimits.api, require('./routes/paymentRoutes'));
app.use('/api/payments/instamojo', rateLimits.api, require('./routes/instamojoRoutes'));
app.use('/api/delivery', rateLimits.api, require('./routes/deliveryRoutes'));
app.use('/api/flash-sales', rateLimits.api, require('./routes/flashSaleRoutes'));
app.use('/api/coupons', rateLimits.api, require('./routes/couponRoutes'));
app.use('/api/ai-inventory', rateLimits.api, require('./routes/aiInventoryRoutes'));
app.use('/api/user', rateLimits.api, require('./routes/userRoutes'));
app.use('/api/vendor', rateLimits.api, require('./routes/vendorRoutes'));
const asyncHandler = require('express-async-handler');
const aiService = require('./services/aiService');
const Chat = require('./models/Chat');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const { optional } = require('./middleware/auth');

/* ---------------- Chatbot Routes ---------------- */
// Reintroduce chat handlers that were previously commented out
// Defines sendMessage and getChatHistory used by the routes below

// @desc    Send message to AI chatbot
// @route   POST /api/chat/message | GET /api/chat/message
// @access  Public
const sendMessage = async (req, res) => {
  try {
    // Accept from JSON body (POST) or query string (GET)
    const message = req.body?.message || req.query?.message;
    const sessionId = req.body?.sessionId || req.query?.sessionId;
    const userId = req.user ? req.user._id : null;

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and session ID are required'
      });
    }

    // Analyze user intent
    const intent = await aiService.analyzeUserIntent(message);

    // Build context if user is logged in
    let context = {};
    if (userId) {
      const user = await User.findById(userId).select('-password');
      const recentOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('orderItems.product', 'name category');

      context.userHistory = {
        name: user?.name,
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          status: order.status,
          items: order.orderItems.map(item => item.product.name)
        }))
      };
    }

    // Get relevant products if it's a product search
    if (intent.intent === 'product_search') {
      const products = await Product.find({
        $or: [
          { name: { $regex: intent.keywords.join('|'), $options: 'i' } },
          { description: { $regex: intent.keywords.join('|'), $options: 'i' } },
          { category: { $regex: intent.keywords.join('|'), $options: 'i' } }
        ]
      })
        .limit(5)
        .select('name price category description images');

      context.currentProducts = products;
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(message, context);

    // Save chat message only if DB is connected; otherwise skip persist
    let persisted = false;
    if (mongoose.connection?.readyState === 1) {
      const chatMessage = new Chat({
        sessionId,
        user: userId,
        message,
        response: aiResponse.message,
        intent: intent.intent,
        category: intent.category,
        urgency: intent.urgency,
        requiresHuman: intent.requiresHuman
      });
      try {
        await chatMessage.save();
        persisted = true;
      } catch (e) {
        console.warn('Chat persist skipped (DB issue):', e.message);
      }
    } else {
      console.warn('Chat persist skipped: MongoDB not connected');
    }

    res.json({
      success: true,
      response: aiResponse.message,
      intent,
      requiresHuman: intent.requiresHuman,
      sessionId,
      persisted
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Public
const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { limit = 50 } = req.query;

  if (mongoose.connection?.readyState !== 1) {
    // DB not available; return empty history gracefully
    return res.json({ success: true, history: [] });
  }

  const chatHistory = await Chat.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('message response createdAt intent urgency');

  res.json({
    success: true,
    history: chatHistory.reverse()
  });
});

app.post('/api/chat/message', optional, asyncHandler(sendMessage));
app.get('/api/chat/message', optional, asyncHandler(sendMessage));
app.get('/api/chat/history/:sessionId', getChatHistory);

// Health + Status
app.get('/api/health', getHealthMetrics);
app.get('/api/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const cacheStatus = cacheService.getStatus();

  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cache: {
      redis: {
        connected: cacheStatus.redis.connected,
        status: cacheStatus.redis.connected ? 'active' : 'disconnected'
      },
      memoryCache: {
        items: cacheStatus.memoryCache.size,
        maxItems: cacheStatus.memoryCache.maxSize
      },
      fallbackActive: cacheStatus.fallbackActive
    },
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    correlationId: req.correlationId
  });
});

// API docs
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'NextTechFusionGadgets API',
    version: '1.0.0',
    description: 'Ultra-fast tech commerce platform API'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
