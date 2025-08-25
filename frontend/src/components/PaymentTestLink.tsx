import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const PaymentTestLink: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        to="/payment"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
      >
        <CreditCard className="w-5 h-5" />
        <span>Test Payment</span>
      </Link>
    </div>
  );
};

export default PaymentTestLink;