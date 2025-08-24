import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import paymentService from '../services/paymentService';
import { GooglePayPayment as GooglePayPaymentType } from '../types';

interface GooglePayPaymentProps {
  amount: number;
  currency?: string;
  orderId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  testMode?: boolean;
  merchantInfo?: {
    name: string;
    id?: string;
  };
}

const GooglePayPayment: React.FC<GooglePayPaymentProps> = ({
  amount,
  currency = 'INR',
  orderId,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  testMode = process.env.REACT_APP_GOOGLE_PAY_ENVIRONMENT === 'TEST',
  merchantInfo = { name: 'NextTechFusionGadgets' }
}) => {
  const [loading, setLoading] = useState(false);
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<GooglePayPaymentType | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const paymentsClientRef = useRef<any>(null);
  const maxRetries = 3;

  useEffect(() => {
    loadGooglePay();
  }, [amount, currency, orderId]);

  const loadGooglePay = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load Google Pay script if not already loaded
      if (!window.google) {
        await loadScript('https://pay.google.com/gp/p/js/pay.js');
      }

      // Create payment data with fallback for missing backend
      let googlePayData;
      try {
        googlePayData = await paymentService.createGooglePayPayment(amount, currency, orderId);
      } catch (backendError) {
        console.warn('Backend Google Pay endpoint not available, using fallback configuration');
        // Fallback configuration when backend is not available
        googlePayData = {
          paymentData: {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: 'CARD',
                parameters: {
                  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                  allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                  type: 'PAYMENT_GATEWAY',
                  parameters: {
                    gateway: process.env.REACT_APP_GOOGLE_PAY_GATEWAY || 'example',
                    gatewayMerchantId: process.env.REACT_APP_GOOGLE_PAY_GATEWAY_MERCHANT_ID || 'exampleGatewayMerchantId'
                  }
                }
              }
            ],
            merchantInfo: {
              merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'BCR2DN4T2QVQJQVQ',
              merchantName: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_NAME || merchantInfo.name
            },
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amount.toString(),
              currencyCode: currency,
              countryCode: currency === 'INR' ? 'IN' : 'US'
            }
          },
          orderId,
          amount,
          currency
        };
      }
      
      setPaymentData(googlePayData);

      // Initialize Google Pay client
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: testMode ? 'TEST' : 'PRODUCTION'
      });
      paymentsClientRef.current = paymentsClient;

      // Check if Google Pay is available
      const isReadyToPay = await paymentsClient.isReadyToPay(googlePayData.paymentData);
      setGooglePayReady(isReadyToPay.result);

      if (!isReadyToPay.result) {
        setError('Google Pay is not available on this device or browser. Please try using Chrome browser or ensure you have Google Pay set up.');
      }
      
      setRetryCount(0); // Reset retry count on successful load
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize Google Pay';
      setError(errorMessage);
      
      // Auto-retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadGooglePay();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [amount, currency, orderId, testMode, retryCount, maxRetries, onError, merchantInfo.name]);

  const loadScript = (src: string): Promise<void> => {
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
  };

  const handleGooglePayClick = useCallback(async () => {
    if (!paymentData || !googlePayReady || disabled) {
      setError('Google Pay is not ready or disabled');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentsClient = paymentsClientRef.current || new window.google.payments.api.PaymentsClient({
        environment: testMode ? 'TEST' : 'PRODUCTION'
      });

      const paymentDataResponse = await paymentsClient.loadPaymentData(paymentData.paymentData);
      
      // Validate payment data before processing
      if (!paymentDataResponse || !paymentDataResponse.paymentMethodData) {
        throw new Error('Invalid payment data received from Google Pay');
      }
      
      // Process the payment token with your backend
      const result = await processGooglePayToken(paymentDataResponse);
      onSuccess(result);
    } catch (error: any) {
      if (error.statusCode === 'CANCELED' || error.statusCode === 'DEVELOPER_ERROR') {
        onCancel();
      } else {
        const errorMessage = error.message || 'Google Pay payment failed';
        setError(errorMessage);
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [paymentData, googlePayReady, disabled, testMode, onSuccess, onError, onCancel]);

  const processGooglePayToken = async (paymentData: any) => {
    try {
      // Extract payment token from Google Pay response
      const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
      
      // Send payment token to backend for processing
      const response = await paymentService.processGooglePayPayment(
        amount,
        currency,
        orderId,
        paymentToken,
        {
          merchantInfo,
          testMode
        }
      );
      
      return {
        success: true,
        paymentMethod: 'googlepay',
        transactionId: response.transactionId || `gp_${Date.now()}`,
        amount: amount,
        currency: currency,
        paymentData: paymentData,
        providerResponse: response
      };
    } catch (error: any) {
      // Fallback to demo mode if backend processing fails
      if (testMode) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              paymentMethod: 'googlepay',
              transactionId: `gp_demo_${Date.now()}`,
              amount: amount,
              currency: currency,
              paymentData: paymentData,
              testMode: true
            });
          }, 2000);
        });
      }
      throw error;
    }
  };

  if (loading && !paymentData) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading Google Pay...'}
        </p>
        {testMode && (
          <p className="text-xs text-yellow-600 mt-2">
            <Shield className="inline h-3 w-3 mr-1" />
            Test Mode
          </p>
        )}
      </div>
    );
  }

  if (error && !googlePayReady) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Pay Unavailable</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Choose Another Method
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Google Pay</h3>
        <p className="text-gray-600">
          Pay ₹{amount.toLocaleString()} quickly and securely with Google Pay
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="mb-6">
          <img
            src="https://developers.google.com/pay/api/web/guides/images/google-pay-mark.svg"
            alt="Google Pay"
            className="h-12 mx-auto mb-4"
          />
          <p className="text-sm text-gray-600">
            Use your saved cards, bank accounts, or other payment methods
          </p>
        </div>

        <button
          onClick={handleGooglePayClick}
          disabled={loading || !googlePayReady || disabled}
          className={`w-full py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
            googlePayReady && !disabled
              ? 'bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed text-gray-600'
          }`}
          style={{
            minHeight: '48px'
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <img
                src="https://developers.google.com/pay/api/web/guides/images/google-pay-mark-white.svg"
                alt="Google Pay"
                className="h-6 w-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span>Pay with Google Pay</span>
              {testMode && <Shield className="h-4 w-4 ml-2" />}
            </>
          )}
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Google Pay Benefits:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Quick and secure payments</li>
          <li>• Use saved payment methods</li>
          <li>• No need to enter card details</li>
          <li>• Protected by Google's security</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setRetryCount(0);
            loadGooglePay();
          }}
          disabled={loading || retryCount >= maxRetries}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GooglePayPayment;