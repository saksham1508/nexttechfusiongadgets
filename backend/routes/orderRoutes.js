const express = require('express');
const real = require('../controllers/orderController');
const mock = require('../controllers/orderControllerFallback');
const inProd = process.env.NODE_ENV === 'production';
const { auth, adminAuth } = inProd ? require('../middleware/auth') : require('../middleware/authFallback');

const router = express.Router();

// Helper: detect Mongo connection for switching between real and mock controllers
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose');
    const mongoConnected = mongoose.connection.readyState === 1; // 1 = connected
    const forceMock = process.env.ENABLE_MOCK_DATA === 'true' && process.env.NODE_ENV === 'development';
    return mongoConnected && !forceMock;
  } catch (error) {
    return false;
  }
};

const pick = (realHandler, mockHandler) => async (req, res, next) => {
  try {
    if (isMongoAvailable()) {
      return await realHandler(req, res, next);
    } else {
      return await mockHandler(req, res, next);
    }
  } catch (err) {
    // Fall back to mock on failure
    return await mockHandler(req, res, next);
  }
};

router.route('/')
  .post(auth, pick(real.addOrderItems, mock.addOrderItems))
  .get(auth, adminAuth, pick(real.getOrders, mock.getOrders));

router.route('/myorders').get(auth, pick(real.getMyOrders, mock.getMyOrders));
router.route('/create-payment-intent').post(auth, pick(real.createPaymentIntent, mock.createPaymentIntent));
router.route('/:id').get(auth, pick(real.getOrderById, mock.getOrderById));
router.route('/:id/track').get(auth, pick(real.trackOrder, mock.trackOrder));
router.route('/:id/pay').put(auth, pick(real.updateOrderToPaid, mock.updateOrderToPaid));
router.route('/:id/deliver').put(auth, adminAuth, pick(real.updateOrderToDelivered, mock.updateOrderToDelivered));

module.exports = router;
