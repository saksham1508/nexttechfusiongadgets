const express = require('express');

// Check if MongoDB is available
const mongoose = require('mongoose');
const isMongoConnected = mongoose.connection.readyState === 1;

// Use appropriate middleware and controller based on MongoDB availability
let auth, cartController;
if (isMongoConnected) {
  auth = require('../middleware/auth').auth;
  cartController = require('../controllers/cartController');
} else {
  console.log('🔄 Using mock cart controller and auth (MongoDB not available)');
  auth = require('../middleware/mockAuth').auth;
  cartController = require('../controllers/mockCartController');
}

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = cartController;

const router = express.Router();

router.use(auth);

router.route('/').get(getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
