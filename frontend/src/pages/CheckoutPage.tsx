import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { createOrder } from '../store/slices/orderSlice';
import { fetchCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentMethods from '../components/PaymentMethods';
import StripePayment from '../components/StripePayment';
import PayPalPayment from '../components/PayPalPayment';
import UPIPayment from '../components/UPIPayment';
import GooglePayPayment from '../components/GooglePayPayment';
import CouponApplication from '../components/CouponApplication';
import { CreditCard, Truck, MapPin, ArrowLeft } from 'lucide-react';
import { PaymentMethod, PaymentProvider } from '../types';
import { CouponValidationResponse } from '../services/couponService';
import couponService from '../services/couponService';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { isLoading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'process'>('select');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(totalAmount);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (items.length === 0) {
      dispatch(fetchCart());
    }
  }, [dispatch, user, items.length, navigate]);

  // Update final amount when total amount or coupon changes
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
    // Generate order ID when component mounts
    setOrderId(`order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const handlePaymentMethodSelect = (method: PaymentMethod | null) => {
    setSelectedPaymentMethod(method);
  };

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setPaymentStep('process');
  };

  const handleCouponApplied = (couponData: CouponValidationResponse | null) => {
    setAppliedCoupon(couponData);
    if (couponData && couponData.valid) {
      setDiscountAmount(couponData.discountAmount || 0);
    } else {
      setDiscountAmount(0);
    }
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Apply coupon if one is selected
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
        totalPrice: finalAmount,
        originalPrice: totalAmount,
        discountAmount,
        couponCode: appliedCoupon?.coupon?.code || null,
        orderId,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentMethod && !selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }

    // If a payment method is selected, proceed to payment processing
    if (selectedPaymentMethod) {
      setPaymentStep('process');
      setSelectedProvider(selectedPaymentMethod.provider);
    }
  };

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = totalAmount;
  const shipping = totalAmount > 50 ? 0 : 9.99;
  const tax = (totalAmount - discountAmount) * 0.08;
  const finalTotal = subtotal - discountAmount + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={shippingAddress.street}
                    onChange={handleShippingChange}
                    className="input-field"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="input-field"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className="input-field"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={shippingAddress.zipCode}
                    onChange={handleShippingChange}
                    className="input-field"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="input-field"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {paymentStep === 'select' ? (
                <PaymentMethods
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                  selectedAmount={finalTotal}
                  orderId={orderId}
                />
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
                      amount={finalTotal}
                      currency="USD"
                      orderId={orderId}
                      items={items.map((item: any) => ({
                        name: item.product.name,
                        description: item.product.description,
                        price: item.product.price,
                        quantity: item.quantity
                      }))}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedProvider === 'googlepay' && (
                    <GooglePayPayment
                      amount={finalTotal}
                      currency="INR"
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {(selectedProvider === 'upi' || selectedProvider === 'razorpay' || selectedProvider === 'phonepe' || selectedProvider === 'paytm') && (
                    <UPIPayment
                      amount={finalTotal}
                      orderId={orderId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {items.map((item: any) => (
                  <div key={item.product._id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]?.url || '/placeholder-image.jpg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Application */}
              <CouponApplication
                orderValue={totalAmount}
                paymentMethod={selectedProvider || undefined}
                products={items.map(item => item.product._id)}
                onCouponApplied={handleCouponApplied}
                className="mb-6"
              />

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {appliedCoupon?.coupon?.code && `(${appliedCoupon.coupon.code})`}</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {paymentStep === 'select' && (
                <button
                  type="submit"
                  disabled={isLoading || (!selectedPaymentMethod && !selectedProvider)}
                  className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Continue to Payment'}
                </button>
              )}
              
              {paymentStep === 'process' && (
                <div className="text-center text-sm text-gray-600">
                  Complete your payment above to place the order
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
