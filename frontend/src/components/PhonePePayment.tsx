import React, { useState } from 'react';
import { Smartphone, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import paymentService from '../services/paymentService';

interface PhonePePaymentProps {
  amount: number;
  currency?: string;
  orderId?: string;
  userPhone?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PhonePePayment: React.FC<PhonePePaymentProps> = ({
  amount,
  currency = 'INR',
  orderId,
  userPhone,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'creating' | 'redirecting' | 'verifying' | 'completed' | 'failed'>('idle');

  const createPhonePeOrder = async () => {
    setLoading(true);
    setStatus('creating');

    try {
      console.log('🔄 Creating PhonePe order...');
      
      const orderData = await paymentService.createPhonePeOrder(
        amount,
        currency,
        orderId || `order_${Date.now()}`,
        userPhone || '9999999999'
      );
      
      console.log('📱 PhonePe order response:', orderData);

      const { transactionId: txnId, paymentUrl: url, payload, checksum, apiEndpoint, mockMode, message } = orderData;
      
      setTransactionId(txnId);
      setStatus('redirecting');

      // Check if we're in mock mode (development)
      if (mockMode) {
        console.log('🧪 PhonePe running in mock mode:', message);
        
        // Show mock payment dialog
        const proceedWithMockPayment = window.confirm(
          `${message}\n\nThis is a development environment. Would you like to simulate a successful payment?`
        );
        
        if (proceedWithMockPayment) {
          // Simulate successful payment after a short delay
          setTimeout(() => {
            setStatus('completed');
            onSuccess({
              transactionId: txnId,
              status: 'completed',
              amount: amount,
              paymentMethod: 'phonepe',
              providerTransactionId: `mock_${txnId}`,
              responseCode: 'SUCCESS',
              mockMode: true
            });
          }, 2000);
        } else {
          setStatus('failed');
          onError('Payment cancelled by user');
        }
        return;
      }

      // Production mode - create form and submit to PhonePe
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
      pollPaymentStatus(txnId);

    } catch (error: any) {
      console.error('❌ PhonePe order creation failed:', error);
      setStatus('failed');
      onError(error.message || 'Failed to create PhonePe payment');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (txnId: string) => {
    setStatus('verifying');
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`🔍 Checking PhonePe payment status (attempt ${attempts}/${maxAttempts})...`);

        const statusData = await paymentService.checkPhonePeStatus(txnId);
        console.log('📊 PhonePe status response:', statusData);

        if (statusData) {
          const { status: paymentStatus, responseCode } = statusData;

          if (paymentStatus === 'COMPLETED' || paymentStatus === 'completed') {
            setStatus('completed');
            onSuccess({
              transactionId: txnId,
              status: 'completed',
              amount: statusData.amount,
              paymentMethod: 'phonepe',
              providerTransactionId: statusData.providerTransactionId,
              responseCode: responseCode
            });
            return;
          } else if (paymentStatus === 'FAILED' || paymentStatus === 'failed') {
            setStatus('failed');
            onError(`Payment failed: ${statusData.responseMessage || 'Unknown error'}`);
            return;
          }
        }

        // Continue polling if payment is still pending and we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setStatus('failed');
          onError('Payment verification timeout. Please check your PhonePe app or try again.');
        }

      } catch (error: any) {
        console.error('❌ Error checking PhonePe status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Retry on error
        } else {
          setStatus('failed');
          onError('Failed to verify payment status');
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 3000);
  };

  const handleCancel = () => {
    setStatus('idle');
    setTransactionId(null);
    setPaymentUrl(null);
    if (onCancel) {
      onCancel();
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'creating':
        return 'Creating PhonePe payment order...';
      case 'redirecting':
        return 'Redirecting to PhonePe...';
      case 'verifying':
        return 'Verifying payment status...';
      case 'completed':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed or cancelled';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'creating':
      case 'redirecting':
      case 'verifying':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Smartphone className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <Smartphone className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">PhonePe Payment</h3>
          <p className="text-sm text-gray-600">Pay securely with PhonePe</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{amount.toFixed(2)}
          </span>
        </div>
        {orderId && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Order ID:</span>
            <span className="text-sm text-gray-600">{orderId}</span>
          </div>
        )}
        {transactionId && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
            <span className="text-sm text-gray-600 font-mono">{transactionId}</span>
          </div>
        )}
      </div>

      {status !== 'idle' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {getStatusMessage()}
            </span>
          </div>
          {status === 'redirecting' && (
            <p className="text-xs text-gray-500 mt-2">
              A new window will open with PhonePe payment page. Complete the payment and return to this page.
            </p>
          )}
          {status === 'verifying' && (
            <p className="text-xs text-gray-500 mt-2">
              Please wait while we verify your payment. This may take a few moments.
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {status === 'idle' && (
          <button
            onClick={createPhonePeOrder}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Pay with PhonePe
              </div>
            )}
          </button>
        )}

        {(status === 'redirecting' || status === 'verifying') && (
          <button
            onClick={handleCancel}
            className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel Payment
          </button>
        )}

        {status === 'failed' && (
          <div className="space-y-2">
            <button
              onClick={createPhonePeOrder}
              className="w-full py-3 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Secure payment powered by PhonePe</p>
        <p>• Supports UPI, Cards, Net Banking & Wallets</p>
        <p>• Transaction fees may apply as per PhonePe terms</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            <p className="font-medium">🧪 Development Mode</p>
            <p>PhonePe payments will be simulated for testing purposes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhonePePayment;