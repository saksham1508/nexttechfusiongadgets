import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  QrCode, 
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import paymentService from '../services/paymentService';

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  type: 'card' | 'upi' | 'wallet' | 'bank';
  color: string;
}

interface PaymentSelectorProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  amount,
  currency = 'INR',
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'details' | 'processing'>('select');
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'googlepay',
      name: 'Google Pay',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'Pay using Google Pay UPI',
      type: 'upi',
      color: 'bg-green-500'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'Pay using PhonePe UPI',
      type: 'upi',
      color: 'bg-purple-500'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: <Wallet className="w-8 h-8" />,
      description: 'Pay using Paytm Wallet/UPI',
      type: 'upi',
      color: 'bg-blue-500'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <QrCode className="w-8 h-8" />,
      description: 'Pay using any UPI app',
      type: 'upi',
      color: 'bg-orange-500'
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      icon: <Wallet className="w-8 h-8" />,
      description: 'UPI, Cards, NetBanking & more',
      type: 'wallet',
      color: 'bg-indigo-500'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-8 h-8" />,
      description: 'Pay using your card',
      type: 'card',
      color: 'bg-blue-600'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Globe className="w-8 h-8" />,
      description: 'Pay using PayPal account',
      type: 'wallet',
      color: 'bg-blue-400'
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setStep('details');
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSelectedOption(null);
    setPaymentDetails({});
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOption) return;

    setLoading(true);
    setStep('processing');

    try {
      const orderId = `order_${Date.now()}`;
      let createResponse, processResponse;

      // Step 1: Create payment based on selected method
      switch (selectedOption) {
        case 'googlepay': {
          await paymentService.processGooglePayPayment(amount, 'INR', orderId, undefined, { testMode: true });
          onPaymentSuccess({ paymentMethod: 'googlepay', amount, currency, transactionId: `gpay_${Date.now()}` });
          return;
        }
        case 'upi': {
          // If UPI ID mode, trigger deep link via payment service
          if ((paymentDetails.paymentMode || 'upi') === 'upi') {
            const upiPayment = await paymentService.processUPIPayment(amount, paymentDetails.upiId || 'merchant@paytm');
            onPaymentSuccess({ paymentMethod: 'upi', amount, currency, transactionId: upiPayment.paymentId });
            return;
          }
          // For QR mode, generate QR using the button and then confirm payment
          throw new Error('Please generate and scan the UPI QR, then confirm.');
        }

        case 'phonepe': {
          await paymentService.processPhonePePayment(amount, orderId, paymentDetails.upiId || '9999999999');
          onPaymentSuccess({ paymentMethod: 'phonepe', amount, currency, transactionId: `phonepe_${Date.now()}` });
          return;
        }

        case 'paytm':
          createResponse = await fetch(`http://localhost:5000/api/payment-methods/paytm/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              currency: 'INR',
              orderId,
              upiId: paymentDetails.upiId
            })
          });
          break;

        case 'card':
          createResponse = await fetch(`http://localhost:5000/api/payment-methods/card/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              currency: 'USD',
              orderId,
              cardNumber: paymentDetails.cardNumber,
              expiryDate: paymentDetails.expiryDate,
              cvv: paymentDetails.cvv
            })
          });
          break;

        case 'razorpay': {
          // Prefill from logged-in user if available
          const stored = localStorage.getItem('user');
          const parsed = stored ? JSON.parse(stored) : null;
          const profile = parsed?.user || parsed || {};
          const user = {
            name: paymentDetails.name || profile.name || 'Test User',
            email: paymentDetails.email || profile.email || 'test@example.com',
            contact: paymentDetails.contact || profile.phone || '9999999999'
          };
          await paymentService.processRazorpayPayment(amount, orderId, user);
          onPaymentSuccess({ paymentMethod: 'razorpay', amount, currency, transactionId: `rzp_${Date.now()}` });
          return;
        }

        case 'paypal': {
          await paymentService.processPayPalPayment(amount, 'USD', []);
          onPaymentSuccess({ paymentMethod: 'paypal', amount, currency: 'USD', transactionId: `pp_${Date.now()}` });
          return;
        }

        default:
          throw new Error('Unsupported payment method');
      }

      if (!createResponse?.ok) {
        throw new Error('Failed to create payment');
      }

      const createData = await createResponse.json();
      console.log('Payment created:', createData);

      // Step 2 is handled within each service for Razorpay/GooglePay/PayPal/UPI ID.
      // For QR mode we stop earlier with a message.
      onPaymentSuccess({ paymentMethod: selectedOption, amount, currency, details: paymentDetails, status: 'success' });
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentDetails = () => {
    const selectedPaymentOption = paymentOptions.find(opt => opt.id === selectedOption);
    if (!selectedPaymentOption) return null;

    switch (selectedPaymentOption.type) {
      case 'upi':
        return (
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Choose Payment Option</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentDetails({...paymentDetails, paymentMode: 'upi'})}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentDetails.paymentMode === 'upi' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium">Enter UPI ID</div>
                  <div className="text-xs text-gray-600">Manual entry</div>
                </button>
                <button
                  onClick={() => setPaymentDetails({...paymentDetails, paymentMode: 'qr'})}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentDetails.paymentMode === 'qr' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📷</div>
                  <div className="font-medium">Scan QR Code</div>
                  <div className="text-xs text-gray-600">Use any UPI app</div>
                </button>
              </div>
            </div>

            {/* UPI ID Input */}
            {paymentDetails.paymentMode === 'upi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@paytm"
                    value={paymentDetails.upiId || ''}
                    onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Examples: yourname@paytm, yourname@okaxis, yourname@ybl
                  </p>
                </div>
              </div>
            )}

            {/* QR Code Display */}
            {paymentDetails.paymentMode === 'qr' && (
              <div className="space-y-4">
                {qrData ? (
                  <QRCodeDisplay 
                    upiString={qrData.upiString}
                    amount={amount}
                    merchantName="NextTechFusionGadgets"
                  />
                ) : (
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`http://localhost:5000/api/payment-methods/upi/create`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              amount,
                              currency: 'INR',
                              orderId: `order_${Date.now()}`,
                              paymentMode: 'qr'
                            })
                          });
                          const data = await response.json();
                          setQrData(data.data);
                        } catch (error) {
                          console.error('Error generating QR:', error);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      🔄 Generate QR Code
                    </button>
                  </div>
                )}
                
                {qrData && (
                  <div className="text-center">
                    <button
                      onClick={() => setPaymentDetails({...paymentDetails, qrScanned: true})}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      ✅ I have completed the payment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* App-specific instructions */}
            {selectedOption === 'googlepay' && paymentDetails.paymentMode === 'upi' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  🔗 <strong>Google Pay:</strong> Enter your UPI ID linked to Google Pay (e.g., yourname@okaxis, yourname@paytm)
                </p>
              </div>
            )}
            {selectedOption === 'phonepe' && paymentDetails.paymentMode === 'upi' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700">
                  📱 <strong>PhonePe:</strong> Enter your UPI ID linked to PhonePe (e.g., yourname@ybl, yourname@ibl)
                </p>
              </div>
            )}
            {selectedOption === 'paytm' && paymentDetails.paymentMode === 'upi' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  💰 <strong>Paytm:</strong> Enter your UPI ID linked to Paytm (e.g., yourname@paytm)
                </p>
              </div>
            )}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate || ''}
                  onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentDetails.cvv || ''}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={paymentDetails.email || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 You'll be redirected to PayPal to complete the payment
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isDetailsValid = () => {
    const selectedPaymentOption = paymentOptions.find(opt => opt.id === selectedOption);
    if (!selectedPaymentOption) return false;

    switch (selectedPaymentOption.type) {
      case 'upi':
        if (paymentDetails.paymentMode === 'upi') {
          return paymentDetails.upiId && paymentDetails.upiId.includes('@');
        } else if (paymentDetails.paymentMode === 'qr') {
          return paymentDetails.qrScanned === true;
        }
        return paymentDetails.paymentMode; // At least one mode should be selected
      case 'card':
        return paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv;
      case 'wallet':
        return paymentDetails.email && paymentDetails.email.includes('@');
      default:
        return false;
    }
  };

  if (step === 'processing') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Amount: {currency} {amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'details') {
    const selectedPaymentOption = paymentOptions.find(opt => opt.id === selectedOption);
    
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToSelect}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${selectedPaymentOption?.color} text-white mr-3`}>
              {selectedPaymentOption?.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPaymentOption?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedPaymentOption?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Amount to pay:</span>
            <span className="text-xl font-bold text-gray-900">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        </div>

        {renderPaymentDetails()}

        <button
          onClick={handlePaymentSubmit}
          disabled={!isDetailsValid() || loading}
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
            isDetailsValid() && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </div>
          ) : (
            `Pay ${currency} ${amount.toFixed(2)}`
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
          <span className="text-gray-700">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-lg ${option.color} text-white mr-4 group-hover:scale-110 transition-transform`}>
                {option.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {option.type}
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-sm text-green-700">
            Secure payment powered by industry-standard encryption
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelector;