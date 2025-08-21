import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';

const VendorBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center flex-wrap">
          <Store className="h-6 w-6 mr-2 animate-bounce" />
          <span className="font-medium text-lg">Want to sell your products on our marketplace?</span>
          <Link 
            to="/become-vendor" 
            className="ml-4 bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100 transition-all flex items-center"
            style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
          >
            Become a Vendor Now <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorBanner;