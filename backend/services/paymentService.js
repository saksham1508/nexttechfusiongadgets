const crypto = require('crypto');
const PaytmChecksum = (() => { try { return require('paytmchecksum'); } catch (e) { return null; } })();
// dynamic import for node-fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Initialize Stripe (only if API key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_51234567890abcdef') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Initialize Razorpay (only if API keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_1234567890abcdef') {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// PayPal configuration (only if API keys are provided)
let paypal = null;
let paypalClient = null;

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && 
    process.env.PAYPAL_CLIENT_ID !== 'AYourPayPalClientId1234567890') {
  paypal = require('@paypal/checkout-server-sdk');
  paypalClient = () => {
    const environment = process.env.PAYPAL_MODE === 'production' 
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
    
    return new paypal.core.PayPalHttpClient(environment);
  };
}

class PaymentService {
  // Stripe Payment Methods
  async createStripePaymentIntent(amount, currency = 'usd', paymentMethodId, customerId, metadata = {}) {
    try {
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        payment_method: paymentMethodId,
        customer: customerId,
        confirmation_method: 'manual',
        confirm: true,
        metadata,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
      });

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
          paymentIntentId: paymentIntent.id,
          requiresAction: paymentIntent.status === 'requires_action',
          nextAction: paymentIntent.next_action,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return {
        success: true,
        data: {
          status: paymentIntent.status,
          paymentIntentId: paymentIntent.id
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createStripeCustomer(email, name, metadata = {}) {
    try {
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.'
        };
      }

      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Razorpay Payment Methods
  async createRazorpayOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      if (!razorpay) {
        // Return mock data for development
        console.log('🔄 Using mock Razorpay order for development');
        return {
          success: true,
          data: {
            orderId: `order_mock_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            status: 'created'
          }
        };
      }

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
        payment_capture: 1
      });

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      if (!razorpay) {
        // Return mock verification for development
        console.log('🔄 Using mock Razorpay verification for development');
        return {
          success: true,
          data: {
            paymentId: razorpayPaymentId,
            orderId: razorpayOrderId,
            status: 'captured',
            amount: 100000, // Mock amount in paise
            currency: 'INR',
            method: 'upi',
            captured: true
          }
        };
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpaySignature;

      if (isAuthentic) {
        // Fetch payment details
        const payment = await razorpay.payments.fetch(razorpayPaymentId);
        return {
          success: true,
          data: {
            paymentId: payment.id,
            orderId: payment.order_id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            captured: payment.captured
          }
        };
      } else {
        return {
          success: false,
          error: 'Invalid payment signature'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async captureRazorpayPayment(paymentId, amount) {
    try {
      const payment = await razorpay.payments.capture(paymentId, amount * 100);
      return {
        success: true,
        data: payment
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // PayPal Payment Methods
  async createPayPalOrder(amount, currency = 'USD', items = [], returnUrl, cancelUrl) {
    try {
      if (!paypal || !paypalClient) {
        return {
          success: false,
          error: 'PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables.'
        };
      }

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'NextTechFusionGadgets',
          locale: 'en-US',
          landing_page: 'BILLING',
          shipping_preference: 'GET_FROM_FILE',
          user_action: 'PAY_NOW'
        },
        purchase_units: [{
          reference_id: 'PUHF',
          description: 'NextTechFusionGadgets Purchase',
          custom_id: 'CUST-HighFashions',
          soft_descriptor: 'HighFashions',
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            description: item.description || '',
            unit_amount: {
              currency_code: currency,
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString(),
            category: 'PHYSICAL_GOODS'
          }))
        }]
      });

      const client = paypalClient();
      const response = await client.execute(request);

      return {
        success: true,
        data: {
          orderId: response.result.id,
          status: response.result.status,
          links: response.result.links
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async capturePayPalOrder(orderId) {
    try {
      if (!paypal || !paypalClient) {
        return {
          success: false,
          error: 'PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables.'
        };
      }

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const client = paypalClient();
      const response = await client.execute(request);

      return {
        success: true,
        data: {
          orderId: response.result.id,
          status: response.result.status,
          paymentSource: response.result.payment_source,
          purchaseUnits: response.result.purchase_units
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // UPI Payment Methods (Mock implementation - integrate with actual UPI gateway)
  async createUPIPayment(amount, currency = 'INR', upiId, merchantId, transactionId) {
    try {
      // This is a mock implementation
      // In production, integrate with actual UPI payment gateway like Paytm, PhonePe, etc.
      
      const upiPaymentData = {
        paymentId: `upi_${Date.now()}`,
        amount: amount,
        currency: currency,
        upiId: upiId,
        merchantId: merchantId,
        transactionId: transactionId,
        status: 'pending',
        qrCode: this.generateUPIQRCode(amount, upiId, merchantId, transactionId),
        deepLink: this.generateUPIDeepLink(amount, upiId, merchantId, transactionId)
      };

      return {
        success: true,
        data: upiPaymentData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateUPIQRCode(amount, upiId, merchantId, transactionId) {
    // Generate UPI QR code string
    const upiString = `upi://pay?pa=${upiId}&pn=NextTechFusionGadgets&mc=5411&tid=${transactionId}&tr=${transactionId}&tn=Payment%20for%20order&am=${amount}&cu=INR`;
    return upiString;
  }

  generateUPIDeepLink(amount, upiId, merchantId, transactionId) {
    // Generate UPI deep link for mobile apps
    return `upi://pay?pa=${upiId}&pn=NextTechFusionGadgets&mc=5411&tid=${transactionId}&tr=${transactionId}&tn=Payment%20for%20order&am=${amount}&cu=INR`;
  }

  // Google Pay Integration (Web)
  async createGooglePayPayment(amount, currency = 'INR', orderId) {
    try {
      // This creates the payment data for Google Pay Web API
      const paymentData = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'razorpay', // or 'stripe'
              gatewayMerchantId: process.env.RAZORPAY_KEY_ID || 'demo_merchant'
            }
          }
        }],
        merchantInfo: {
          merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || 'demo_merchant',
          merchantName: 'NextTechFusionGadgets'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toString(),
          currencyCode: currency,
          countryCode: currency === 'INR' ? 'IN' : 'US'
        }
      };

      return {
        success: true,
        data: {
          paymentData,
          orderId,
          amount,
          currency
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processGooglePayToken(amount, currency = 'INR', orderId, paymentToken, userId, testMode = false) {
    try {
      if (testMode) {
        // In test mode, simulate successful payment processing
        return {
          success: true,
          data: {
            transactionId: `gp_test_${Date.now()}`,
            status: 'completed',
            amount,
            currency,
            orderId,
            userId,
            paymentMethod: 'googlepay',
            testMode: true,
            processedAt: new Date().toISOString()
          }
        };
      }

      // In production, process the payment token with the actual payment gateway
      // This would typically involve:
      // 1. Validating the payment token
      // 2. Processing the payment with Razorpay/Stripe
      // 3. Storing the transaction details
      
      // For now, we'll simulate a successful payment
      const transactionId = `gp_${Date.now()}`;
      
      // Here you would integrate with your chosen payment gateway
      // Example with Razorpay:
      // const paymentResult = await this.processRazorpayGooglePayToken(paymentToken, amount, currency);
      
      return {
        success: true,
        data: {
          transactionId,
          status: 'completed',
          amount,
          currency,
          orderId,
          userId,
          paymentMethod: 'googlepay',
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Webhook handlers
  async handleStripeWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleRazorpayWebhook(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature === signature) {
        return {
          success: true,
          data: payload
        };
      } else {
        return {
          success: false,
          error: 'Invalid webhook signature'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Paytm UPI (Staging/Live) - Initiate Transaction
  async createPaytmTransaction({ amount, orderId, customerId, email, mobile, callbackUrl, testMode = true }) {
    try {
      if (!PaytmChecksum) {
        return { success: false, error: 'paytmchecksum package not installed. Run: npm i paytmchecksum' };
      }

      const MID = process.env.PAYTM_MID;
      const MKEY = process.env.PAYTM_KEY;
      const WEBSITE = process.env.PAYTM_WEBSITE || (testMode ? 'WEBSTAGING' : 'DEFAULT');
      const CALLBACK = callbackUrl || process.env.PAYTM_CALLBACK;

      if (!MID || !MKEY) {
        return { success: false, error: 'PAYTM_MID/PAYTM_KEY missing in environment' };
      }

      const txnAmount = Number(amount).toFixed(2);
      const baseUrl = testMode ? 'https://securegw-stage.paytm.in' : 'https://securegw.paytm.in';

      const body = {
        requestType: 'Payment',
        mid: MID,
        websiteName: WEBSITE,
        orderId: orderId,
        callbackUrl: CALLBACK,
        txnAmount: { value: txnAmount, currency: 'INR' },
        userInfo: { custId: customerId || 'CUST_' + Date.now(), email, mobile }
      };

      const checksum = await PaytmChecksum.generateSignature(JSON.stringify(body), MKEY);

      const response = await fetch(`${baseUrl}/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, head: { signature: checksum } })
      });
      const data = await response.json();

      if (!data || !data.body) {
        return { success: false, error: 'Invalid response from Paytm' };
      }

      return {
        success: true,
        data: {
          mid: MID,
          orderId,
          amount: txnAmount,
          txnToken: data.body.txnToken,
          callbackUrl: CALLBACK,
          baseUrl,
          env: testMode ? 'staging' : 'production'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Paytm callback verification
  async verifyPaytmCallback(callbackBody) {
    try {
      if (!PaytmChecksum) {
        return { success: false, error: 'paytmchecksum package not installed' };
      }

      const MKEY = process.env.PAYTM_KEY;
      const paytmParams = { ...callbackBody };
      const paytmChecksum = paytmParams.CHECKSUMHASH;
      delete paytmParams.CHECKSUMHASH;

      const isValid = PaytmChecksum.verifySignature(paytmParams, MKEY, paytmChecksum);
      if (!isValid) {
        return { success: false, error: 'Invalid Paytm checksum' };
      }

      return { success: true, data: paytmParams };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Refund methods
  async createStripeRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      return {
        success: true,
        data: refund
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createRazorpayRefund(paymentId, amount, notes = {}) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100),
        notes
      });

      return {
        success: true,
        data: refund
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();