// CheckoutPage.tsx
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
import PhonePePayment from '../components/PhonePePayment';
import CouponApplication from '../components/CouponApplication';

import { MapPin, ArrowLeft } from 'lucide-react';
import { PaymentMethod, PaymentProvider } from '../types';
import { CouponValidationResponse } from '../services/couponService';
import couponService from '../services/couponService';
import toast from 'react-hot-toast';
import axios from 'axios';

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
    if (items.length === 0) {
      dispatch(fetchCart());
    }
  }, [dispatch, items.length]);

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

  const handleRazorpayPayment = async () => {
    try {
      // Create order from backend
      const { data } = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: Math.round(finalAmount * 100), // paise
        currency: "INR"
      });

      const options: any = {
        key: "rzp_test_xxxxxxx", // replace with your Razorpay Test Key
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "My Ecommerce",
        description: "Test Transaction",
        handler: (response: any) => {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: "Demo User",
          email: "demo@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      handlePaymentError("Razorpay payment failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod && !selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }
    if (selectedProvider === 'razorpay') {
      handleRazorpayPayment();
    } else if (selectedProvider === 'cod') {
      // Directly place order with COD without online payment
      await handlePaymentSuccess({ success: true, status: 'cod_selected' });
    } else {
      setPaymentStep('process');
      setSelectedProvider(selectedPaymentMethod?.provider || null);
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

  const subtotal = totalAmount;
  const shipping = totalAmount > 50 ? 0 : 9.99;
  const tax = (totalAmount - discountAmount) * 0.08;
  const finalTotal = subtotal - discountAmount + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

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
                  />
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

          {/* Order Summary (unchanged) */}
          {/* ... */}
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
