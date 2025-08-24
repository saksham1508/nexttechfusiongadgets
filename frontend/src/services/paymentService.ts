import { loadStripe, Stripe } from '@stripe/stripe-js';
import api from './api';
import { PaymentProvider, RazorpayOrder, PayPalOrder, UPIPayment, GooglePayPayment } from '../types';

// Initialize Stripe with error handling
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '').catch((error) => {
      console.error('Failed to load Stripe.js:', error);
      return null;
    });
  }
  return stripePromise;
};

// Declare global types for external payment libraries
declare global {
  interface Window {
    Razorpay: any;
    google: any;
  }
}

class PaymentService {
  // Stripe Payment Methods
  async createStripePaymentIntent(amount: number, paymentMethodId: string, orderId?: string) {
    try {
      const response = await api.post('/payment-methods/create-intent', {
        amount,
        paymentMethodId,
        orderId,
        currency: 'usd'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  }

  async confirmStripePayment(paymentIntentId: string) {
    try {
      const response = await api.post('/payment-methods/confirm-intent', {
        paymentIntentId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  async processStripePayment(amount: number, paymentMethodId: string, orderId?: string) {
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe not loaded');

      const { data } = await this.createStripePaymentIntent(amount, paymentMethodId, orderId);
      
      if (data.requiresAction) {
        const { error } = await stripe.confirmCardPayment(data.clientSecret);
        if (error) throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Stripe payment failed');
    }
  }



  // PayPal Payment Methods
  async createPayPalOrder(amount: number, currency = 'USD', items: any[] = []): Promise<PayPalOrder> {
    try {
      const response = await api.post('/payment-methods/paypal/create-order', {
        amount,
        currency,
        items,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create PayPal order');
    }
  }

  async capturePayPalOrder(orderId: string) {
    try {
      const response = await api.post(`/payment-methods/paypal/capture/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to capture PayPal payment');
    }
  }

  async processPayPalPayment(amount: number, currency = 'USD', items: any[] = []): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load PayPal script if not already loaded
        if (!window.paypal) {
          await this.loadScript(`https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=${currency}`);
        }

        const order = await this.createPayPalOrder(amount, currency, items);
        
        // Redirect to PayPal approval URL
        const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          throw new Error('PayPal approval URL not found');
        }
      } catch (error: any) {
        reject(new Error(error.message || 'PayPal payment failed'));
      }
    });
  }

  // UPI Payment Methods
  async createUPIPayment(amount: number, upiId: string, orderId: string): Promise<any> {
    try {
      // For UPI payments, we can use PhonePe as the backend provider
      // since PhonePe supports UPI payments
      const response = await api.post('/payment-methods/phonepe/create-order', {
        amount,
        currency: 'INR',
        orderId,
        userPhone: '9999999999', // Default phone for UPI
        upiId: upiId,
        paymentType: 'UPI',
        redirectUrl: `${window.location.origin}/payment/upi/callback`,
        callbackUrl: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/payment-methods/phonepe/callback`
      });
      
      const data = response.data.data;
      
      // Return UPI-specific format expected by UPIPayment component
      return {
        paymentId: data.transactionId,
        qrCode: `upi://pay?pa=merchant@phonepe&pn=NextTech&am=${amount}&cu=INR&tn=${orderId}`,
        deepLink: `upi://pay?pa=merchant@phonepe&pn=NextTech&am=${amount}&cu=INR&tn=${orderId}`,
        amount: amount,
        orderId: orderId,
        upiId: upiId,
        status: 'pending'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create UPI payment');
    }
  }

  async processUPIPayment(amount: number, upiId: string): Promise<any> {
    try {
      const orderId = `order_${Date.now()}`;
      const upiPayment = await this.createUPIPayment(amount, upiId, orderId);
      
      // For mobile devices, try to open UPI app
      if (this.isMobile()) {
        window.location.href = upiPayment.deepLink;
      }
      
      return upiPayment;
    } catch (error: any) {
      throw new Error(error.message || 'UPI payment failed');
    }
  }

  // Paytm Payment Methods
  async initiatePaytm(amount: number, orderId?: string, customerId?: string): Promise<any> {
    try {
      const response = await api.post('/payment-methods/paytm/initiate', {
        amount,
        orderId: orderId || `ORDER_${Date.now()}`,
        customerId,
        callbackUrl: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/payment-methods/paytm/callback`
      });
      const { mid, orderId: paytmOrderId, txnToken, env } = response.data.data;

      // Load Paytm JS if needed and open checkout
      const scriptUrl = env === 'production'
        ? 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/' + mid + '.js'
        : 'https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/' + mid + '.js';
      await this.loadScript(scriptUrl);

      const config = {
        root: '',
        flow: 'DEFAULT',
        data: {
          orderId: paytmOrderId,
          token: txnToken,
          tokenType: 'TXN_TOKEN',
          amount: amount.toString(),
        },
        handler: {
          notifyMerchant: function (eventName: string, data: any) {
            console.log('Paytm event', eventName, data);
          }
        }
      } as any;

      // @ts-ignore
      if (window.Paytm && window.Paytm.CheckoutJS) {
        // @ts-ignore
        await window.Paytm.CheckoutJS.init(config);
        // @ts-ignore
        window.Paytm.CheckoutJS.invoke();
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate Paytm transaction');
    }
  }

  async checkPaytmStatus(orderId: string): Promise<any> {
    try {
      const response = await api.post('/payment-methods/paytm/status', { orderId });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check Paytm status');
    }
  }

  // Google Pay Payment Methods
  async createGooglePayPayment(amount: number, currency = 'INR', orderId?: string): Promise<GooglePayPayment> {
    try {
      const response = await api.post('/payment-methods/googlepay/create', {
        amount,
        currency,
        orderId: orderId || `order_${Date.now()}`
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create Google Pay payment');
    }
  }

  async processGooglePayPayment(
    amount: number, 
    currency = 'INR', 
    orderId?: string, 
    paymentToken?: string,
    options?: { merchantInfo?: any; testMode?: boolean }
  ): Promise<any> {
    try {
      if (paymentToken) {
        // Process payment token with backend
        const response = await api.post('/payment-methods/googlepay/process', {
          amount,
          currency,
          orderId,
          paymentToken,
          testMode: options?.testMode || false
        });
        return response.data;
      } else {
        // Original flow for direct Google Pay processing
        return new Promise(async (resolve, reject) => {
          try {
            // Load Google Pay script if not already loaded
            if (!window.google) {
              await this.loadScript('https://pay.google.com/gp/p/js/pay.js');
            }

            const googlePayData = await this.createGooglePayPayment(amount, currency, orderId);
            
            const paymentsClient = new window.google.payments.api.PaymentsClient({
              environment: options?.testMode ? 'TEST' : 'PRODUCTION'
            });

            // Check if Google Pay is available
            const isReadyToPay = await paymentsClient.isReadyToPay(googlePayData.paymentData);
            
            if (isReadyToPay.result) {
              const paymentData = await paymentsClient.loadPaymentData(googlePayData.paymentData);
              resolve(paymentData);
            } else {
              reject(new Error('Google Pay is not available'));
            }
          } catch (error: any) {
            reject(new Error(error.message || 'Google Pay payment failed'));
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Google Pay payment processing failed');
    }
  }

  // Razorpay Payment Methods
  async createRazorpayOrder(amount: number, currency = 'INR', orderId?: string, notes?: any): Promise<any> {
    try {
      const response = await api.post('/payment-methods/razorpay/create-order', {
        amount: amount, // Amount should be in rupees, backend will convert to paise
        currency,
        receipt: orderId || `receipt_${Date.now()}`,
        notes: notes || {}
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create Razorpay order');
    }
  }

  async processRazorpayPayment(
    amount: number,
    orderId?: string,
    userDetails?: { name: string; email: string; contact: string },
    optionsArg?: { upiOnly?: boolean; upiFlow?: 'intent' | 'collect' }
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure Razorpay config
        const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
        if (!razorpayKeyId) {
          throw new Error('Razorpay key not configured. Please check REACT_APP_RAZORPAY_KEY_ID environment variable.');
        }

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await this.loadScript('https://checkout.razorpay.com/v1/checkout.js');
        }

        // Create order on backend
        const orderData = await this.createRazorpayOrder(
          amount,
          'INR',
          orderId || `order_${Date.now()}`,
          { orderId: orderId || `order_${Date.now()}` }
        );

        // Configure Razorpay options
        const checkoutOptions: any = {
          key: razorpayKeyId,
          amount: orderData.amount, // in paise
          currency: orderData.currency,
          name: 'NextTechFusionGadgets',
          description: 'Payment for your order',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            try {
              // Verify payment on backend
              const verificationResult = await this.verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              resolve({
                ...response,
                verification: verificationResult,
                status: 'success'
              });
            } catch (verificationError: any) {
              reject(new Error('Payment verification failed: ' + verificationError.message));
            }
          },
          prefill: {
            name: userDetails?.name || 'Test User',
            email: userDetails?.email || 'test@example.com',
            contact: userDetails?.contact || '9999999999'
          },
          theme: { color: '#3B82F6' },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user'))
          }
        };

        // If UPI-only requested, restrict payment methods to UPI and set flow
        if (optionsArg?.upiOnly) {
          checkoutOptions.method = { upi: true, card: false, netbanking: false, wallet: false, emi: false, paylater: false };
          // Set UPI flow (intent opens UPI apps, collect allows entering UPI ID; QR shows automatically when available)
          checkoutOptions.upi = { flow: optionsArg.upiFlow || 'intent' };
        }

        const razorpay = new window.Razorpay(checkoutOptions);
        razorpay.open();
      } catch (error: any) {
        console.error('Razorpay payment error:', error);
        reject(new Error(error.message || 'Razorpay payment failed'));
      }
    });
  }

  async verifyRazorpayPayment(orderId: string, paymentId: string, signature: string): Promise<any> {
    try {
      const response = await api.post('/payment-methods/razorpay/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  // PhonePe Payment Methods
  async createPhonePeOrder(amount: number, currency = 'INR', orderId?: string, userPhone?: string): Promise<any> {
    try {
      console.log('🔍 PhonePe API Debug:', {
        baseURL: api.defaults.baseURL,
        endpoint: '/payment-methods/phonepe/create-order',
        fullURL: `${api.defaults.baseURL}/payment-methods/phonepe/create-order`
      });
      
      const requestData = {
        amount,
        currency,
        orderId: orderId || `order_${Date.now()}`,
        userPhone: userPhone || '9999999999',
        redirectUrl: `${window.location.origin}/payment/phonepe/callback`,
        callbackUrl: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/payment-methods/phonepe/callback`
      };
      
      console.log('📤 PhonePe Request Data:', requestData);
      
      const response = await api.post('/payment-methods/phonepe/create-order', requestData);
      
      console.log('📥 PhonePe Response:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ PhonePe API Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw new Error(error.response?.data?.message || 'Failed to create PhonePe order');
    }
  }

  async verifyPhonePePayment(transactionId: string, checksum?: string): Promise<any> {
    try {
      const response = await api.post('/payment-methods/phonepe/verify', {
        transactionId,
        checksum
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify PhonePe payment');
    }
  }

  async checkPhonePeStatus(transactionId: string): Promise<any> {
    try {
      const response = await api.get(`/payment-methods/phonepe/status/${transactionId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check PhonePe status');
    }
  }

  async processPhonePePayment(amount: number, orderId?: string, userPhone?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create PhonePe order
        const orderData = await this.createPhonePeOrder(amount, 'INR', orderId, userPhone);
        
        const { transactionId, paymentUrl, payload, checksum, apiEndpoint } = orderData;

        // Create form and submit to PhonePe
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = apiEndpoint;
        form.target = '_blank';

        // Add request payload
        const requestInput = document.createElement('input');
        requestInput.type = 'hidden';
        requestInput.name = 'request';
        requestInput.value = payload;
        form.appendChild(requestInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Start polling for payment status
        const pollStatus = async () => {
          try {
            const statusData = await this.checkPhonePeStatus(transactionId);
            
            if (statusData.status === 'COMPLETED' || statusData.status === 'completed') {
              resolve({
                transactionId,
                status: 'completed',
                amount: statusData.amount,
                paymentMethod: 'phonepe',
                providerTransactionId: statusData.providerTransactionId
              });
            } else if (statusData.status === 'FAILED' || statusData.status === 'failed') {
              reject(new Error(`Payment failed: ${statusData.responseMessage || 'Unknown error'}`));
            } else {
              // Continue polling
              setTimeout(pollStatus, 5000);
            }
          } catch (error: any) {
            reject(new Error(error.message || 'Payment verification failed'));
          }
        };

        // Start polling after a short delay
        setTimeout(pollStatus, 3000);

      } catch (error: any) {
        reject(new Error(error.message || 'PhonePe payment processing failed'));
      }
    });
  }



  // Utility Methods
  private async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Payment Method Management
  async getPaymentMethods() {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }

  async addPaymentMethod(paymentMethodData: any) {
    try {
      const response = await api.post('/payment-methods', paymentMethodData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add payment method');
    }
  }

  async deletePaymentMethod(paymentMethodId: string) {
    try {
      const response = await api.delete(`/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete payment method');
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    try {
      const response = await api.put(`/payment-methods/${paymentMethodId}/default`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set default payment method');
    }
  }

  // Refund Methods
  async createRefund(provider: PaymentProvider, paymentId: string, amount?: number, reason?: string) {
    try {
      const response = await api.post('/payment-methods/refund', {
        provider,
        paymentId,
        amount,
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create refund');
    }
  }



  // Payment Provider Detection
  getAvailablePaymentMethods(): PaymentProvider[] {
    // Base methods
    const methods: PaymentProvider[] = ['cod', 'upi', 'razorpay', 'stripe'];

    // PayPal is available globally
    methods.push('paypal');

    // Note: We now expose a single consolidated UPI option that
    // covers Google Pay, PhonePe, Paytm, etc. Individual tiles are hidden.
    return methods;
  }

  private isIndianUser(): boolean {
    // This can be enhanced to detect user location
    // For now, we'll assume Indian users based on currency preference or location
    return true; // Simplified for demo
  }

  // Payment Method Icons and Names
  getPaymentMethodInfo(provider: PaymentProvider) {
    const paymentMethods = {
      stripe: {
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Pay securely with your card'
      },
      razorpay: {
        name: 'Razorpay',
        icon: '🔷',
        description: 'UPI, Cards, NetBanking & more'
      },
      paypal: {
        name: 'PayPal',
        icon: '🅿️',
        description: 'Pay with your PayPal account'
      },
      googlepay: {
        name: 'Google Pay',
        icon: '🟢',
        description: 'Quick & secure payments'
      },
      phonepe: {
        name: 'PhonePe',
        icon: '🟣',
        description: 'UPI payments made easy'
      },
      paytm: {
        name: 'Paytm',
        icon: '🔵',
        description: 'Wallet & UPI payments'
      },
      upi: {
        name: 'UPI',
        icon: '🏦',
        description: 'Pay via any UPI app (GPay, PhonePe, Paytm, etc.)'
      },
      square: {
        name: 'Square',
        icon: '⬜',
        description: 'Credit/Debit Cards'
      },
      bitcoin: {
        name: 'Bitcoin',
        icon: '₿',
        description: 'Cryptocurrency payment'
      },
      ethereum: {
        name: 'Ethereum',
        icon: 'Ξ',
        description: 'Cryptocurrency payment'
      },
      cod: {
        name: 'Cash on Delivery',
        icon: '💵',
        description: 'Pay with cash when your order arrives'
      }
    } as Record<PaymentProvider, { name: string; icon: string; description: string }>;

    return paymentMethods[provider] || {
      name: provider,
      icon: '💰',
      description: 'Payment method'
    };
  }
}

export default new PaymentService();