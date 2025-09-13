const express = require('express');
const { auth: realAuth } = require('../middleware/auth');
const inProd = process.env.NODE_ENV === 'production';
let mockAuth;
if (!inProd) {
  ({ auth: mockAuth } = require('../middleware/authFallback'));
}
const { getVendorAnalytics } = require('../controllers/vendorAnalyticsController');
const { listVendorOrders, updateItemStatus } = require('../controllers/vendorOrderController');

const router = express.Router();

// Auth selector: if token is a mock vendor token, use mock auth; otherwise use real auth
const chooseAuth = (req, res, next) => {
  if (inProd) {
    return realAuth(req, res, next);
  }
  try {
    const authHeader = req.headers.authorization || '';
    if (mockAuth && authHeader.startsWith('Bearer mock_vendor_token_')) {
      return mockAuth(req, res, next);
    }
  } catch (_) {}
  return realAuth(req, res, next);
};

// Vendor analytics (seller only)
router.get('/analytics', chooseAuth, getVendorAnalytics);

// Vendor orders list and item status updates
router.get('/orders', chooseAuth, listVendorOrders);
router.patch('/orders/:orderId/items/:itemId/status', chooseAuth, updateItemStatus);

module.exports = router;