import React, { useState, useEffect } from 'react';
import { Loader, CreditCard, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react';
import paymentService from '../services/paymentService';

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  orderId?: string;
  userDetails?: {
    name: string;
    email: string;
    contact: string;
  };
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  currency = 'INR',
  orderId,
  userDetails = {
    name: 'Test User',
    email: 'test@example.com',
    contact: '9999999999'
  },
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    checkRazorpayScript();
  }, []);

  const checkRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    } else {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setError('Failed to load Razorpay script');
      document.head.appendChild(script);
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError('Razorpay script not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting Razorpay payment process...');
      console.log('Amount:', amount, 'Currency:', currency);

      // Use the processRazorpayPayment method from payment service
      const result = await paymentService.processRazorpayPayment(
        amount,
        orderId || `order_${Date.now()}`,
        userDetails || {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        }
      );

      console.log('✅ Payment completed:', result);
      setLoading(false);
      onSuccess(result);

    } catch (error: any) {
      console.error('❌ Razorpay payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Razorpay Payment</h3>
          <p className="text-sm text-gray-600">Secure payment gateway for India</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-900 flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {formatAmount(amount)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Currency:</span>
          <span className="font-medium text-gray-700">{currency}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Order ID:</span>
          <span className="font-medium text-gray-700 text-sm">{orderId || 'Auto-generated'}</span>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          {process.env.REACT_APP_RAZORPAY_KEY_ID ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${process.env.REACT_APP_RAZORPAY_KEY_ID ? 'text-green-700' : 'text-red-700'}`}>
            Razorpay Key: {process.env.REACT_APP_RAZORPAY_KEY_ID ? 'Configured' : 'Not Configured'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {razorpayLoaded ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span className={`text-sm ${razorpayLoaded ? 'text-green-700' : 'text-yellow-700'}`}>
            Razorpay Script: {razorpayLoaded ? 'Loaded' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-red-800">Payment Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="flex space-x-4">
        <button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded || !process.env.REACT_APP_RAZORPAY_KEY_ID}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            loading || !razorpayLoaded || !process.env.REACT_APP_RAZORPAY_KEY_ID
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay with Razorpay
            </>
          )}
        </button>
        
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Debug Information */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Debug Information:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Razorpay Key ID: {process.env.REACT_APP_RAZORPAY_KEY_ID || 'Not set'}</div>
          <div>Script Loaded: {razorpayLoaded ? 'Yes' : 'No'}</div>
          <div>Amount: ₹{amount}</div>
          <div>Currency: {currency}</div>
          <div>User: {userDetails.name} ({userDetails.email})</div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;