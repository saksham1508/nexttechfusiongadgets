import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAppSelector } from '../store/store';

interface PaymentButtonProps {
  amount?: number; // Optional override amount
  label?: string;
  className?: string;
}

// Creates Instamojo payment request via backend and redirects to hosted payment page
const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, label = 'Pay Now', className }) => {
  const [loading, setLoading] = useState(false);

  // Pull user and cart from Redux
  const user = useAppSelector((state) => state.auth.user);
  const cartTotal = useAppSelector((state) => state.cart.totalAmount);

  const startPayment = async () => {
    setLoading(true);
    try {
      const payload = {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        amount: typeof amount === 'number' ? amount : cartTotal,
        // Redirect back to frontend to handle post-payment confirmation
        redirectUrl: `${window.location.origin}/payment/instamojo/callback`
      } as any;

      if (!payload.amount || !payload.email) {
        throw new Error('Missing amount or user email');
      }

      // NOTE: Backend mounts Instamojo routes at /api/payments/instamojo
      // Endpoint added: POST /create-order
      const { data } = await axiosInstance.post('/payments/instamojo/create-order', payload, {
        withCredentials: true,
      });

      const redirectUrl = data?.payment_url || data?.payment_request?.longurl;
      if (!redirectUrl) throw new Error('Failed to get Instamojo payment URL');

      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Instamojo payment init failed:', err);
      alert((err as any)?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button disabled={loading} onClick={startPayment} className={className}>
      {loading ? 'Processing...' : label}
    </button>
  );
};

export default PaymentButton;