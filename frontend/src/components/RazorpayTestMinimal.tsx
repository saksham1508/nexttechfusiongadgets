import React, { useState } from 'react';

const RazorpayTestMinimal: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testRazorpayPayment = async () => {
    setLoading(true);
    setResult('');
    setDebugInfo('');

    try {
      console.log('🔄 Starting minimal Razorpay test...');
      
      // Debug info collection
      let debug = 'Debug Information:\n';
      debug += `- Environment: ${process.env.NODE_ENV}\n`;
      debug += `- API URL: ${process.env.REACT_APP_API_URL}\n`;
      debug += `- Razorpay Key: ${process.env.REACT_APP_RAZORPAY_KEY_ID ? 'Set' : 'Not Set'}\n`;
      debug += `- Window Razorpay: ${window.Razorpay ? 'Loaded' : 'Not Loaded'}\n`;
      
      // Check environment variable
      const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
      console.log('Razorpay Key ID:', razorpayKeyId);
      
      if (!razorpayKeyId) {
        throw new Error('REACT_APP_RAZORPAY_KEY_ID not found in environment variables');
      }

      // Load Razorpay script
      if (!window.Razorpay) {
        console.log('Loading Razorpay script...');
        debug += '- Loading Razorpay script...\n';
        await loadRazorpayScript();
        debug += '- Razorpay script loaded successfully\n';
      }

      // Create order via API
      console.log('Creating order...');
      debug += '- Creating order via API...\n';
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const orderResponse = await fetch(`${apiUrl}/payment-methods/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // ₹1.00
          currency: 'INR',
          receipt: 'test_minimal',
          notes: { test: true }
        })
      });

      debug += `- API Response Status: ${orderResponse.status}\n`;
      
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        debug += `- API Error: ${errorText}\n`;
        throw new Error(`API request failed: ${orderResponse.status} - ${errorText}`);
      }

      const orderData = await orderResponse.json();
      console.log('Order response:', orderData);
      debug += `- Order Data: ${JSON.stringify(orderData, null, 2)}\n`;

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      const order = orderData.data;
      debug += `- Order ID: ${order.orderId}\n`;
      debug += `- Order Amount: ${order.amount}\n`;
      
      setDebugInfo(debug);

      // Configure Razorpay
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Test Payment',
        description: 'Minimal test payment',
        order_id: order.orderId,
        handler: async (response: any) => {
          console.log('✅ Payment successful:', response);
          setResult(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          setLoading(false);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment cancelled');
            setResult('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      console.log('🚀 Opening Razorpay checkout with options:', options);

      // Create and open Razorpay
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response.error);
        setResult(`Payment failed: ${response.error.description || response.error.reason}`);
        setLoading(false);
      });

      razorpay.open();

    } catch (error: any) {
      console.error('❌ Test error:', error);
      setResult(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      document.head.appendChild(script);
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Razorpay Minimal Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This is a minimal test to isolate Razorpay payment issues.
        </p>
        <p className="text-xs text-gray-500">
          Amount: ₹1.00 | Test Mode
        </p>
      </div>

      <button
        onClick={testRazorpayPayment}
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-medium ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Test Razorpay Payment'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded text-sm ${
          result.includes('successful') 
            ? 'bg-green-100 text-green-800' 
            : result.includes('cancelled')
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <h4 className="font-semibold mb-2">Debug Information:</h4>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Quick Debug:</p>
        <p>Key ID: {process.env.REACT_APP_RAZORPAY_KEY_ID ? 'Set' : 'Not set'}</p>
        <p>Script: {window.Razorpay ? 'Loaded' : 'Not loaded'}</p>
        <p>API URL: {process.env.REACT_APP_API_URL || 'Default'}</p>
      </div>
    </div>
  );
};

export default RazorpayTestMinimal;