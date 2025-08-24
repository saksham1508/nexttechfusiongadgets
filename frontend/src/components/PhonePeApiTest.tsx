import React, { useState } from 'react';
import api from '../services/api';

const PhonePeApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPhonePeAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing PhonePe API...');
      
      const response = await api.post('/payment-methods/phonepe/create-order', {
        amount: 100,
        orderId: `test_${Date.now()}`,
        currency: 'INR',
        userPhone: '9999999999'
      });

      console.log('✅ PhonePe API Response:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('❌ PhonePe API Error:', err);
      setError(err.message || 'API call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">PhonePe API Test</h2>
      
      <button
        onClick={testPhonePeAPI}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test PhonePe API'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PhonePeApiTest;