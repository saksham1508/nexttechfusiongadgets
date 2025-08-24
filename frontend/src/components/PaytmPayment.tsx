import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PaytmPaymentProps {
  amount: number;
  orderId?: string;
  customerId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface PaytmResponse {
  success: boolean;
  data?: {
    mid: string;
    orderId: string;
    amount: number;
    txnToken: string;
    env: string;
    paytmUrl: string;
    note?: string;
  };
  error?: string;
}

const PaytmPayment: React.FC<PaytmPaymentProps> = ({
  amount,
  orderId,
  customerId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaytmResponse['data'] | null>(null);

  const initiatePaytmPayment = async () => {
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payment-methods/paytm/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId: orderId || `ORDER_${Date.now()}`,
          customerId: customerId || `CUST_${Date.now()}`,
        }),
      });

      const data: PaytmResponse = await response.json();

      if (data.success && data.data) {
        setPaymentData(data.data);
        toast.success('PayTM payment initiated successfully!');
        
        if (data.data.note) {
          toast(data.data.note, { duration: 5000, icon: 'ℹ️' });
        }
        
        onSuccess?.(data.data);
      } else {
        const errorMsg = data.error || 'Failed to initiate PayTM payment';
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      toast.error(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.orderId) {
      toast.error('No order ID available');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payment-methods/paytm/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment status checked successfully!');
        console.log('Payment status:', data.data);
      } else {
        toast.error(data.error || 'Failed to check payment status');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = () => {
    if (!paymentData) {
      toast.error('No payment data available');
      return;
    }

    toast.success('Payment simulation completed!');
    onSuccess?.({
      ...paymentData,
      status: 'completed',
      transactionId: `TXN_${Date.now()}`,
      paymentMethod: 'paytm'
    });
  };

  return (
    <div className="paytm-payment-container bg-white p-6 rounded-lg shadow-lg border">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">PayTM Payment</h3>
          <p className="text-sm text-gray-600">Secure digital wallet payment</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-gray-800">₹{amount.toFixed(2)}</span>
          </div>
          {orderId && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Order ID:</span>
              <span className="text-sm text-gray-800">{orderId}</span>
            </div>
          )}
          {customerId && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Customer ID:</span>
              <span className="text-sm text-gray-800">{customerId}</span>
            </div>
          )}
        </div>

        {!paymentData ? (
          <button
            onClick={initiatePaytmPayment}
            disabled={disabled || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              disabled || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Initiating Payment...
              </div>
            ) : (
              'Pay with PayTM'
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Payment Initiated Successfully!</h4>
              <div className="text-xs text-green-700 space-y-1">
                <div><strong>Order ID:</strong> {paymentData.orderId}</div>
                <div><strong>Transaction Token:</strong> {paymentData.txnToken}</div>
                <div><strong>Environment:</strong> {paymentData.env}</div>
                {paymentData.note && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>Note:</strong> {paymentData.note}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={checkPaymentStatus}
                disabled={loading}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
              
              <button
                onClick={simulatePaymentSuccess}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Simulate Success
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              In a production environment, you would be redirected to PayTM's payment page.
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secured by PayTM
        </div>
      </div>
    </div>
  );
};

export default PaytmPayment;