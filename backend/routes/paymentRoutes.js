const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { auth, optional } = require('../middleware/auth');
const PaymentMethod = require('../models/PaymentMethod');
const paymentService = require('../services/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get user's payment methods
// @route   GET /api/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await PaymentMethod.find({
    user: req.user._id,
    isActive: true
  }).sort({ isDefault: -1, createdAt: -1 });

  res.json({
    success: true,
    count: paymentMethods.length,
    data: paymentMethods
  });
});

// @desc    Add payment method
// @route   POST /api/payment-methods
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
  const {
    type,
    provider,
    paymentMethodId, // From Stripe or other provider
    nickname,
    billingAddress,
    isDefault = false
  } = req.body;
  
  let paymentMethodData = {
    user: req.user._id,
    type,
    provider,
    nickname,
    billingAddress,
    isDefault
  };
  
  // Handle different payment providers
  if (provider === 'stripe' && paymentMethodId) {
    try {
      // Retrieve payment method from Stripe
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Attach to customer if not already attached
      if (!stripePaymentMethod.customer) {
        let customerId = req.user.stripeCustomerId;
        
        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: req.user.email,
            name: req.user.name,
            metadata: {
              userId: req.user._id.toString()
            }
          });
          customerId = customer.id;
          
          // Update user with Stripe customer ID
          const User = require('../models/User');
          await User.findByIdAndUpdate(req.user._id, {
            stripeCustomerId: customerId
          });
        }
        
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId
        });
      }
      
      // Extract card details
      if (stripePaymentMethod.type === 'card') {
        paymentMethodData.card = {
          last4: stripePaymentMethod.card.last4,
          brand: stripePaymentMethod.card.brand,
          expMonth: stripePaymentMethod.card.exp_month,
          expYear: stripePaymentMethod.card.exp_year,
          fingerprint: stripePaymentMethod.card.fingerprint,
          funding: stripePaymentMethod.card.funding,
          country: stripePaymentMethod.card.country
        };
      }
      
      paymentMethodData.providerData = {
        customerId: stripePaymentMethod.customer,
        paymentMethodId: stripePaymentMethod.id
      };
      
    } catch (error) {
      res.status(400);
      throw new Error(`Stripe error: ${error.message}`);
    }
  }
  
  const paymentMethod = await PaymentMethod.create(paymentMethodData);
  
  res.status(201).json({
    success: true,
    data: paymentMethod
  });
});

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!paymentMethod) {
    res.status(404);
    throw new Error('Payment method not found');
  }
  
  const { nickname, billingAddress, isDefault } = req.body;
  
  const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
    req.params.id,
    { nickname, billingAddress, isDefault },
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    data: updatedPaymentMethod
  });
});

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!paymentMethod) {
    res.status(404);
    throw new Error('Payment method not found');
  }
  
  // If it's a Stripe payment method, detach it
  if (paymentMethod.provider === 'stripe' && paymentMethod.providerData.paymentMethodId) {
    try {
      await stripe.paymentMethods.detach(paymentMethod.providerData.paymentMethodId);
    } catch (error) {
      console.error('Error detaching Stripe payment method:', error);
    }
  }
  
  await paymentMethod.deleteOne();
  
  res.json({
    success: true,
    message: 'Payment method deleted successfully'
  });
});

// @desc    Set default payment method
// @route   PUT /api/payment-methods/:id/default
// @access  Private
const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!paymentMethod) {
    res.status(404);
    throw new Error('Payment method not found');
  }
  
  // Remove default from all other payment methods
  await PaymentMethod.updateMany(
    { user: req.user._id },
    { isDefault: false }
  );
  
  // Set this one as default
  paymentMethod.isDefault = true;
  await paymentMethod.save();
  
  res.json({
    success: true,
    message: 'Default payment method updated',
    data: paymentMethod
  });
});

// @desc    Create payment intent
// @route   POST /api/payment-methods/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd', paymentMethodId, orderId } = req.body;
  
  if (!amount || !paymentMethodId) {
    res.status(400);
    throw new Error('Amount and payment method are required');
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      customer: req.user.stripeCustomerId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId: req.user._id.toString(),
        orderId: orderId || ''
      }
    });
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      }
    });
    
  } catch (error) {
    res.status(400);
    throw new Error(`Payment failed: ${error.message}`);
  }
});

// @desc    Confirm payment intent
// @route   POST /api/payment-methods/confirm-intent
// @access  Private
const confirmPaymentIntent = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  
  if (!paymentIntentId) {
    res.status(400);
    throw new Error('Payment intent ID is required');
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    
    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      }
    });
    
  } catch (error) {
    res.status(400);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payment-methods/razorpay/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error('Amount is required');
  }
  
  const result = await paymentService.createRazorpayOrder(amount, currency, receipt, notes);
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment-methods/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing required payment verification data');
  }
  
  const result = await paymentService.verifyRazorpayPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Create PayPal order
