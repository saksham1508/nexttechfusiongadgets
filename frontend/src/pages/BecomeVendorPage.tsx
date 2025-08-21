import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BecomeVendorPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to vendor login page
    navigate('/vendor/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Vendor Portal...</h1>
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default BecomeVendorPage;