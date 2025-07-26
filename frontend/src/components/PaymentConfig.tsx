import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Smartphone, Globe, QrCode, Wallet, Check, X } from 'lucide-react';
import { PaymentProvider, PaymentConfig as PaymentConfigType } from '../types';
import paymentService from '../services/paymentService';

const PaymentConfig: React.FC = () => {
  const [paymentConfigs, setPaymentConfigs] = useState<Record<PaymentProvider, PaymentConfigType>>({
    stripe: {
      provider: 'stripe',
      enabled: true,
      testMode: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
      supportedCountries: ['US', 'CA', 'GB', 'IN'],
      fees: { percentage: 2.9, fixed: 0.30 }
    },
    razorpay: {
      provider: 'razorpay',
      enabled: true,
      testMode: true,
      supportedCurrencies: ['INR'],
      supportedCountries: ['IN'],
      fees: { percentage: 2.0, fixed: 0 }
    },
    paypal: {
      provider: 'paypal',
      enabled: true,
      testMode: true,
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      supportedCountries: ['US', 'CA', 'GB', 'AU'],
      fees: { percentage: 3.49, fixed: 0.49 }
    },
    googlepay: {
      provider: 'googlepay',
      enabled: true,
      testMode: true,
      supportedCurrencies: ['INR', 'USD'],
      supportedCountries: ['IN', 'US'],
      fees: { percentage: 1.5, fixed: 0 }
    },
    phonepe: {
      provider: 'phonepe',
      enabled: false,
      testMode: true,
      supportedCurrencies: ['INR'],
      supportedCountries: ['IN'],
      fees: { percentage: 1.0, fixed: 0 }
    },
    paytm: {
      provider: 'paytm',
      enabled: false,
      testMode: true,
      supportedCurrencies: ['INR'],
      supportedCountries: ['IN'],
      fees: { percentage: 1.5, fixed: 0 }
    },
    upi: {
      provider: 'upi',
      enabled: true,
      testMode: true,
      supportedCurrencies: ['INR'],
      supportedCountries: ['IN'],
      fees: { percentage: 0, fixed: 0 }
    },
    square: {
      provider: 'square',
      enabled: false,
      testMode: true,
      supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR'],
      supportedCountries: ['US', 'CA', 'GB', 'AU'],
      fees: { percentage: 2.6, fixed: 0.10 }
    },
    bitcoin: {
      provider: 'bitcoin',
      enabled: false,
      testMode: true,
      supportedCurrencies: ['BTC'],
      supportedCountries: ['US', 'CA', 'GB', 'EU'],
      fees: { percentage: 1.0, fixed: 0 }
    },
    ethereum: {
      provider: 'ethereum',
      enabled: false,
      testMode: true,
      supportedCurrencies: ['ETH'],
      supportedCountries: ['US', 'CA', 'GB', 'EU'],
      fees: { percentage: 1.0, fixed: 0 }
    }
  });

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      case 'razorpay':
        return <Wallet className="h-6 w-6 text-blue-600" />;
      case 'paypal':
        return <Globe className="h-6 w-6 text-blue-500" />;
      case 'googlepay':
        return <Smartphone className="h-6 w-6 text-green-600" />;
      case 'phonepe':
        return <Smartphone className="h-6 w-6 text-purple-600" />;
      case 'paytm':
        return <Wallet className="h-6 w-6 text-blue-600" />;
      case 'upi':
        return <QrCode className="h-6 w-6 text-orange-600" />;
      case 'square':
        return <CreditCard className="h-6 w-6 text-gray-600" />;
      case 'bitcoin':
        return <Wallet className="h-6 w-6 text-orange-500" />;
      case 'ethereum':
        return <Wallet className="h-6 w-6 text-blue-400" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getProviderName = (provider: PaymentProvider) => {
    return paymentService.getPaymentMethodInfo(provider).name;
  };

  const toggleProvider = (provider: PaymentProvider) => {
    setPaymentConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled
      }
    }));
  };

  const toggleTestMode = (provider: PaymentProvider) => {
    setPaymentConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        testMode: !prev[provider].testMode
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Payment Configuration</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Payment Providers</h2>
          <p className="text-gray-600 mt-1">Configure and manage your payment methods</p>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(paymentConfigs).map(([provider, config]) => (
            <div key={provider} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider as PaymentProvider)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {getProviderName(provider as PaymentProvider)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {config.supportedCountries.join(', ')} • {config.supportedCurrencies.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Test Mode</span>
                    <button
                      onClick={() => toggleTestMode(provider as PaymentProvider)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.testMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.testMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleProvider(provider as PaymentProvider)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      config.enabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {config.enabled ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Processing Fee:</span>
                  <p className="text-gray-600">
                    {config.fees.percentage}%
                    {config.fees.fixed > 0 && ` + $${config.fees.fixed}`}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Currencies:</span>
                  <p className="text-gray-600">{config.supportedCurrencies.join(', ')}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Countries:</span>
                  <p className="text-gray-600">{config.supportedCountries.join(', ')}</p>
                </div>
              </div>

              {config.enabled && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Configuration Status</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${config.testMode ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-gray-600">
                        {config.testMode ? 'Test Mode Active' : 'Live Mode Active'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">API Keys Configured</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Security</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All payment data is encrypted and securely processed</li>
          <li>• PCI DSS compliant payment processing</li>
          <li>• 3D Secure authentication for card payments</li>
          <li>• Real-time fraud detection and prevention</li>
          <li>• Secure tokenization of payment methods</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentConfig;