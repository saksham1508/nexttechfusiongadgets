// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { auth, optional } = require('../middleware/auth');
const PaymentMethod = require('../models/PaymentMethod');
const paymentService = require('../services/paymentService');
const instamojoRouter = require('./instamojoRoutes');

/* ---------------------------
   Helper: Error Response
---------------------------- */
const errorResponse = (res, error, status = 400) => {
  return res.status(status).json({ success: false, error: String(error) });
};

/* ---------------------------
   Payment Methods CRUD
---------------------------- */
router.route('/')
  .get(auth, asyncHandler(async (req, res) => {
    const methods = await PaymentMethod.find({ user: req.user._id, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({ success: true, count: methods.length, data: methods });
  }))
  .post(auth, asyncHandler(async (req, res) => {
    try {
      // Optional: if backend service does not implement, save directly
      if (typeof paymentService.addPaymentMethod !== 'function') {
        const method = await PaymentMethod.create({ ...req.body, user: req.user._id });
        return res.status(201).json({ success: true, data: method });
      }
      const method = await paymentService.addPaymentMethod(req.user, req.body);
      res.status(201).json({ success: true, data: method });
    } catch (err) {
      return errorResponse(res, err.message);
    }
  }));

router.route('/:id')
  .put(auth, asyncHandler(async (req, res) => {
    try {
      if (typeof paymentService.updatePaymentMethod !== 'function') {
        const updated = await PaymentMethod.findOneAndUpdate(
          { _id: req.params.id, user: req.user._id },
          req.body,
          { new: true }
        );
        return res.json({ success: true, data: updated });
      }
      const updated = await paymentService.updatePaymentMethod(req.user, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      return errorResponse(res, err.message, err.statusCode || 400);
    }
  }))
  .delete(auth, asyncHandler(async (req, res) => {
    try {
      if (typeof paymentService.deletePaymentMethod !== 'function') {
        await PaymentMethod.deleteOne({ _id: req.params.id, user: req.user._id });
        return res.json({ success: true, message: 'Payment method deleted successfully' });
      }
      await paymentService.deletePaymentMethod(req.user, req.params.id);
      res.json({ success: true, message: 'Payment method deleted successfully' });
    } catch (err) {
      return errorResponse(res, err.message);
    }
  }));

router.put('/:id/default', auth, asyncHandler(async (req, res) => {
  try {
    if (typeof paymentService.setDefaultPaymentMethod !== 'function') {
      // Unset previous defaults and set this one
      await PaymentMethod.updateMany({ user: req.user._id, _id: { $ne: req.params.id } }, { isDefault: false });
      const updated = await PaymentMethod.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isDefault: true },
        { new: true }
      );
    
      return res.json({ success: true, message: 'Default updated', data: updated });
    }
    const updated = await paymentService.setDefaultPaymentMethod(req.user, req.params.id);
    res.json({ success: true, message: 'Default updated', data: updated });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}));

/* ---------------------------
   INSTAMOJO (mounted under /instamojo)
---------------------------- */
router.use('/instamojo', instamojoRouter);

/* ---------------------------
   STRIPE
---------------------------- */
router.post('/stripe/create-intent', auth, asyncHandler(async (req, res) => {
  try {
    const svcFn = paymentService.createStripeIntent || paymentService.createStripePaymentIntent;
    if (typeof svcFn !== 'function') throw new Error('Stripe create intent not implemented');
    const data = await svcFn(req.user, req.body);
    res.json({ success: true, data });
  } catch (err) {
    return errorResponse(res, `Stripe: ${err.message}`);
  }
}));

router.post('/stripe/confirm-intent', auth, asyncHandler(async (req, res) => {
  try {
    const svcFn = paymentService.confirmStripeIntent || paymentService.confirmStripePayment;
    if (typeof svcFn !== 'function') throw new Error('Stripe confirm intent not implemented');
    const data = await svcFn(req.body.paymentIntentId);
    res.json({ success: true, data });
  } catch (err) {
    return errorResponse(res, `Stripe: ${err.message}`);
  }
}));

router.post('/webhooks/stripe', asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (typeof paymentService.handleStripeWebhook !== 'function') {
    return res.status(501).json({ success: false, error: 'Stripe webhook handler not implemented' });
  }
  const result = await paymentService.handleStripeWebhook(req.body, signature);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ received: true });
}));

/* ---------------------------
   RAZORPAY
---------------------------- */
router.post('/razorpay/create-order', optional, asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(req.body.amount, req.body.currency, req.body.receipt, req.body.notes);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/razorpay/verify', optional, asyncHandler(async (req, res) => {
  const result = await paymentService.verifyRazorpayPayment(req.body.razorpay_order_id, req.body.razorpay_payment_id, req.body.razorpay_signature);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/webhooks/razorpay', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (typeof paymentService.handleRazorpayWebhook !== 'function') {
    return res.status(501).json({ success: false, error: 'Razorpay webhook handler not implemented' });
  }
  const result = await paymentService.handleRazorpayWebhook(req.body, signature);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ status: 'ok' });
}));

