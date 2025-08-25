import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import paymentService from '../services/paymentService';
import { PaymentProvider, PaymentMethod } from '../types';
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  QrCode, 
  Wallet,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  DollarSign
} from 'lucide-react';

interface PaymentMethodsImprovedProps {
  onPaymentMethodSelect: (method: PaymentMethod | null) => void;
  selectedAmount: number;
  orderId?: string;
}

const PaymentMethodsImproved: React.FC<PaymentMethodsImprovedProps> = ({
  onPaymentMethodSelect,
  selectedAmount,
  orderId
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(false);

  // Categorize payment methods
  const internationalMethods: PaymentProvider[] = ['paypal', 'stripe', 'square'];
  const indianMethods: PaymentProvider[] = ['upi', 'razorpay', 'googlepay', 'phonepe', 'paytm'];
  const cryptoMethods: PaymentProvider[] = ['bitcoin', 'ethereum'];

  const getMethodIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'paypal': return <Globe className="h-8 w-8 text-blue-600" />;
      case 'stripe': return <CreditCard className="h-8 w-8 text-purple-600" />;
      case 'upi': return <QrCode className="h-8 w-8 text-orange-600" />;
      case 'razorpay': return <Wallet className="h-8 w-8 text-blue-500" />;
      case 'googlepay': return <Smartphone className="h-8 w-8 text-green-600" />;
      case 'phonepe': return <Smartphone className="h-8 w-8 text-purple-600" />;
      case 'paytm': return <Wallet className="h-8 w-8 text-blue-400" />;
      default: return <Wallet className="h-8 w-8 text-gray-600" />;
    }
  };

  const getMethodDescription = (provider: PaymentProvider) => {
    const info = paymentService.getPaymentMethodInfo(provider);
    return info.description;
  };

  const handleProviderSelect = async (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setLoading(true);

    try {
      // Create a temporary payment method for the selected provider
      const tempMethod: PaymentMethod = {
        _id: `${provider}_temp`,
        provider: provider,
        type: provider === 'upi' ? 'upi' : provider === 'paypal' ? 'digital_wallet' : 'card',
        nickname: paymentService.getPaymentMethodInfo(provider).name,
        details: {
          walletProvider: provider === 'paypal' ? 'PayPal' : provider === 'googlepay' ? 'Google Pay' : undefined,
          upiId: provider === 'upi' ? 'user@paytm' : undefined,
          brand: provider === 'stripe' ? 'visa' : undefined,
          last4: provider === 'stripe' ? '4242' : undefined
        },
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onPaymentMethodSelect(tempMethod);
    } catch (error) {
      console.error('Error selecting payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard = ({ provider, category }: { provider: PaymentProvider, category: string }) => (
    <button
      onClick={() => handleProviderSelect(provider)}
      disabled={loading}
      className={`p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
        selectedProvider === provider 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
    >
      <div className="flex flex-col items-center space-y-3">
        {getMethodIcon(provider)}
        <div className="text-center">
          <h3 className="font-semibold text-gray-900">
            {paymentService.getPaymentMethodInfo(provider).name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {getMethodDescription(provider)}
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category === 'international' ? 'bg-blue-100 text-blue-800' :
              category === 'indian' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {category === 'international' && <DollarSign className="h-3 w-3 mr-1" />}
              {category === 'indian' && <IndianRupee className="h-3 w-3 mr-1" />}
              {category}
            </span>
          </div>
        </div>
        {selectedProvider === provider && (
          <CheckCircle className="h-6 w-6 text-blue-600" />
        )}
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
        <p className="text-gray-600">
          Select your preferred payment option for ${selectedAmount.toFixed(2)}
        </p>
      </div>

      {/* International Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
          International Payments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {internationalMethods.map((provider) => (
            <PaymentMethodCard key={provider} provider={provider} category="international" />
          ))}
        </div>
      </div>

      {/* Indian Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
          Indian Payments (UPI & More)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {indianMethods.map((provider) => (
            <PaymentMethodCard key={provider} provider={provider} category="indian" />
          ))}
        </div>
      </div>

      {/* Crypto Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-purple-600" />
          Cryptocurrency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cryptoMethods.map((provider) => (
            <PaymentMethodCard key={provider} provider={provider} category="crypto" />
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-yellow-800">Important:</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• <strong>PayPal</strong> and <strong>UPI</strong> are separate payment systems</li>
              <li>• <strong>PayPal</strong> = International payments (USD, EUR, etc.)</li>
              <li>• <strong>UPI</strong> = Indian payments (INR only)</li>
              <li>• Choose the method that matches your location and currency</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedProvider && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-800">
                {paymentService.getPaymentMethodInfo(selectedProvider).name} Selected
              </h4>
              <p className="text-sm text-green-700">
                Continue to complete your payment with {paymentService.getPaymentMethodInfo(selectedProvider).name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsImproved;