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

  // Razorpay Payment Methods
  async createRazorpayOrder(amount: number, currency = 'INR', receipt?: string): Promise<RazorpayOrder> {
    try {
      const response = await api.post('/payment-methods/razorpay/create-order', {
        amount,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          orderId: receipt || `order_${Date.now()}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create Razorpay order');
    }
  }

  async processRazorpayPayment(
    amount: number,
    orderId: string,
    userDetails: { name: string; email: string; contact: string }
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await this.loadScript('https://checkout.razorpay.com/v1/checkout.js');
        }

        const order = await this.createRazorpayOrder(amount, 'INR', orderId);

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'NextTechFusionGadgets',
          description: 'Payment for your order',
          order_id: order.orderId,
          handler: async (response: any) => {
            try {
              const verificationResult = await this.verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              resolve(verificationResult);
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: userDetails.name,
            email: userDetails.email,
            contact: userDetails.contact
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error: any) {
        reject(new Error(error.message || 'Razorpay payment failed'));
      }
    });
  }

  async verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
    try {
      const response = await api.post('/payment-methods/razorpay/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify Razorpay payment');
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
  async createUPIPayment(amount: number, upiId: string, transactionId?: string): Promise<UPIPayment> {
    try {
      const response = await api.post('/payment-methods/upi/create', {
        amount,
        currency: 'INR',
        upiId,
        transactionId: transactionId || `txn_${Date.now()}`
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create UPI payment');
    }
  }

  async processUPIPayment(amount: number, upiId: string): Promise<UPIPayment> {
    try {
      const upiPayment = await this.createUPIPayment(amount, upiId);
      
      // For mobile devices, try to open UPI app
      if (this.isMobile()) {
        window.location.href = upiPayment.deepLink;
      }
      
      return upiPayment;
    } catch (error: any) {
      throw new Error(error.message || 'UPI payment failed');
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
    const methods: PaymentProvider[] = ['stripe'];
    
    // Check for Indian payment methods
    if (this.isIndianUser()) {
      methods.push('razorpay', 'googlepay', 'phonepe', 'paytm', 'upi');
    }
    
    // PayPal is available globally
    methods.push('paypal');
    
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
        description: 'Direct bank transfer'
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
      }
    };

    return paymentMethods[provider] || {
      name: provider,
      icon: '💰',
      description: 'Payment method'
    };
  }
}

export default new PaymentService();