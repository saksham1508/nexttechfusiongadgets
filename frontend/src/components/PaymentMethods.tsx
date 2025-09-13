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
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  allowedProviders?: PaymentProvider[];
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onPaymentMethodSelect,
  selectedAmount,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  allowedProviders
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

  // When allowedProviders is provided, filter the base providers accordingly
  useEffect(() => {
    const base = paymentService.getAvailablePaymentMethods();
    setAvailableProviders(allowedProviders && allowedProviders.length ? base.filter((p) => (allowedProviders as PaymentProvider[]).includes(p)) : base);
  }, [allowedProviders]);

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
    // Block selection if provider is not allowed for current cart
    if (allowedProviders && allowedProviders.length && !(allowedProviders as PaymentProvider[]).includes(provider)) {
      setError('This payment method is not available for the selected items.');
      return;
    }

    // If Redux user missing, try to derive basic details from localStorage
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    const effectiveUser = user || parsed?.user || parsed;
    if (!effectiveUser) {
      setError('Please login to continue');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      const userDetails = {
        name: (effectiveUser as any).name,
        email: (effectiveUser as any).email,
        contact: (effectiveUser as any).phone || '9999999999'
      };

      let result;

      switch (provider) {
        case 'stripe':
          // Create a mock payment method for Stripe to trigger the payment component
          const stripeMethod: PaymentMethod = {
            _id: 'stripe_temp',
            provider: 'stripe',
            type: 'card',
            nickname: 'Credit/Debit Card',
            details: {
              brand: 'visa',
              last4: '4242'
            },
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleMethodSelect(stripeMethod);
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
          // Create a mock payment method for PayPal to trigger the payment component
          const paypalMethod: PaymentMethod = {
            _id: 'paypal_temp',
            provider: 'paypal',
            type: 'digital_wallet',
            nickname: 'PayPal',
            details: {
              walletProvider: 'PayPal'
            },
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleMethodSelect(paypalMethod);
          break;

        case 'googlepay':
          // Step 1: Open Google Pay sheet and get a payment token
          const paymentData = await paymentService.processGooglePayPayment(
            selectedAmount,
            'INR',
            orderId,
            undefined,
            { testMode: true } // use TEST env for development
          );

          // Step 2: Extract token and send to backend for processing
          try {
            const tokenString = paymentData?.paymentMethodData?.tokenizationData?.token;
            if (!tokenString) throw new Error('Google Pay token not found');

            const backendResult = await paymentService.processGooglePayPayment(
              selectedAmount,
              'INR',
              orderId,
              tokenString,
              { testMode: true }
            );
            handlePaymentSuccess(backendResult);
          } catch (err: any) {
            setError(err.message || 'Failed to process Google Pay token');
          }
          break;

        case 'instamojo':
          // Initiate Instamojo hosted payment: backend returns a payment URL and we redirect
          await paymentService.processInstamojoPayment(
            selectedAmount,
            `Order ${orderId || Date.now()}`,
            { name: userDetails.name, email: userDetails.email, phone: userDetails.contact },
            `${window.location.origin}/checkout`
          );
          // The call above redirects away; no further code runs here pre-redirect
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
          // Create a mock payment method for PhonePe to trigger the payment component
          const phonepeMethod: PaymentMethod = {
            _id: 'phonepe_temp',
            provider: 'phonepe',
            type: 'digital_wallet',
            nickname: 'PhonePe',
            details: {
              walletProvider: 'PhonePe'
            },
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleMethodSelect(phonepeMethod);
          break;

        case 'paytm':
          // Use UPI flow for Paytm
          result = await paymentService.processUPIPayment(selectedAmount, `user@${provider}`);
          handlePaymentSuccess(result);
          break;

        case 'cod':
          // Cash on Delivery: no online payment, just select the method
          const codMethod: PaymentMethod = {
            _id: 'cod_temp',
            provider: 'cod',
            type: 'cash',
            nickname: 'Cash on Delivery',
            details: {},
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleMethodSelect(codMethod);
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
      const errorMessage = error.message;
      setError(errorMessage);
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    if (onPaymentSuccess) {
      onPaymentSuccess(result);
    }
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
      case 'instamojo':
        return <Wallet className="h-6 w-6 text-pink-600" />;
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
      case 'cod':
        return <Wallet className="h-6 w-6 text-green-700" />;
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
      case 'instamojo':
        return 'border-pink-200 hover:border-pink-300 bg-pink-50';
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
      case 'cod':
        return 'border-green-200 hover:border-green-300 bg-green-50';
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
          {/* Single UPI button grouping Google Pay, PhonePe, Paytm */}
          <button
            key="upi_group"
            onClick={() => handleProviderSelect('upi')}
            disabled={processingPayment}
            className={`p-4 border rounded-lg transition-all ${getProviderColor('upi')} ${
              processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getProviderIcon('upi')}
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">UPI Payment</div>
                <div className="text-sm text-gray-600">Pay via any UPI app (Google Pay, PhonePe, Paytm, etc.)</div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </div>
          </button>

          {/* Razorpay button remains */}
          <button
            key="razorpay"
            onClick={() => handleProviderSelect('razorpay')}
            disabled={processingPayment}
            className={`p-4 border rounded-lg transition-all ${getProviderColor('razorpay')} ${
              processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getProviderIcon('razorpay')}
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">{paymentService.getPaymentMethodInfo('razorpay').name}</div>
                <div className="text-sm text-gray-600">{paymentService.getPaymentMethodInfo('razorpay').description}</div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </div>
          </button>

          {/* Cash on Delivery button next to Razorpay */}
          <button
            key="cod"
            onClick={() => handleProviderSelect('cod')}
            disabled={processingPayment}
            className={`p-4 border rounded-lg transition-all ${getProviderColor('cod')} ${
              processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getProviderIcon('cod')}
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Cash on Delivery</div>
                <div className="text-sm text-gray-600">Place order and pay in cash upon delivery</div>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </div>
          </button>

          {/* Render remaining providers except individual UPI apps and duplicates */}
          {[...availableProviders]
            .filter((p) => !['phonepe', 'googlepay', 'paytm', 'upi', 'razorpay', 'cod'].includes(p))
            .map((provider) => {
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
                    <div className="text-left flex-1">
                      <div className="font-medium text-gray-900">{providerInfo.name}</div>
                      <div className="text-sm text-gray-600">{providerInfo.description}</div>
                    </div>
                    <span className="ml-auto text-gray-400">→</span>
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