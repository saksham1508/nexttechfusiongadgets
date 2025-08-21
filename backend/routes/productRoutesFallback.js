const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productControllerFallback');
const { auth, seller, adminAuth } = require('../middleware/authFallback');
const { ValidationRules, handleValidationErrors, rateLimits } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', rateLimits.general, getProducts);
router.get('/search', rateLimits.api, searchProducts);
router.get('/:id', rateLimits.general, getProductById);

// Protected routes - require authentication and seller role
router.post('/',
  rateLimits.api,
  auth,
  seller,
  createProduct
);

router.put('/:id',
  rateLimits.api,
  auth,
  seller,
  updateProduct
);

router.delete('/:id',
  rateLimits.api,
  auth,
  seller,
  deleteProduct
);

module.exports = router;