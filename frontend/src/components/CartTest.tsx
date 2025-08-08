import React from 'react';
import { Link } from 'react-router-dom';

const CartTest: React.FC = () => {
  return (
    <div className="fixed top-20 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 z-50">
      <h3 className="font-bold text-sm mb-2">Cart Navigation Test</h3>
      <div className="space-y-2">
        <Link 
          to="/cart" 
          className="block bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          onClick={() => console.log('🧪 Test: Direct cart link clicked')}
        >
          Go to Cart (Direct Link)
        </Link>
        
        <button
          onClick={() => {
            console.log('🧪 Test: Programmatic navigation to cart');
            window.location.href = '/cart';
          }}
          className="block w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Go to Cart (Window Location)
        </button>
        
        <div className="text-xs text-gray-600 mt-2">
          Current URL: {window.location.pathname}
        </div>
      </div>
    </div>
  );
};

export default CartTest;