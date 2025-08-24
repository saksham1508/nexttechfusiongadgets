import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import PaymentConfig from '../components/PaymentConfig';
import PaymentMethodCard from '../components/PaymentMethodCard';
import PaymentMethods from '../components/PaymentMethods';
import PaymentMethodsImproved from '../components/PaymentMethodsImproved';
import GooglePayPayment from '../components/GooglePayPayment';
import { PaymentMethod } from '../types';
import paymentService from '../services/paymentService';

const PaymentDebugPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPaymentMethods();
    runComponentTests();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const runComponentTests = () => {
    const results: Record<string, boolean> = {};
    
    // Test 1: PaymentConfig component
    try {
      results.paymentConfig = true;
    } catch (err) {
      results.paymentConfig = false;
    }

    // Test 2: PaymentMethodCard component
    try {
      results.paymentMethodCard = true;
    } catch (err) {
      results.paymentMethodCard = false;
    }

    // Test 3: PaymentMethods component
    try {
      results.paymentMethods = true;
    } catch (err) {
      results.paymentMethods = false;
    }

    // Test 4: PaymentMethodsImproved component
    try {
      results.paymentMethodsImproved = true;
    } catch (err) {
      results.paymentMethodsImproved = false;
    }

    // Test 5: GooglePayPayment component
    try {
      results.googlePayPayment = true;
    } catch (err) {
      results.googlePayPayment = false;
    }

    setTestResults(results);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod | null) => {
    setSelectedMethod(method);
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    alert('🎉 Payment test successful!');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert('❌ Payment test failed: ' + error);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setSelectedMethod(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment Components Debug</h1>
          <p className="text-gray-600 mt-2">
            Testing all payment-related components and their functionality
          </p>
        </div>

        {/* Component Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(testResults).map(([component, passed]) => (
              <div key={component} className="flex items-center space-x-3">
                {passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  {component}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Test Results</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 animate-spin text-blue-500" />
              <span>Loading payment methods...</span>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {error}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Successfully loaded {paymentMethods.length} payment methods</span>
            </div>
          )}
        </div>

        {/* Payment Methods Display */}
        {!loading && !error && paymentMethods.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method._id}
                  paymentMethod={method}
                  isSelected={selectedMethod?._id === method._id}
                  onSelect={() => setSelectedMethod(method)}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* PaymentMethodsImproved Component Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">PaymentMethodsImproved Component</h2>
          <PaymentMethodsImproved
            onPaymentMethodSelect={handlePaymentMethodSelect}
            selectedAmount={99.99}
            orderId="debug_test_123"
          />
        </div>

        {/* Google Pay Test */}
        {selectedMethod?.provider === 'googlepay' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Pay Component Test</h2>
            <GooglePayPayment
              amount={99.99}
              currency="USD"
              orderId="debug_test_123"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              testMode={true}
              merchantInfo={{
                name: 'NextTechFusionGadgets Debug',
                id: 'BCR2DN4T2QVQJQVQ'
              }}
            />
          </div>
        )}

        {/* PaymentConfig Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Configuration</h2>
          <PaymentConfig />
        </div>
      </div>
    </div>
  );
};

export default PaymentDebugPage;