const express = require('express');
const router = express.Router();
const Insta = require('instamojo-nodejs');

// Env variables
const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
const INSTAMOJO_SANDBOX = (process.env.INSTAMOJO_SANDBOX || 'true').toLowerCase() === 'true';
const INSTAMOJO_REDIRECT_URL = process.env.INSTAMOJO_REDIRECT_URL || 'http://localhost:5000/api/payments/instamojo/payment-success';
const INSTAMOJO_WEBHOOK_URL = process.env.INSTAMOJO_WEBHOOK_URL || null;

if (!INSTAMOJO_API_KEY || !INSTAMOJO_AUTH_TOKEN) {
  console.warn('⚠️ Instamojo keys are not set. Please configure INSTAMOJO_API_KEY and INSTAMOJO_AUTH_TOKEN.');
}

// Init
Insta.setKeys(INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN);
Insta.isSandboxMode(INSTAMOJO_SANDBOX);

// --------------------------------
// Create Payment
// --------------------------------
router.post('/pay', (req, res) => {
  try {
    const { amount, purpose, buyer_name, email, phone, redirectUrl } = req.body;

    if (!amount || !purpose || !email) {
      return res.status(400).json({ success: false, message: 'amount, purpose and email are required' });
    }

    const data = new Insta.PaymentData();
    data.purpose = purpose;
    data.amount = amount;
    if (buyer_name) data.buyer_name = buyer_name;
    data.email = email;
    if (phone) data.phone = phone;

    data.redirect_url = redirectUrl || INSTAMOJO_REDIRECT_URL;
    if (INSTAMOJO_WEBHOOK_URL) data.webhook = INSTAMOJO_WEBHOOK_URL;

    data.send_email = 'true';
    data.send_sms = 'false';
    data.allow_repeated_payments = 'false';

    Insta.createPayment(data, (error, response) => {
      if (error) {
        console.error('Instamojo createPayment error:', error);
        return res.status(500).json({ success: false, error: 'Failed to create payment' });
      }
      try {
        const responseData = JSON.parse(response);
        return res.json({
          success: true,
          payment_request: responseData.payment_request,
          payment_url: responseData.payment_request.longurl
        });
      } catch (parseErr) {
        console.error('Instamojo response parse error:', parseErr);
        return res.status(500).json({ success: false, error: 'Invalid response from payment gateway' });
      }
    });
  } catch (e) {
    console.error('Instamojo /pay handler error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// --------------------------------
// Payment Success (redirect)
// --------------------------------
router.get('/payment-success', (req, res) => {
  const { payment_id, payment_request_id } = req.query;

  if (!payment_request_id) {
    return res.status(400).send('Missing payment_request_id');
  }

  Insta.getPaymentRequest(payment_request_id, (error, response) => {
    if (error) {
      console.error('Instamojo verify error:', error);
      return res.status(500).send('Payment verification failed');
    }
    try {
      const data = JSON.parse(response);
      return res.json({ success: true, data });
    } catch (e) {
      console.error('Instamojo verify parse error:', e);
      return res.status(500).send('Payment verification parse failed');
    }
  });
});

// --------------------------------
// Webhook
// --------------------------------
router.post('/webhook', (req, res) => {
  try {
    console.log('Instamojo webhook payload:', req.body);
    // TODO: Verify X-Instamojo-Signature (HMAC) before trusting
    return res.sendStatus(200);
  } catch (e) {
    console.error('Instamojo webhook handler error:', e);
    return res.sendStatus(500);
  }
});

// --------------------------------
// Alias: create-order
// --------------------------------
router.post('/create-order', (req, res) => {
  const { name, email, phone, amount, redirectUrl } = req.body;
  if (!amount || !email) {
    return res.status(400).json({ success: false, message: 'amount and email are required' });
  }

  const data = new Insta.PaymentData();
  data.purpose = 'Product Purchase';
  data.amount = amount;
  if (name) data.buyer_name = name;
  data.email = email;
  if (phone) data.phone = phone;

  data.redirect_url = redirectUrl || INSTAMOJO_REDIRECT_URL;
  data.send_email = 'true';
  data.send_sms = 'true';
  data.allow_repeated_payments = 'false';

  Insta.createPayment(data, (error, response) => {
    if (error) {
      console.error('Instamojo createPayment error:', error);
      return res.status(500).json({ success: false, error: 'Failed to create payment' });
    }
    try {
      const responseData = JSON.parse(response);
      return res.json({
        success: true,
        payment_request: responseData.payment_request,
        payment_url: responseData.payment_request.longurl
      });
    } catch (parseErr) {
      console.error('Instamojo response parse error:', parseErr);
      return res.status(500).json({ success: false, error: 'Invalid response from payment gateway' });
    }
  });
});

// --------------------------------
// Verify by payment_request_id
// --------------------------------
router.get('/verify/:payment_request_id', (req, res) => {
  const paymentRequestId = req.params.payment_request_id;
  if (!paymentRequestId) {
    return res.status(400).json({ success: false, message: 'Missing payment_request_id' });
  }

  const verifyFn = (typeof Insta.getPaymentRequestDetails === 'function')
    ? Insta.getPaymentRequestDetails.bind(Insta)
    : Insta.getPaymentRequest.bind(Insta);

  verifyFn(paymentRequestId, (error, response) => {
    if (error) {
      console.error('Instamojo verify error:', error);
      return res.status(500).json({ success: false, error: 'Payment verification failed' });
    }
    try {
      const data = JSON.parse(response);
      const status = data?.payments && data.payments[0]?.status;
      const success = String(status || '').toLowerCase() === 'credit';
      return res.json({ success, payment: data });
    } catch (e) {
      console.error('Instamojo verify parse error:', e);
      return res.status(500).json({ success: false, error: 'Payment verification parse failed' });
    }
  });
});

module.exports = router;
