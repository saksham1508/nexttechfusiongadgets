import React, { useState } from 'react';
import { ArrowLeft, Globe, QrCode, AlertTriangle, CheckCircle, Smartphone, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentMethodsImproved from '../components/PaymentMethodsImproved';
import PayPalPayment from '../components/PayPalPayment';
import UPIPayment from '../components/UPIPayment';
import GooglePayPayment from '../components/GooglePayPayment';
import RazorpayPayment from '../components/RazorpayPayment';
import RazorpayTestMinimal from '../components/RazorpayTestMinimal';
import EnvDebug from '../components/EnvDebug';
import { PaymentMethod } from '../types';

const PaymentTestPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<'select' | 'process'>('select');

  const handlePaymentMethodSelect = (method: PaymentMethod | null) => {
    setSelectedMethod(method);
    if (method) {
      setStep('process');
    }
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    alert('🎉 Payment Successful!\n\nThis is a test payment. Check console for details.');
    setStep('select');
    setSelectedMethod(null);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert('❌ Payment Failed!\n\n' + error);
  };

  const handlePaymentCancel = () => {
    setStep('select');
    setSelectedMethod(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods Test</h1>
          <p className="text-gray-600 mt-2">
            Test different payment methods to understand how they work
          </p>
        </div>

        {/* Explanation Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* PayPal Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">PayPal</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>International payment system</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Supports USD, EUR, GBP, etc.</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Works worldwide</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Requires PayPal account</span>
              </div>
            </div>
          </div>

          {/* Google Pay Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <Smartphone className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Google Pay</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Works globally</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Supports multiple currencies</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Uses saved cards/accounts</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Requires Chrome browser</span>
              </div>
            </div>
          </div>

          {/* Razorpay Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <Wallet className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Razorpay</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Indian payment gateway</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Supports cards, UPI, wallets</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Works in India</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Multiple payment options</span>
              </div>
            </div>
          </div>

          {/* PhonePe Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center mb-4">
              <Smartphone className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">PhonePe</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Popular Indian digital wallet</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>UPI payments made easy</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Supports INR only</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Instant bank transfers</span>
              </div>
            </div>
          </div>

          {/* UPI Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center mb-4">
              <QrCode className="h-8 w-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">UPI</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Indian payment system</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Only supports INR (Indian Rupees)</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Works with GPay, PhonePe, Paytm</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Direct bank transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Debug */}
        <EnvDebug />

        {/* Minimal Razorpay Test */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🧪 Debug: Minimal Razorpay Test</h3>
          <p className="text-blue-700 text-sm mb-4">
            Use this minimal test to isolate Razorpay payment issues. Check browser console for detailed logs.
          </p>
          <RazorpayTestMinimal />
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Why You Can't Add UPI to PayPal
              </h3>
              <div className="text-yellow-700 space-y-2">
                <p>
                  <strong>PayPal</strong> and <strong>UPI</strong> are completely different payment systems:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>PayPal</strong> = American company, works internationally</li>
                  <li><strong>UPI</strong> = Indian government system, works only in India</li>
                  <li>They are <strong>competitors</strong>, not integrated systems</li>
                  <li>You must choose <strong>one or the other</strong>, not both together</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {step === 'select' ? (
            <PaymentMethodsImproved
              onPaymentMethodSelect={handlePaymentMethodSelect}
              selectedAmount={99.99}
              orderId="test_order_123"
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Payment with {selectedMethod?.nickname}
                </h3>
                <button
                  onClick={handlePaymentCancel}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Method
                </button>
              </div>

              {selectedMethod?.provider === 'paypal' && (
                <PayPalPayment
                  amount={99.99}
                  currency="USD"
                  orderId="test_order_123"
                  items={[
                    {
                      name: "Test Product",
                      description: "This is a test payment",
                      price: 99.99,
                      quantity: 1
                    }
                  ]}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              )}

              {selectedMethod?.provider === 'upi' && (
                <UPIPayment
                  amount={7499} // ₹74.99 (converted from $99.99)
                  orderId="test_order_123"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              )}

              {selectedMethod?.provider === 'googlepay' && (
                <GooglePayPayment
                  amount={99.99}
                  currency="USD"
                  orderId="test_order_123"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                  testMode={true}
                  merchantInfo={{
                    name: 'NextTechFusionGadgets Test',
                    id: 'BCR2DN4T2QVQJQVQ'
                  }}
                />
              )}

              {selectedMethod?.provider === 'razorpay' && (
                <RazorpayPayment
                  amount={7499} // ₹74.99 (converted from $99.99)
                  currency="INR"
                  orderId="test_order_123"
                  userDetails={{
                    name: 'Test User',
                    email: 'test@example.com',
                    contact: '9999999999'
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              )}

              {selectedMethod?.provider === 'phonepe' && (
                <UPIPayment
                  amount={7499} // ₹74.99 (converted from $99.99)
                  orderId="test_order_123"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              )}

              {selectedMethod?.provider && !['paypal', 'upi', 'googlepay', 'razorpay', 'phonepe'].includes(selectedMethod.provider) && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    {selectedMethod.nickname} Integration
                  </h4>
                  <p className="text-gray-600">
                    This payment method is configured but the integration is not yet implemented in this test page.
                  </p>
                  <button
                    onClick={handlePaymentCancel}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Choose Different Method
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTestPage;