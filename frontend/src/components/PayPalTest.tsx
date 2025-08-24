import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setStatus('❌ PayPal Client ID not configured');
      setError('REACT_APP_PAYPAL_CLIENT_ID environment variable is missing');
      return;
    }

    if (clientId.length < 50) {
      setStatus('⚠️ PayPal Client ID seems invalid (too short)');
      setError('Client ID should be longer than 50 characters');
      return;
    }

    setStatus('✅ PayPal Client ID configured');
  }, [clientId]);

  const initialOptions = {
    clientId: clientId || '',
    currency: 'USD',
    intent: 'capture',
  };

  const createOrder = async () => {
    try {
      console.log('🧪 PayPal Test: Creating test order...');
      setStatus('Creating test order...');
      
      // Return a test order ID (this would normally come from your backend)
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const testOrderId = `TEST_ORDER_${Date.now()}`;
          console.log('✅ PayPal Test: Order created:', testOrderId);
          setStatus('✅ Order created successfully');
          resolve(testOrderId);
        }, 1000);
      });
    } catch (error) {
      console.error('❌ PayPal Test: Order creation failed:', error);
      setStatus('❌ Order creation failed');
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      console.log('🧪 PayPal Test: Payment approved:', data);
      setStatus('✅ Payment approved! (Test mode)');
      
      // In real implementation, you would capture the payment here
      console.log('✅ PayPal Test: Payment would be captured here');
      
      alert('🎉 PayPal Test Successful!\n\nPayment approved in test mode.\nCheck console for details.');
    } catch (error) {
      console.error('❌ PayPal Test: Payment capture failed:', error);
      setStatus('❌ Payment capture failed');
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const onError = (error: any) => {
    console.error('❌ PayPal Test: Error occurred:', error);
    setStatus('❌ PayPal error occurred');
    setError(JSON.stringify(error));
  };

  const onCancel = () => {
    console.log('🧪 PayPal Test: Payment cancelled');
    setStatus('Payment cancelled by user');
  };

  if (!clientId) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-4">❌ PayPal Not Configured</h2>
        <p className="text-red-700 mb-4">PayPal Client ID is missing from environment variables.</p>
        <div className="bg-red-100 p-3 rounded text-sm">
          <strong>To fix:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Check if .env file exists in frontend folder</li>
            <li>Ensure REACT_APP_PAYPAL_CLIENT_ID is set</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🧪 PayPal Integration Test</h2>
      
      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Status:</h3>
        <p className="text-sm">{status}</p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Configuration Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-700 mb-2">Configuration:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Client ID:</strong> {clientId ? `${clientId.substring(0, 20)}...` : 'Not set'}</p>
          <p><strong>Currency:</strong> USD</p>
          <p><strong>Environment:</strong> Sandbox</p>
        </div>
      </div>

      {/* PayPal Buttons */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">Test Payment ($10.00):</h3>
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
              height: 50,
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            onCancel={onCancel}
          />
        </PayPalScriptProvider>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <strong>Test Instructions:</strong>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Click the PayPal button above</li>
          <li>Use sandbox test credentials</li>
          <li>Complete the payment flow</li>
          <li>Check console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default PayPalTest;