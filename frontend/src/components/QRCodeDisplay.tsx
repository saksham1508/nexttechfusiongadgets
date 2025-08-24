import React, { useEffect, useState } from 'react';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  upiString: string;
  amount: number;
  merchantName?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  upiString, 
  amount, 
  merchantName = "NextTechFusionGadgets" 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate QR code using a free API service
    const generateQRCode = async () => {
      try {
        // Using QR Server API (free service)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (upiString) {
      generateQRCode();
    }
  }, [upiString]);

  const copyUpiString = async () => {
    try {
      await navigator.clipboard.writeText(upiString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block shadow-sm">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="UPI QR Code" 
              className="w-48 h-48 mx-auto"
              onError={() => {
                // Fallback to text-based QR representation
                setQrCodeUrl('');
              }}
            />
          ) : (
            <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
              <QrCode className="w-16 h-16 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">QR Code</p>
              <p className="text-xs text-gray-500 mt-1">₹{amount.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to pay:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>2. Tap on "Scan QR Code" or "Pay"</li>
          <li>3. Scan the QR code above</li>
          <li>4. Verify amount: ₹{amount.toFixed(2)}</li>
          <li>5. Enter your UPI PIN to complete payment</li>
        </ol>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">UPI Payment String:</p>
            <p className="text-xs text-gray-600 font-mono break-all">{upiString}</p>
          </div>
          <button
            onClick={copyUpiString}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copy UPI string"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tez://upi/pay?pa=merchant@paytm&pn=${merchantName}&am=${amount}&cu=INR&tn=Payment`}
          className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <span className="text-sm font-medium">Open Google Pay</span>
        </a>
        <a
          href={`phonepe://pay?pa=merchant@paytm&pn=${merchantName}&am=${amount}&cu=INR&tn=Payment`}
          className="flex items-center justify-center p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <span className="text-sm font-medium">Open PhonePe</span>
        </a>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          QR code is valid for this transaction only
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;