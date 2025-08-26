import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Globe, CheckCircle, AlertCircle } from 'lucide-react';
import paymentService from '../services/paymentService';

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  orderId: string;
  items?: Array<{
    name: string;
    description?: string;
    price: number;
    quantity: number;
  }>;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency = 'USD',
  orderId,
  items = [],
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: currency,
    intent: 'capture',
    components: 'buttons',
    enableFunding: 'card', // ask PayPal SDK to show card funding if eligible
    'data-client-token': 'sandbox_client_token',
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💳 PayPal: Creating order for amount:', amount, currency, 'orderId:', orderId);
      
      const order = await paymentService.createPayPalOrder(amount, currency, items, orderId);
      console.log('✅ PayPal: Order created successfully:', order.orderId);
      return order.orderId;
    } catch (error: any) {
      console.error('❌ PayPal: Order creation failed:', error);
      setError(error.message);
      onError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data: any) => {
    try {
      setLoading(true);
      console.log('✅ PayPal: Payment approved, capturing order:', data.orderID);
      const result = await paymentService.capturePayPalOrder(data.orderID);
      console.log('✅ PayPal: Payment captured successfully:', result);
      onSuccess(result);
    } catch (error: any) {
      console.error('❌ PayPal: Payment capture failed:', error);
      setError(error.message);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onErrorHandler = (error: any) => {
    console.error('PayPal Error:', error);
    setError('PayPal payment failed. Please try again.');
    onError('PayPal payment failed. Please try again.');
  };

  const onCancelHandler = () => {
    onCancel();
  };

  if (!process.env.REACT_APP_PAYPAL_CLIENT_ID) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">PayPal Not Configured</h3>
        <p className="text-gray-600">PayPal client ID is not configured. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">PayPal Payment</h3>
        <p className="text-gray-600">
          Pay {currency === 'USD' ? '$' : '₹'}{amount.toLocaleString()} securely with PayPal
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
              height: 50,
            }}
            fundingSource={undefined}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancelHandler}
            disabled={loading}
          />
          {/* Explicit card button (appears only if eligible in region/account) */}
          <div className="mt-3">
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'silver',
                shape: 'rect',
                label: 'pay',
                height: 45,
              }}
              fundingSource="card"
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onErrorHandler}
              onCancel={onCancelHandler}
              disabled={loading}
            />
          </div>
        </PayPalScriptProvider>
      </div>

      {loading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Processing PayPal payment...</span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">PayPal Benefits:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Secure payment processing</li>
          <li>• Buyer protection</li>
          <li>• No need to share card details</li>
          <li>• Pay with PayPal balance or linked accounts</li>
        </ul>
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel Payment
      </button>
    </div>
  );
};

export default PayPalPayment;