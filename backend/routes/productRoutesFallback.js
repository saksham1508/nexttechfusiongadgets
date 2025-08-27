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

// Track product click/view explicitly in mock mode
router.post('/:id/track', rateLimits.api, (req, res) => {
  try {
    const { getMockProducts } = require('../controllers/productControllerFallback');
    const list = getMockProducts();
    const p = list.find(x => x._id === req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
    p.analytics = p.analytics || { views: 0, clicks: 0 };
    p.analytics.clicks = Number(p.analytics.clicks || 0) + 1;
    p.updatedAt = new Date();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Track failed' });
  }
});

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