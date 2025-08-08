import React, { useState } from 'react';
import { 
  Gift, 
  Percent, 
  Clock, 
  Copy, 
  Check, 
  Star,
  Zap,
  CreditCard,
  Users,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrder: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit?: number;
  usedCount?: number;
  category: 'all' | 'smartphones' | 'laptops' | 'audio' | 'accessories';
  type: 'welcome' | 'flash' | 'bank' | 'loyalty' | 'referral';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const OffersAndCoupons: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons: Coupon[] = [
    {
      id: '1',
      code: 'WELCOME50',
      title: 'Welcome Offer',
      description: 'Get 50% off on your first order',
      discount: 50,
      discountType: 'percentage',
      minOrder: 1000,
      maxDiscount: 500,
      validUntil: '2024-12-31',
      category: 'all',
      type: 'welcome',
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: '2',
      code: 'FLASH15',
      title: 'Flash Sale',
      description: 'Extra 15% off on flash sale items',
      discount: 15,
      discountType: 'percentage',
      minOrder: 500,
      validUntil: '2024-01-20',
      usageLimit: 1000,
      usedCount: 750,
      category: 'all',
      type: 'flash',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: '3',
      code: 'HDFC200',
      title: 'HDFC Bank Offer',
      description: '₹200 off on HDFC credit/debit cards',
      discount: 200,
      discountType: 'fixed',
      minOrder: 2000,
      validUntil: '2024-01-25',
      category: 'all',
      type: 'bank',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: '4',
      code: 'SMARTPHONE25',
      title: 'Smartphone Special',
      description: '25% off on all smartphones',
      discount: 25,
      discountType: 'percentage',
      minOrder: 10000,
      maxDiscount: 5000,
      validUntil: '2024-01-30',
      category: 'smartphones',
      type: 'flash',
      icon: Percent,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: '5',
      code: 'LOYALTY100',
      title: 'Loyalty Reward',
      description: '₹100 off for premium members',
      discount: 100,
      discountType: 'fixed',
      minOrder: 1500,
      validUntil: '2024-02-15',
      category: 'all',
      type: 'loyalty',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: '6',
      code: 'REFER300',
      title: 'Refer & Earn',
      description: '₹300 off when you refer a friend',
      discount: 300,
      discountType: 'fixed',
      minOrder: 2500,
      validUntil: '2024-03-01',
      category: 'all',
      type: 'referral',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discount}% OFF`;
    }
    return `₹${coupon.discount} OFF`;
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Expires soon';
  };

  const getUsageProgress = (coupon: Coupon) => {
    if (coupon.usageLimit == null || !coupon.usedCount) return null;
    return (coupon.usedCount / coupon.usageLimit) * 100;
  };

  return (
    <section className="py-8 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gift className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900">Exclusive Offers & Coupons</h2>
          </div>
          <p className="text-lg text-gray-600">
            Save more with our amazing deals and discount codes
          </p>
        </div>

        {/* Featured Offer Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">🎉 Super Saver Deal!</h3>
              <p className="text-purple-100 mb-4">
                Get up to 50% off + Free delivery on orders above ₹999
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                  <span className="font-bold text-lg">SUPERSAVER</span>
                </div>
                <button
                  onClick={() => handleCopyCode('SUPERSAVER')}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Copy Code
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <ShoppingBag className="h-24 w-24 text-white opacity-20" />
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const IconComponent = coupon.icon;
            const usageProgress = getUsageProgress(coupon);
            const timeRemaining = getTimeRemaining(coupon.validUntil);
            const isCopied = copiedCode === coupon.code;
            
            return (
              <div
                key={coupon.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Coupon Header */}
                <div className={`${coupon.bgColor} p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${coupon.bgColor} rounded-lg flex items-center justify-center border-2 border-white`}>
                        <IconComponent className={`h-4 w-4 ${coupon.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${coupon.color}`}>
                        {coupon.type.toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-lg font-bold ${coupon.color}`}>
                      {formatDiscount(coupon)}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1">{coupon.title}</h3>
                  <p className="text-sm text-gray-600">{coupon.description}</p>
                </div>

                {/* Coupon Body */}
                <div className="p-4">
                  {/* Coupon Code */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Coupon Code
                        </span>
                        <div className="font-mono font-bold text-lg text-gray-900">
                          {coupon.code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all ${
                          isCopied
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4" />
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
                  </div>

                  {/* Terms */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Min. Order:</span>
                      <span className="font-medium">₹{coupon.minOrder.toLocaleString()}</span>
                    </div>
                    {coupon.maxDiscount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Max. Discount:</span>
                        <span className="font-medium">₹{coupon.maxDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium">{new Date(coupon.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {usageProgress !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Used: {coupon.usedCount}</span>
                        <span>Limit: {coupon.usageLimit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${usageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Time Remaining */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{timeRemaining}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terms & Conditions */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Coupons are valid for limited time only</li>
            <li>• Cannot be combined with other offers</li>
            <li>• Applicable on select products only</li>
            <li>• Minimum order value required</li>
            <li>• NexFuga reserves the right to modify or cancel offers</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default OffersAndCoupons;