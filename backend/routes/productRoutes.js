const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductAnalytics,
  bulkUpdateProducts,
  searchProducts
} = require('../controllers/productController');
const { protect, seller, admin } = require('../middleware/auth');
const { ValidationRules, handleValidationErrors, rateLimits } = require('../middleware/validation');

const router = express.Router();

// Six Sigma: Define - Apply appropriate rate limiting and validation to each endpoint
// Public routes with general rate limiting
router.get('/', rateLimits.general, ValidationRules.productQuery(), handleValidationErrors, getProducts);
router.get('/search', rateLimits.api, ValidationRules.productQuery(), handleValidationErrors, searchProducts);
router.get('/:id', rateLimits.general, ValidationRules.mongoIdParam(), handleValidationErrors, getProductById);

// Protected routes with API rate limiting
router.post('/', 
  rateLimits.api, 
  protect, 
  seller,
  ValidationRules.productCreation(), 
  handleValidationErrors, 
  createProduct
);

router.put('/:id', 
  rateLimits.api, 
  protect, 
  seller,
  ValidationRules.productUpdate(), 
  handleValidationErrors, 
  updateProduct
);

router.delete('/:id', 
  rateLimits.api, 
  protect, 
  seller,
  ValidationRules.mongoIdParam(), 
  handleValidationErrors, 
  deleteProduct
);

// Review routes
router.post('/:id/reviews', 
  rateLimits.api, 
  protect, 
  ValidationRules.mongoIdParam(), 
  handleValidationErrors, 
  createProductReview
);

// Admin-only routes with stricter rate limiting
router.get('/admin/analytics', 
  rateLimits.api, 
  protect, 
  admin, 
  getProductAnalytics
);

router.patch('/admin/bulk', 
  rateLimits.api, 
  protect, 
  admin, 
  bulkUpdateProducts
);

// Agile: Health check endpoint for this route group
router.get('/health/status', (req, res) => {
  res.json({
    service: 'products',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
