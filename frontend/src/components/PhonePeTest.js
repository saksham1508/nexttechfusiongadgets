import React, { useState } from 'react';
import paymentService from '../services/paymentService';

const PhonePeTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testPhonePePayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing PhonePe payment...');
      
      // Test 1: Create PhonePe Order
      console.log('Step 1: Creating PhonePe order...');
      const orderData = await paymentService.createPhonePeOrder(100, 'INR', `test_order_${Date.now()}`, '9999999999');
      console.log('Order created:', orderData);
      
      setResult({
        success: true,
        message: 'PhonePe order created successfully!',
        data: orderData
      });

    } catch (err) {
      console.error('PhonePe test error:', err);
      setError({
        message: err.message,
        details: err.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>PhonePe Payment Test</h2>
      
      <button 
        onClick={testPhonePePayment} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Testing...' : 'Test PhonePe Payment'}
      </button>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ff7675',
          color: 'white',
          borderRadius: '5px'
        }}>
          <h3>❌ Error:</h3>
          <p><strong>Message:</strong> {error.message}</p>
          <p><strong>Details:</strong> {error.details}</p>
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#00b894',
          color: 'white',
          borderRadius: '5px'
        }}>
          <h3>✅ Success:</h3>
          <p>{result.message}</p>
          <pre style={{ 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            padding: '10px', 
            borderRadius: '3px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>Test Information:</h3>
        <ul>
          <li>This test creates a PhonePe order using the payment service</li>
          <li>It should return a transaction ID and payment URL</li>
          <li>If you see HTTP 415 error, there's still a frontend issue</li>
          <li>If successful, the PhonePe integration is working</li>
        </ul>
      </div>
    </div>
  );
};

export default PhonePeTest;