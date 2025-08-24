import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Copy, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import paymentService from '../services/paymentService';
import { UPIPayment as UPIPaymentType } from '../types';

interface UPIPaymentProps {
  amount: number;
  orderId: string;
  onSuccess: (payment: UPIPaymentType) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({
  amount,
  orderId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [upiId, setUpiId] = useState('');
  const [paymentData, setPaymentData] = useState<UPIPaymentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');

  const popularUPIApps = [
    { name: 'Google Pay', icon: '🟢', scheme: 'tez://' },
    { name: 'PhonePe', icon: '🟣', scheme: 'phonepe://' },
    { name: 'Paytm', icon: '🔵', scheme: 'paytmmp://' },
    { name: 'BHIM', icon: '🟠', scheme: 'bhim://' },
    { name: 'Amazon Pay', icon: '🟡', scheme: 'amazonpay://' }
  ];

  const handleUPIPayment = async () => {
    if (!upiId.trim()) {
      onError('Please enter a valid UPI ID');
      return;
    }

    try {
      setLoading(true);
      const payment = await paymentService.createUPIPayment(amount, upiId, orderId);
      setPaymentData(payment);
      setPaymentStatus('checking');
      
      // Start polling for payment status (in real implementation)
      startPaymentStatusCheck(payment.paymentId);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusCheck = (paymentId: string) => {
    // Demo: deterministic outcome for presentations (always succeed after 3s)
    setPaymentStatus('checking');
    setTimeout(() => {
      setPaymentStatus('success');
      if (paymentData) {
        onSuccess({ ...paymentData, status: 'success' });
      } else {
        // Fallback shape if paymentData is missing (shouldn't happen normally)
        onSuccess({
          paymentId,
          amount,
          currency: 'INR',
          upiId,
          merchantId: 'demo_merchant',
          transactionId: orderId,
          status: 'success',
          qrCode: '',
          deepLink: ''
        } as any);
      }
    }, 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openUPIApp = (scheme: string) => {
    if (paymentData) {
      const upiUrl = paymentData.deepLink.replace('upi://', scheme);
      window.location.href = upiUrl;
    }
  };

  const generateQRCode = (upiString: string) => {
    // In a real implementation, you would use a QR code library like qrcode.js
    // For now, we'll return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your payment of ₹{amount.toLocaleString()} has been processed successfully.</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-4">Your payment could not be processed. Please try again.</p>
        <button
          onClick={() => {
            setPaymentStatus('pending');
            setPaymentData(null);
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (paymentStatus === 'checking' && paymentData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Payment</h3>
          <p className="text-gray-600">Please complete the payment in your UPI app</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border rounded-lg p-6 text-center">
          <h4 className="font-medium text-gray-900 mb-4">Scan QR Code</h4>
          <div className="inline-block p-4 bg-white border rounded-lg">
            <img
              src={generateQRCode(paymentData.qrCode)}
              alt="UPI QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Scan this QR code with any UPI app to pay
          </p>
        </div>

        {/* UPI Apps */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Or pay with your favorite UPI app:</h4>
          <div className="grid grid-cols-2 gap-3">
            {popularUPIApps.map((app) => (
              <button
                key={app.name}
                onClick={() => openUPIApp(app.scheme)}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{app.icon}</span>
                <span className="font-medium text-gray-900">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* UPI String */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">UPI Payment String</h4>
            <button
              onClick={() => copyToClipboard(paymentData.qrCode)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
          <code className="text-sm text-gray-700 break-all">
            {paymentData.qrCode}
          </code>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => startPaymentStatusCheck(paymentData.paymentId)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">UPI Payment</h3>
        <p className="text-gray-600">Pay ₹{amount.toLocaleString()} using UPI</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your UPI ID
          </label>
          <div className="relative">
            <input
              type="text"
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@paytm / yourname@oksbi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Smartphone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your UPI ID (e.g., 9876543210@paytm, yourname@oksbi)
          </p>
        </div>

        <button
          onClick={handleUPIPayment}
          disabled={loading || !upiId.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <QrCode className="h-5 w-5" />
              <span>Generate QR Code</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to pay with UPI:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Enter your UPI ID and click "Generate QR Code"</li>
          <li>2. Scan the QR code with any UPI app</li>
          <li>3. Or click on your preferred UPI app to pay directly</li>
          <li>4. Complete the payment in your UPI app</li>
        </ol>
      </div>
    </div>
  );
};

export default UPIPayment;