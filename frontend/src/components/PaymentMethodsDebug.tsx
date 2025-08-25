import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import { PaymentProvider } from '../types';
import { QrCode, Globe, CreditCard, Smartphone, Wallet } from 'lucide-react';

const PaymentMethodsDebug: React.FC = () => {
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([]);

  useEffect(() => {
    const providers = paymentService.getAvailablePaymentMethods();
    setAvailableProviders(providers);
    console.log('Available Payment Providers:', providers);
  }, []);

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'paypal': return <Globe className="h-8 w-8 text-blue-600" />;
      case 'upi': return <QrCode className="h-8 w-8 text-orange-600" />;
      case 'stripe': return <CreditCard className="h-8 w-8 text-purple-600" />;
      case 'razorpay': return <Wallet className="h-8 w-8 text-blue-500" />;
      case 'googlepay': return <Smartphone className="h-8 w-8 text-green-600" />;
      case 'phonepe': return <Smartphone className="h-8 w-8 text-purple-600" />;
      case 'paytm': return <Wallet className="h-8 w-8 text-blue-400" />;
      default: return <Wallet className="h-8 w-8 text-gray-600" />;
    }
  };

  const handleProviderClick = (provider: PaymentProvider) => {
    if (provider === 'upi') {
      const upiId = prompt('Enter your UPI ID (e.g., yourname@paytm, yourname@gpay):');
      if (upiId) {
        alert(`✅ UPI ID entered: ${upiId}\n\nThis would normally process the UPI payment.`);
        console.log('UPI Payment would be processed with:', upiId);
      }
    } else if (provider === 'paypal') {
      alert('🌐 PayPal Selected\n\nThis would show PayPal payment buttons.');
      console.log('PayPal payment would be processed');
    } else {
      alert(`${provider.toUpperCase()} Selected\n\nThis payment method would be processed.`);
      console.log(`${provider} payment would be processed`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 Payment Methods Debug
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Available Payment Methods:</h3>
          <p className="text-blue-700 text-sm">
            Found {availableProviders.length} payment methods: {availableProviders.join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProviders.map((provider) => {
            const info = paymentService.getPaymentMethodInfo(provider);
            return (
              <button
                key={provider}
                onClick={() => handleProviderClick(provider)}
                className={`p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  provider === 'upi' 
                    ? 'border-orange-300 bg-orange-50 hover:border-orange-400' 
                    : provider === 'paypal'
                    ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  {getProviderIcon(provider)}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                    {provider === 'upi' && (
                      <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        🇮🇳 Indian Payment
                      </div>
                    )}
                    {provider === 'paypal' && (
                      <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        🌍 International Payment
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-3">🔍 How to Test:</h3>
          <div className="space-y-2 text-yellow-700 text-sm">
            <p><strong>For UPI:</strong> Click the UPI button → Enter your UPI ID (like yourname@paytm)</p>
            <p><strong>For PayPal:</strong> Click the PayPal button → It will show PayPal payment interface</p>
            <p><strong>Important:</strong> These are separate payment methods, not combined!</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify({ availableProviders }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsDebug;