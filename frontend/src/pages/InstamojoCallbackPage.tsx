import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const InstamojoCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const paymentRequestId = query.get('payment_request_id');
        if (!paymentRequestId) {
          setError('Missing payment_request_id');
          toast.error('Invalid payment callback');
          navigate('/checkout');
          return;
        }
        // Ask backend to verify (new endpoint with :payment_request_id)
        const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/payments/instamojo/verify/${encodeURIComponent(paymentRequestId)}`, { credentials: 'include' });
        const result = await resp.json();

        if (result?.success) {
          toast.success('Payment verified successfully');
          navigate('/orders');
        } else {
          toast.error('Payment not completed');
          navigate('/checkout');
        }
      } catch (e: any) {
        setError(e?.message || 'Payment verification failed');
        toast.error('Payment verification failed');
        navigate('/checkout');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [navigate, query]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
        <p className="text-gray-600">Please wait while we verify your Instamojo payment...</p>
        {loading && <div className="mt-4">Loading...</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default InstamojoCallbackPage;