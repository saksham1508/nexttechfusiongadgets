const fs = require('fs').promises;
const path = require('path');

// Six Sigma: Define - Comprehensive error categorization and metrics
class ErrorMetrics {
  constructor() {
    this.errorCounts = new Map();
    this.errorTrends = [];
    this.performanceMetrics = {
      responseTime: [],
      errorRate: 0,
      uptime: Date.now()
    };
  }

  recordError(errorType, statusCode, endpoint, responseTime) {
    const key = `${errorType}_${statusCode}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    this.errorTrends.push({
      timestamp: new Date(),
      errorType,
      statusCode,
      endpoint,
      responseTime
    });

    // Keep only last 1000 error records (Lean: eliminate waste)
    if (this.errorTrends.length > 1000) {
      this.errorTrends = this.errorTrends.slice(-1000);
    }

    this.calculateErrorRate();
  }

  calculateErrorRate() {
    const totalRequests = this.performanceMetrics.responseTime.length;
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    this.performanceMetrics.errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  getMetrics() {
    return {
      errorCounts: Object.fromEntries(this.errorCounts),
      errorRate: this.performanceMetrics.errorRate,
      uptime: Date.now() - this.performanceMetrics.uptime,
      recentErrors: this.errorTrends.slice(-10)
    };
  }
}

const errorMetrics = new ErrorMetrics();

// Agile: Comprehensive logging system
const logError = async (error, req, additionalInfo = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    },
    additionalInfo,
    severity: error.statusCode >= 500 ? 'HIGH' : error.statusCode >= 400 ? 'MEDIUM' : 'LOW'
  };

  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', JSON.stringify(logEntry, null, 2));
  }

  // Log to file for production (Lean: centralized logging)
  try {
    const logDir = path.join(__dirname, '../logs');
    await fs.mkdir(logDir, { recursive: true });

    const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
};

// Six Sigma: Improved error categorization and handling
const errorHandler = async (err, req, res, next) => {
  const startTime = Date.now();
  let error = { ...err };
  error.message = err.message;

  // Six Sigma: Measure - Track error metrics
  const responseTime = Date.now() - (req.startTime || startTime);

  // Enhanced error categorization
  let statusCode = 500;
  let errorType = 'INTERNAL_SERVER_ERROR';
  let userMessage = 'An unexpected error occurred. Please try again.';
  let shouldRetry = false;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    errorType = 'RESOURCE_NOT_FOUND';
    userMessage = 'The requested resource was not found.';
    shouldRetry = false;
  }
  // Mongoose duplicate key
  else if (err.code === 11000) {
    statusCode = 409;
    errorType = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue)[0];
    userMessage = `A record with this ${field} already exists.`;
    shouldRetry = false;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    errorType = 'VALIDATION_ERROR';
    const messages = Object.values(err.errors).map(val => val.message);
    userMessage = messages.join('. ');
    shouldRetry = false;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'AUTHENTICATION_ERROR';
    userMessage = 'Invalid authentication token. Please log in again.';
    shouldRetry = false;
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'TOKEN_EXPIRED';
    userMessage = 'Your session has expired. Please log in again.';
    shouldRetry = false;
  }
  // Rate limiting
  else if (err.status === 429) {
    statusCode = 429;
    errorType = 'RATE_LIMIT_EXCEEDED';
    userMessage = 'Too many requests. Please try again later.';
    shouldRetry = true;
  }
  // Database connection errors
  else if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    statusCode = 503;
    errorType = 'DATABASE_CONNECTION_ERROR';
    userMessage = 'Service temporarily unavailable. Please try again.';
    shouldRetry = true;
  }
  // Custom application errors
  else if (err.statusCode) {
    statusCode = err.statusCode;
    errorType = 'APPLICATION_ERROR';
    userMessage = err.message;
    shouldRetry = statusCode >= 500;
  }

  // Record metrics
  errorMetrics.recordError(errorType, statusCode, req.originalUrl, responseTime);

  // Log error details
  await logError(err, req, {
    errorType,
    statusCode,
    responseTime,
    shouldRetry
  });

  // Six Sigma: Control - Structured error response
  const errorResponse = {
    success: false,
    error: {
      type: errorType,
      message: userMessage,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.id || `req_${Date.now()}`,
      shouldRetry,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack
      })
    }
  };

  // Agile: Add correlation ID for request tracking
  if (req.correlationId) {
    errorResponse.error.correlationId = req.correlationId;
  }

  res.status(statusCode).json(errorResponse);
};

// Health check endpoint for monitoring
const getHealthMetrics = (req, res) => {
  const metrics = errorMetrics.getMetrics();
  const healthStatus = {
    status: metrics.errorRate < 5 ? 'healthy' : metrics.errorRate < 15 ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    errorRate: metrics.errorRate,
    recentErrors: metrics.recentErrors,
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(healthStatus);
};

module.exports = { errorHandler, getHealthMetrics, errorMetrics };