/* ---------------------------
   PAYPAL
---------------------------- */
router.post('/paypal/create-order', optional, asyncHandler(async (req, res) => {
  const result = await paymentService.createPayPalOrder(req.body.amount, req.body.currency, req.body.items, req.body.returnUrl, req.body.cancelUrl);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/paypal/capture/:orderId', optional, asyncHandler(async (req, res) => {
  const result = await paymentService.capturePayPalOrder(req.params.orderId);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

/* ---------------------------
   PAYTM
---------------------------- */
router.post('/paytm/initiate', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.createPaytmTransaction !== 'function') {
    return res.status(501).json({ success: false, error: 'Paytm initiate not implemented' });
  }
  const result = await paymentService.createPaytmTransaction(req.body);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/paytm/status', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.verifyPaytmTransactionStatus !== 'function') {
    return res.status(501).json({ success: false, error: 'Paytm status not implemented' });
  }
  const result = await paymentService.verifyPaytmTransactionStatus(req.body.orderId);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/paytm/callback', asyncHandler(async (req, res) => {
  if (typeof paymentService.verifyPaytmCallback !== 'function') {
    return res.status(501).send('Paytm callback verify not implemented');
  }
  const result = await paymentService.verifyPaytmCallback(req.body);
  if (!result.success) return errorResponse(res, result.error);
  res.redirect(`${process.env.FRONTEND_URL}/payment/${result.data.STATUS === 'TXN_SUCCESS' ? 'success' : 'failure'}?orderId=${result.data.ORDERID}`);
}));

/* ---------------------------
   PHONEPE
---------------------------- */
router.post('/phonepe/create-order', optional, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  // Support both old style (amount,currency,orderId,phone) and new style (object)
  const result = await (typeof paymentService.createPhonePeOrder === 'function'
    ? paymentService.createPhonePeOrder(payload.amount || payload, payload.currency || 'INR', payload.orderId || payload.order_id, payload.userPhone || payload.phone || payload.mobileNumber, payload.redirectUrl, payload.callbackUrl)
    : Promise.resolve({ success: false, error: 'PhonePe create-order not implemented' }));
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data || result });
}));

router.post('/phonepe/verify', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.verifyPhonePePayment !== 'function') {
    return res.status(501).json({ success: false, error: 'PhonePe verify not implemented' });
  }
  const result = await paymentService.verifyPhonePePayment(req.body.transactionId, req.body.checksum);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.get('/phonepe/status/:transactionId', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.checkPhonePeStatus !== 'function') {
    return res.status(501).json({ success: false, error: 'PhonePe status not implemented' });
  }
  const result = await paymentService.checkPhonePeStatus(req.params.transactionId);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/phonepe/callback', asyncHandler(async (req, res) => {
  const transactionId = req.body?.transactionId || req.body?.data?.merchantTransactionId;
  if (!transactionId) return errorResponse(res, 'Transaction ID missing');

  if (typeof paymentService.checkPhonePeStatus !== 'function') {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?transactionId=${transactionId}`);
  }
  const result = await paymentService.checkPhonePeStatus(transactionId);
  res.redirect(`${process.env.FRONTEND_URL}/payment/${result.success ? 'success' : 'failure'}?transactionId=${transactionId}`);
}));

/* ---------------------------
   UPI & GOOGLE PAY
---------------------------- */
router.post('/upi/create', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.createUPIPayment !== 'function') {
    return res.status(501).json({ success: false, error: 'UPI create not implemented' });
  }
  const result = await paymentService.createUPIPayment(req.body);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/googlepay/create', auth, asyncHandler(async (req, res) => {
  if (typeof paymentService.createGooglePayPayment !== 'function') {
    return res.status(501).json({ success: false, error: 'Google Pay create not implemented' });
  }
  const result = await paymentService.createGooglePayPayment(req.body);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

router.post('/googlepay/process', auth, asyncHandler(async (req, res) => {
  if (typeof paymentService.processGooglePayToken !== 'function') {
    return res.status(501).json({ success: false, error: 'Google Pay process not implemented' });
  }
  const result = await paymentService.processGooglePayToken(req.body);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

/* ---------------------------
   REFUNDS
---------------------------- */
router.post('/refund', auth, asyncHandler(async (req, res) => {
  // Route expects { provider, ... }
  const { provider } = req.body || {};
  try {
    let result;
    if (provider === 'stripe' && typeof paymentService.createStripeRefund === 'function') {
      const { paymentIntentId, amount, reason } = req.body;
      result = await paymentService.createStripeRefund(paymentIntentId, amount, reason);
    } else if (provider === 'razorpay' && typeof paymentService.createRazorpayRefund === 'function') {
      const { paymentId, amount, notes } = req.body;
      result = await paymentService.createRazorpayRefund(paymentId, amount, notes);
    } else {
      return res.status(501).json({ success: false, error: 'Refund provider not implemented' });
    }

    if (!result.success) return errorResponse(res, result.error);
    res.json({ success: true, data: result.data });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}));

router.post('/phonepe/refund-status', optional, asyncHandler(async (req, res) => {
  if (typeof paymentService.getPhonePeRefundStatus !== 'function') {
    return res.status(501).json({ success: false, error: 'PhonePe refund status not implemented' });
  }
  const result = await paymentService.getPhonePeRefundStatus(req.body.refundId);
  if (!result.success) return errorResponse(res, result.error);
  res.json({ success: true, data: result.data });
}));

module.exports = router;