// @route   POST /api/payment-methods/paypal/create-order
// @access  Private
const createPayPalOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'USD', items, returnUrl, cancelUrl } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error('Amount is required');
  }
  
  const result = await paymentService.createPayPalOrder(
    amount,
    currency,
    items || [],
    returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
    cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
  );
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Capture PayPal order
// @route   POST /api/payment-methods/paypal/capture/:orderId
// @access  Private
const capturePayPalOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }
  
  const result = await paymentService.capturePayPalOrder(orderId);
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Create UPI payment
// @route   POST /api/payment-methods/upi/create
// @access  Private
const createUPIPayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', upiId, transactionId } = req.body;
  
  if (!amount || !upiId) {
    res.status(400);
    throw new Error('Amount and UPI ID are required');
  }
  
  const result = await paymentService.createUPIPayment(
    amount,
    currency,
    upiId,
    process.env.UPI_MERCHANT_ID,
    transactionId || `txn_${Date.now()}`
  );
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Create Google Pay payment data
// @route   POST /api/payment-methods/googlepay/create
// @access  Private
const createGooglePayPayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderId } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error('Amount is required');
  }
  
  const result = await paymentService.createGooglePayPayment(
    amount,
    currency,
    orderId || `order_${Date.now()}`
  );
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Process Google Pay payment token
// @route   POST /api/payment-methods/googlepay/process
// @access  Private
const processGooglePayPayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderId, paymentToken, testMode = false } = req.body;
  
  if (!amount || !paymentToken) {
    res.status(400);
    throw new Error('Amount and payment token are required');
  }
  
  const result = await paymentService.processGooglePayToken(
    amount,
    currency,
    orderId,
    paymentToken,
    req.user._id,
    testMode
  );
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Handle Stripe webhook
// @route   POST /api/payment-methods/webhooks/stripe
// @access  Public
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  const result = await paymentService.handleStripeWebhook(req.body, signature);
  
  if (result.success) {
    const event = result.data;
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Handle Razorpay webhook
// @route   POST /api/payment-methods/webhooks/razorpay
// @access  Public
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  const result = await paymentService.handleRazorpayWebhook(req.body, signature);
  
  if (result.success) {
    const event = result.data;
    
    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity);
        break;
      case 'payment.failed':
        console.log('Payment failed:', event.payload.payment.entity);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }
    
    res.json({ status: 'ok' });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// @desc    Create refund
// @route   POST /api/payment-methods/refund
// @access  Private
const createRefund = asyncHandler(async (req, res) => {
  const { provider, paymentId, amount, reason } = req.body;
  
  if (!provider || !paymentId) {
    res.status(400);
    throw new Error('Provider and payment ID are required');
  }
  
  let result;
  
  switch (provider) {
    case 'stripe':
      result = await paymentService.createStripeRefund(paymentId, amount, reason);
      break;
    case 'razorpay':
      result = await paymentService.createRazorpayRefund(paymentId, amount, { reason });
      break;
    default:
      res.status(400);
      throw new Error('Unsupported payment provider');
  }
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(400);
    throw new Error(result.error);
  }
});

// Routes
router.route('/')
  .get(auth, getPaymentMethods)
  .post(auth, addPaymentMethod);

router.route('/:id')
  .put(auth, updatePaymentMethod)
  .delete(auth, deletePaymentMethod);

router.put('/:id/default', auth, setDefaultPaymentMethod);

// Stripe routes
router.post('/create-intent', auth, createPaymentIntent);
router.post('/confirm-intent', auth, confirmPaymentIntent);

// Razorpay routes
router.post('/razorpay/create-order', auth, createRazorpayOrder);
router.post('/razorpay/verify', auth, verifyRazorpayPayment);

// PayPal routes
router.post('/paypal/create-order', auth, createPayPalOrder);
router.post('/paypal/capture/:orderId', auth, capturePayPalOrder);

// Paytm routes
router.post('/paytm/initiate', optional, asyncHandler(async (req, res) => {
  const { amount, orderId, customerId, email, mobile, testMode } = req.body;
  if (!amount || !orderId) {
    res.status(400);
    throw new Error('amount and orderId are required');
  }
  const result = await paymentService.createPaytmTransaction({ amount, orderId, customerId, email, mobile, testMode });
  if (result.success) {
    return res.json({ success: true, data: result.data });
  }
  res.status(400);
  throw new Error(result.error);
}));

router.post('/paytm/callback', asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPaytmCallback(req.body);
  if (!result.success) {
    res.status(400);
    throw new Error(result.error);
  }
  // You can update order status here based on result.data.STATUS
  return res.json({ success: true, data: result.data });
}));

// UPI routes (public for demo)
router.post('/upi/create', optional, createUPIPayment);

// Google Pay routes
router.post('/googlepay/create', auth, createGooglePayPayment);
router.post('/googlepay/process', auth, processGooglePayPayment);

// Webhook routes (public)
router.post('/webhooks/stripe', handleStripeWebhook);
router.post('/webhooks/razorpay', handleRazorpayWebhook);

// Refund routes
router.post('/refund', auth, createRefund);

module.exports = router;