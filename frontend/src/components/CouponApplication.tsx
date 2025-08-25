import React, { useState, useEffect } from 'react';
import { Tag, X, Check, AlertCircle, Gift, Percent } from 'lucide-react';
import couponService, { Coupon, CouponValidationResponse } from '../services/couponService';
import { getEnvironmentInfo } from '../config/api';
import toast from 'react-hot-toast';

interface CouponApplicationProps {
  orderValue: number;
  paymentMethod?: string;
  products?: string[];
  onCouponApplied: (coupon: CouponValidationResponse | null) => void;
  className?: string;
}

const CouponApplication: React.FC<CouponApplicationProps> = ({
  orderValue,
  paymentMethod,
  products,
  onCouponApplied,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [error, setError] = useState<string>('');

  const envInfo = getEnvironmentInfo();

  useEffect(() => {
    loadAvailableCoupons();
  }, []);

  const loadAvailableCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      let coupons: Coupon[] = [];

      // In dev/test, try public coupons first so guests see mock coupons
      if (envInfo.isDevelopment || envInfo.isTest) {
        try {
          coupons = await couponService.getActiveCoupons();
        } catch (e) {
          // ignore and try user-specific next
        }
      }

      if (!coupons.length && token) {
        // Personalized list when logged in
        coupons = await couponService.getUserAvailableCoupons();
      } else if (!coupons.length) {
        // Not logged in: show general active coupons
        coupons = await couponService.getActiveCoupons();
      }

      const validCoupons = coupons.filter(coupon => {
        const isValidForOrder = orderValue >= coupon.minOrderValue;
        const isValidNow = couponService.isValidNow(coupon);
        if (envInfo.isDevelopment || envInfo.isTest) {
          return isValidNow;
        }
        return isValidForOrder && isValidNow;
      });

      setAvailableCoupons(validCoupons);
      // Show available coupons by default when present
      setShowAvailableCoupons(validCoupons.length > 0);
    } catch (error: any) {
      console.error('Error loading available coupons:', error);
      const status = error?.response?.status;
      if (status === 401) {
        // Unauthorized: likely missing/expired token. In dev/test, fallback to public coupons
        if (envInfo.isDevelopment || envInfo.isTest) {
          try {
            const publicCoupons = await couponService.getActiveCoupons();
            const valid = publicCoupons.filter(c => couponService.isValidNow(c));
            setAvailableCoupons(valid);
            setShowAvailableCoupons(valid.length > 0);
            return;
          } catch (_) {
            // fall through
          }
        }
        setAvailableCoupons([]);
        // Do not auto-open list when unauthorized
        setShowAvailableCoupons(false);
        if (envInfo.debugMode) {
          toast('Sign in to view personalized coupons', { icon: '🔐' });
        }
        return;
      }
      if (envInfo.debugMode) {
        toast.error('Failed to load available coupons');
      }
    }
  };

  const validateAndApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Require auth for validation/apply endpoints
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to apply coupons');
        setIsValidating(false);
        return;
      }

      // Normalize payment method to backend-expected values
      const normalizePaymentMethod = (method?: string) => {
        switch (method) {
          case 'stripe':
          case 'paypal':
            return 'card';
          case 'googlepay':
          case 'razorpay':
          case 'phonepe':
            return 'upi';
          case 'paytm':
            return 'wallet';
          default:
            return method;
        }
      };

      // Pre-checks for clearer messages before hitting API
      const selectedNormalized = normalizePaymentMethod(paymentMethod);
      const matchedCoupon = availableCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
      if (matchedCoupon) {
        if (orderValue < matchedCoupon.minOrderValue) {
          setError(`Minimum order value should be ₹${matchedCoupon.minOrderValue}`);
          setIsValidating(false);
          return;
        }
        if (matchedCoupon.paymentMethods?.length && selectedNormalized && !matchedCoupon.paymentMethods.includes(selectedNormalized)) {
          setError(`This coupon is only valid for ${matchedCoupon.paymentMethods.join(', ')} payments`);
          setIsValidating(false);
          return;
        }
      }

      const validationData = {
        code: code.trim().toUpperCase(),
        orderValue,
        products,
        paymentMethod: selectedNormalized
      };

      const response = await couponService.validateCoupon(validationData);

      if (response.valid) {
        setAppliedCoupon(response);
        onCouponApplied(response);
        toast.success(`Coupon applied! You saved ₹${response.discountAmount}`);
        
        // Environment-specific logging
        if (envInfo.debugMode) {
          console.log('Coupon applied:', response);
        }
      } else {
        setError(response.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        onCouponApplied(null);
        
        if (envInfo.debugMode) {
          console.log('Coupon validation failed:', response);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to validate coupon';
      setError(errorMessage);
      setAppliedCoupon(null);
      onCouponApplied(null);
      
      if (envInfo.debugMode) {
        console.error('Coupon validation error:', error);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
    onCouponApplied(null);
    toast.success('Coupon removed');
  };

  const applyCouponFromList = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    validateAndApplyCoupon(coupon.code);
    setShowAvailableCoupons(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndApplyCoupon(couponCode);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Apply Coupon</h3>
          {envInfo.debugMode && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {envInfo.envName}
            </span>
          )}
        </div>
        {availableCoupons.length > 0 && (
          <button
            onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAvailableCoupons ? 'Hide' : 'View Available'} ({availableCoupons.length})
          </button>
        )}
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  {appliedCoupon.coupon?.code} Applied!
                </p>
                <p className="text-sm text-green-600">
                  You saved ₹{appliedCoupon.discountAmount}
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input Form */}
      {!appliedCoupon && (
        <div className="mb-4" role="group" aria-label="Apply coupon">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter coupon code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isValidating}
              />
            </div>
            <button
              type="button"
              onClick={() => validateAndApplyCoupon(couponCode)}
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Available Coupons List */}
      {showAvailableCoupons && availableCoupons.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Coupons</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableCoupons.map((coupon) => {
              const discount = couponService.calculateDiscount(coupon, orderValue);
              const isEligible = orderValue >= coupon.minOrderValue;
              
              return (
                <div
                  key={coupon._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isEligible 
                      ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => isEligible && applyCouponFromList(coupon)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Gift className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="font-mono font-bold text-blue-600">
                            {coupon.code}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          coupon.type === 'flash' ? 'bg-red-100 text-red-800' :
                          coupon.type === 'welcome' ? 'bg-green-100 text-green-800' :
                          coupon.type === 'bank' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{coupon.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-green-600">
                          {couponService.formatDiscount(coupon)}
                        </span>
                        {isEligible && discount > 0 && (
                          <span className="text-xs text-green-600">
                            Save ₹{discount}
                          </span>
                        )}
                      </div>
                      {!isEligible && (
                        <p className="text-xs text-red-600 mt-1">
                          Minimum order: ₹{coupon.minOrderValue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environment-specific debug info */}
      {envInfo.debugMode && (
        <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
          <strong>Debug Info:</strong>
          <div>Order Value: ₹{orderValue}</div>
          <div>Payment Method: {paymentMethod || 'Not selected'}</div>
          <div>Available Coupons: {availableCoupons.length}</div>
          {appliedCoupon && (
            <div>Applied Discount: ₹{appliedCoupon.discountAmount}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponApplication;