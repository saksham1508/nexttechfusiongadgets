// CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { createOrder } from '../store/slices/orderSlice';
import { fetchCart, clearCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethods from '../components/PaymentMethods';
import StripePayment from '../components/StripePayment';
import PayPalPayment from '../components/PayPalPayment';
import UPIPayment from '../components/UPIPayment';
import GooglePayPayment from '../components/GooglePayPayment';

import CouponApplication from '../components/CouponApplication';
import { countries } from '../utils/countries';

import { MapPin, ArrowLeft } from 'lucide-react';
import { PaymentMethod, PaymentProvider } from '../types';
import { CouponValidationResponse } from '../services/couponService';
import couponService from '../services/couponService';
import toast from 'react-hot-toast';
import axios from 'axios';
import paymentService from '../services/paymentService';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { isLoading } = useSelector((state: RootState) => state.orders);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'process'>('select');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(totalAmount);
  const [couponAppKey, setCouponAppKey] = useState(0);
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponAppKey((k) => k + 1);
    toast.success('Coupon removed');
  }

  // Always refresh cart on entering checkout to avoid stale totals
  useEffect(() => {
    dispatch(fetchCart());
    // Also refresh when other components signal cart updates
    const handler = () => dispatch(fetchCart());
    window.addEventListener('cartUpdated', handler as EventListener);
    return () => window.removeEventListener('cartUpdated', handler as EventListener);
  }, [dispatch]);

  useEffect(() => {
    setFinalAmount(totalAmount - discountAmount);
  }, [totalAmount, discountAmount]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    setOrderId(`order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const handlePaymentMethodSelect = (method: PaymentMethod | null) => {
    setSelectedPaymentMethod(method);
    if (method) {
      setSelectedProvider(method.provider);
      setPaymentStep('process');
    }
  };

  const handleCouponApplied = (couponData: CouponValidationResponse | null) => {
    setAppliedCoupon(couponData);
    if (couponData && couponData.valid) {
      setDiscountAmount(couponData.discountAmount || 0);
    } else {
      setDiscountAmount(0);
    }
  };

  // Compute vendor-allowed payment providers (per product, intersect across cart)
  const allowedProvidersComputed: PaymentProvider[] = (() => {
    try {
      const HIGH_VALUE = 30000;
      const base = paymentService.getAvailablePaymentMethods();
      const perItemAllowed = items.map((item: any) => {
        const p = item.product;
        const productAcceptance = p?.paymentAcceptance;
        let acceptance = productAcceptance;
        if (!acceptance) {
          try {
            const vendorCfg = localStorage.getItem('vendorPaymentAcceptance');
            acceptance = vendorCfg ? JSON.parse(vendorCfg) : null;
          } catch {}
        }
        if (!acceptance || acceptance.acceptAll) return base;
        const isHigh = (p?.price || 0) >= (acceptance.highValueThreshold || HIGH_VALUE);
        const list = isHigh ? acceptance.acceptedMethodsAboveThreshold : acceptance.acceptedMethods;
        return (Array.isArray(list) && list.length) ? list : base;
      });
      const intersection = perItemAllowed.reduce((acc: any[], curr: any[]) => acc.filter(x => curr.includes(x)), base);
      return intersection && intersection.length ? intersection as PaymentProvider[] : base;
    } catch {
      return paymentService.getAvailablePaymentMethods();
    }
  })();

  // Using CouponApplication for validation and apply/remove via handleCouponApplied

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      if (appliedCoupon && appliedCoupon.valid && appliedCoupon.coupon) {
        await couponService.applyCoupon(
          appliedCoupon.coupon.code,
          totalAmount,
          discountAmount
        );
      }

      const orderData = {
        orderItems: items.map((item: any) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress,
        paymentMethod: selectedProvider || 'card',
        paymentResult,
        // Use the same total shown in UI (subtotal - discount + shipping + tax)
        totalPrice: finalTotal,
        originalPrice: totalAmount,
        discountAmount,
        couponCode: appliedCoupon?.coupon?.code || null,
        orderId,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      // Notify My Orders to refresh ASAP
      window.dispatchEvent(new Event('ordersUpdated'));
      // Clear cart after successful order placement
      try { await dispatch(clearCart()).unwrap(); } catch {}
      // Also clear mock cart for guest flows (both legacy and v1 keys)
      localStorage.removeItem('mock_cart_v1');
      localStorage.removeItem('mockCart');
      window.dispatchEvent(new Event('cartUpdated'));
      // Refresh Redux cart state to reflect empty cart
      try { await dispatch(fetchCart()); } catch {}
      toast.success('Order placed successfully!');
      navigate(`/orders/${result._id}`);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to place order');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setPaymentStep('select');
  };

  const handlePaymentCancel = () => {
    setPaymentStep('select');
    setSelectedProvider(null);
  };

  const handleRazorpayPayment = async () => {
    try {
      // Use shared service which creates order and handles checkout script + verification
      const userLS = localStorage.getItem('user');
      const parsed = userLS ? JSON.parse(userLS) : null;
      const userObj = parsed?.user || parsed || {};
      const userDetails = {
        name: userObj?.name || 'Demo User',
        email: userObj?.email || 'demo@example.com',
        contact: userObj?.phone || '9999999999',
      };

      const result = await paymentService.processRazorpayPayment(
        finalTotal,
        orderId,
        userDetails
      );

      handlePaymentSuccess(result);
    } catch (err: any) {
      handlePaymentError(err?.message || 'Razorpay payment failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod && !selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }

    // Disallow methods not in allowedProvidersComputed
    const providerToUse = selectedProvider || selectedPaymentMethod?.provider || null;
    if (providerToUse && !allowedProvidersComputed.includes(providerToUse)) {
      toast.error('Selected payment method is not available for these items.');
      return;
    }

    if (providerToUse === 'razorpay') {
      handleRazorpayPayment();
    } else if (providerToUse === 'cod') {
      // Directly place order with COD without online payment
      await handlePaymentSuccess({ success: true, status: 'cod_selected' });
    } else {
      setPaymentStep('process');
      setSelectedProvider(providerToUse);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Recompute from latest Redux state to avoid stale summary
  const subtotal = totalAmount;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const cappedDiscount = Math.min(discountAmount, subtotal);
  const taxableBase = Math.max(subtotal - cappedDiscount, 0);
  const tax = Number((taxableBase * 0.08).toFixed(2));
  const finalTotal = Number((taxableBase + shipping + tax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
        <span>Checkout</span>
        {discountAmount > 0 && appliedCoupon?.coupon?.code && (
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
            {appliedCoupon.coupon.code}
          </span>
        )}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Shipping Address */}
            {/* ... (unchanged) ... */}

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {paymentStep === 'select' ? (
                <>
                  <PaymentMethods
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                    selectedAmount={finalTotal}
                    orderId={orderId}
                    allowedProviders={allowedProvidersComputed}
                  />
                  {allowedProvidersComputed.includes('cod') && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProvider('cod');
                          setPaymentStep('process');
                        }}
                        className="w-full py-3 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Place Order with Cash on Delivery
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePaymentCancel}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to payment methods</span>
                    </button>
                  </div>

                  {selectedProvider === 'stripe' && (
                    <StripePayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {selectedProvider === 'paypal' && (
                    <PayPalPayment
                      amount={Number((finalTotal / (process.env.REACT_APP_USD_INR_RATE ? parseFloat(process.env.REACT_APP_USD_INR_RATE) : 83)).toFixed(2))}
                      currency="USD"
                      orderId={orderId}
                      items={items.map((item: any) => ({
                        name: item.product.name,
                        description: item.product.description,
                        price: Number(((item.product.price * item.quantity) / (process.env.REACT_APP_USD_INR_RATE ? parseFloat(process.env.REACT_APP_USD_INR_RATE) : 83)).toFixed(2)),
                        quantity: item.quantity
                      }))}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {/* Consolidated UPI flow */}
                  {selectedProvider === 'upi' && (
                    <UPIPayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {selectedProvider === 'googlepay' && (
                    <UPIPayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {selectedProvider === 'phonepe' && (
                    <UPIPayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {selectedProvider === 'paytm' && (
                    <UPIPayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  {selectedProvider === 'razorpay' && (
                    <button
                      type="button"
                      onClick={handleRazorpayPayment}
                      className="btn-primary w-full"
                    >
                      Pay with Razorpay
                    </button>
                  )}

                  {selectedProvider === 'cod' && (
                    <button
                      type="button"
                      onClick={() => handlePaymentSuccess({ success: true, status: 'cod_selected' })}
                      className="btn-primary w-full"
                    >
                      Place Order with Cash on Delivery
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Apply Coupon - top of summary column for visibility */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply Coupon</h2>
              <CouponApplication
                orderValue={subtotal}
                paymentMethod={selectedProvider || undefined}
                products={items.map((i: any) => i.product._id)}
                onCouponApplied={handleCouponApplied}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Apply Coupon inside Order Summary */}
              <CouponApplication
                orderValue={subtotal}
                paymentMethod={selectedProvider || undefined}
                products={items.map((i: any) => i.product._id)}
                onCouponApplied={handleCouponApplied}
                className="mb-4"
              />

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className={discountAmount > 0 ? 'text-green-600 font-semibold' : ''}>
                    -₹{Math.min(discountAmount, subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Continue / Place Order button from summary */}
              <button type="submit" className="mt-6 btn-primary w-full">
                {selectedProvider ? 'Proceed' : 'Continue to Payment'}
              </button>

              {/* Note about coupon removal */}
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Remove coupon ({appliedCoupon?.coupon?.code})
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
