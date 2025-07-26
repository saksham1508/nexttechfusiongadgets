const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Six Sigma: Define - Comprehensive validation rules
class ValidationRules {
  // User validation rules
  static userRegistration() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
      
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
      
      body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      
      body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
    ];
  }

  static userLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  // Product validation rules
  static productCreation() {
    return [
      body('name')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Product name must be between 3 and 200 characters'),
      
      body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
      
      body('price')
        .isFloat({ min: 0.01, max: 999999.99 })
        .withMessage('Price must be a positive number up to 999,999.99'),
      
      body('category')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Category must be between 2 and 50 characters'),
      
      body('brand')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Brand must be between 1 and 50 characters'),
      
      body('countInStock')
        .isInt({ min: 0 })
        .withMessage('Stock count must be a non-negative integer'),
      
      body('images')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 images allowed'),
      
      body('specifications')
        .optional()
        .isObject()
        .withMessage('Specifications must be an object'),
      
      body('tags')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Maximum 20 tags allowed')
    ];
  }

  static productUpdate() {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid product ID'),
      
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Product name must be between 3 and 200 characters'),
      
      body('price')
        .optional()
        .isFloat({ min: 0.01, max: 999999.99 })
        .withMessage('Price must be a positive number up to 999,999.99'),
      
      body('countInStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock count must be a non-negative integer')
    ];
  }

  // Order validation rules
  static orderCreation() {
    return [
      body('orderItems')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
      
      body('orderItems.*.product')
        .isMongoId()
        .withMessage('Invalid product ID in order items'),
      
      body('orderItems.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
      
      body('shippingAddress.address')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
      
      body('shippingAddress.city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
      
      body('shippingAddress.postalCode')
        .trim()
        .matches(/^[0-9]{5,10}$/)
        .withMessage('Postal code must be 5-10 digits'),
      
      body('paymentMethod')
        .isIn(['stripe', 'paypal', 'cod'])
        .withMessage('Invalid payment method')
    ];
  }

  // Query parameter validation
  static productQuery() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be between 1 and 1000'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be non-negative'),
      
      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be non-negative'),
      
      query('category')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must be between 1 and 50 characters'),
      
      query('keyword')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search keyword must be between 1 and 100 characters')
    ];
  }

  // ID parameter validation
  static mongoIdParam(paramName = 'id') {
    return [
      param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`)
    ];
  }
}

// Agile: Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(422).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: formattedErrors,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

// Lean: Rate limiting to prevent abuse
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        type: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          type: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil(windowMs / 1000),
          timestamp: new Date().toISOString()
        }
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // Strict limits for authentication
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts. Please try again in 15 minutes.'),
  
  // Moderate limits for API calls
  api: createRateLimit(15 * 60 * 1000, 100, 'Too many API requests. Please try again in 15 minutes.'),
  
  // Lenient limits for general browsing
  general: createRateLimit(15 * 60 * 1000, 1000, 'Too many requests. Please try again in 15 minutes.'),
  
  // Strict limits for file uploads
  upload: createRateLimit(60 * 60 * 1000, 10, 'Too many upload attempts. Please try again in 1 hour.')
};

// Six Sigma: Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove potential XSS patterns
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeObject({ temp: item }).temp : sanitizeObject(item)
        );
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Request correlation ID for tracking
const addCorrelationId = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  req.startTime = Date.now();
  next();
};

module.exports = {
  ValidationRules,
  handleValidationErrors,
  rateLimits,
  sanitizeInput,
  addCorrelationId
};