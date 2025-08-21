import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

// Add keyframes animation to the document
const pulseAnimation = `
  @keyframes vendorLinkPulse {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
`;

const VendorNavLink: React.FC = () => {
  // Add the animation style to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = pulseAnimation;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Link
      to="/become-vendor"
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all flex items-center space-x-2"
      style={{ animation: 'vendorLinkPulse 2s infinite' }}
    >
      <Store className="h-4 w-4" />
      <span>Become a Vendor</span>
    </Link>
  );
};

export default VendorNavLink;