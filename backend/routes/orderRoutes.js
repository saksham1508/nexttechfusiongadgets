const express = require('express');
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  createPaymentIntent
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(auth, addOrderItems).get(auth, adminAuth, getOrders);
router.route('/myorders').get(auth, getMyOrders);
router.route('/create-payment-intent').post(auth, createPaymentIntent);
router.route('/:id').get(auth, getOrderById);
router.route('/:id/pay').put(auth, updateOrderToPaid);
router.route('/:id/deliver').put(auth, adminAuth, updateOrderToDelivered);

module.exports = router;
