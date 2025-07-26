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
  Plus,
  Trash2,
  Star
} from 'lucide-react';

interface PaymentMethodsProps {
  onPaymentMethodSelect: (method: PaymentMethod | null) => void;
  selectedAmount: number;
  orderId?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onPaymentMethodSelect,
  selectedAmount,
  orderId
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
    setAvailableProviders(paymentService.getAvailablePaymentMethods());
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.data || []);
      
      // Auto-select default method
      const defaultMethod = response.data?.find((method: PaymentMethod) => method.isDefault);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod);
        onPaymentMethodSelect(defaultMethod);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onPaymentMethodSelect(method);
  };

  const handleProviderSelect = async (provider: PaymentProvider) => {
    if (!user) {
      setError('Please login to continue');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      const userDetails = {
        name: user.name,
        email: user.email,
        contact: user.phone || '9999999999'
      };

      let result;

      switch (provider) {
        case 'stripe':
          // For Stripe, we need to collect card details first
          setShowAddMethod(true);
          break;

        case 'razorpay':
          result = await paymentService.processRazorpayPayment(
            selectedAmount,
            orderId || `order_${Date.now()}`,
            userDetails
          );
          handlePaymentSuccess(result);
          break;

        case 'paypal':
          result = await paymentService.processPayPalPayment(
            selectedAmount,
            'USD',
            []
          );
          handlePaymentSuccess(result);
          break;

        case 'googlepay':
          result = await paymentService.processGooglePayPayment(
            selectedAmount,
            'INR',
            orderId
          );
          handlePaymentSuccess(result);
          break;

        case 'upi':
          // For UPI, we need to collect UPI ID
          const upiId = prompt('Enter your UPI ID:');
          if (upiId) {
            result = await paymentService.processUPIPayment(selectedAmount, upiId);
            handlePaymentSuccess(result);
          }
          break;

        case 'phonepe':
        case 'paytm':
          // These will use UPI flow
          result = await paymentService.processUPIPayment(selectedAmount, `user@${provider}`);
          handlePaymentSuccess(result);
          break;

        case 'square':
        case 'bitcoin':
        case 'ethereum':
          setError(`${provider} payment is not implemented yet`);
          break;

        default:
          setError(`${provider} payment is not implemented yet`);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    // Handle successful payment
    // You can dispatch actions to update order status, show success message, etc.
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await paymentService.deletePaymentMethod(methodId);
      await loadPaymentMethods();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      await loadPaymentMethods();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="h-6 w-6" />;
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

  const getProviderColor = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return 'border-purple-200 hover:border-purple-300 bg-purple-50';
      case 'razorpay':
        return 'border-blue-200 hover:border-blue-300 bg-blue-50';
      case 'paypal':
        return 'border-blue-200 hover:border-blue-300 bg-blue-50';
      case 'googlepay':
        return 'border-green-200 hover:border-green-300 bg-green-50';
      case 'phonepe':
        return 'border-purple-200 hover:border-purple-300 bg-purple-50';
      case 'paytm':
        return 'border-blue-200 hover:border-blue-300 bg-blue-50';
      case 'upi':
        return 'border-orange-200 hover:border-orange-300 bg-orange-50';
      case 'square':
        return 'border-gray-200 hover:border-gray-300 bg-gray-50';
      case 'bitcoin':
        return 'border-orange-200 hover:border-orange-300 bg-orange-50';
      case 'ethereum':
        return 'border-blue-200 hover:border-blue-300 bg-blue-50';
      default:
        return 'border-gray-200 hover:border-gray-300 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payment methods...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <span className="text-sm text-gray-500">
          Amount: ₹{selectedAmount.toLocaleString()}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Saved Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-800">Saved Methods</h4>
          {paymentMethods.map((method) => (
            <div
              key={method._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod?._id === method._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getProviderIcon(method.provider)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {method.nickname || paymentService.getPaymentMethodInfo(method.provider).name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.card && `**** **** **** ${method.card.last4}`}
                      {method.upi && method.upi.vpa}
                      {method.digitalWallet && method.digitalWallet.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(method._id);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                    title="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMethod(method._id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Payment Providers */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800">Quick Payment Options</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableProviders.map((provider) => {
            const providerInfo = paymentService.getPaymentMethodInfo(provider);
            return (
              <button
                key={provider}
                onClick={() => handleProviderSelect(provider)}
                disabled={processingPayment}
                className={`p-4 border rounded-lg transition-all ${getProviderColor(provider)} ${
                  processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(provider)}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{providerInfo.name}</div>
                    <div className="text-sm text-gray-600">{providerInfo.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add New Payment Method */}
      <button
        onClick={() => setShowAddMethod(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="h-5 w-5" />
        <span>Add New Payment Method</span>
      </button>

      {/* Processing Indicator */}
      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing payment...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;