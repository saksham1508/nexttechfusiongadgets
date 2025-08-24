import React, { useEffect, useState } from 'react';
import paymentService from '../services/paymentService';

interface Props {
  amount: number; // in INR
  onSuccess?: (result: any) => void;
  onError?: (message: string) => void;
  upiFlow?: 'intent' | 'collect'; // default intent
}

const UPIRazorpayButton: React.FC<Props> = ({ amount, onSuccess, onError, upiFlow = 'intent' }) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const keyConfigured = Boolean(process.env.REACT_APP_RAZORPAY_KEY_ID);

  useEffect(() => {
    // Preload Razorpay script once mounted
    const load = async () => {
      try {
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => setReady(true);
          script.onerror = () => setReady(false);
          document.head.appendChild(script);
        } else {
          setReady(true);
        }
      } catch {
        setReady(false);
      }
    };
    load();
  }, []);

  const payWithUPI = async () => {
    try {
      setLoading(true);
      const result = await paymentService.processRazorpayPayment(
        amount,
        undefined,
        undefined,
        { upiOnly: true, upiFlow }
      );
      setLoading(false);
      onSuccess?.(result);
    } catch (e: any) {
      setLoading(false);
      onError?.(e.message || 'Payment failed');
    }
  };

  return (
    <button
      onClick={payWithUPI}
      disabled={!ready || !keyConfigured || loading}
      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
        !ready || !keyConfigured || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-900'
      }`}
    >
      {loading ? 'Processing...' : 'Pay with UPI'}
    </button>
  );
};

export default UPIRazorpayButton;