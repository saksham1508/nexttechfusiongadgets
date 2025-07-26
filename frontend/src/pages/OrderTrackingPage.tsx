import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DeliveryTracking from '../components/DeliveryTracking';
import { ArrowLeft, Package, MapPin, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  estimatedDelivery: number;
  deliveryAddress: string;
  orderDate: string;
}

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock delivery agent data
  const deliveryAgent = {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    rating: 4.8,
    image: '/api/placeholder/48/48',
    vehicleNumber: 'DL 01 AB 1234'
  };

  useEffect(() => {
    // Mock order data - replace with actual API call
    const mockOrder: Order = {
      id: orderId || 'ORD123456',
      items: [
        {
          id: '1',
          name: 'iPhone 15 Pro Max',
          image: '/api/placeholder/80/80',
          price: 134900,
          quantity: 1
        },
        {
          id: '2',
          name: 'AirPods Pro (2nd Gen)',
          image: '/api/placeholder/80/80',
          price: 24900,
          quantity: 1
        }
      ],
      total: 159800,
      status: 'out_for_delivery',
      estimatedDelivery: 12,
      deliveryAddress: '123 Tech Street, Bangalore, Karnataka 560001',
      orderDate: '2024-01-15T10:30:00Z'
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setIsLoading(false);
    }, 1000);
  }, [orderId]);

  const handleCallAgent = () => {
    window.open(`tel:${deliveryAgent.phone}`);
  };

  const handleTrackLive = () => {
    // Open live tracking in a new window or navigate to map view
    window.open('/live-tracking', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/orders"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Orders</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Order #{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking */}
          <div className="lg:col-span-2">
            <DeliveryTracking
              orderId={order.id}
              estimatedTime={order.estimatedDelivery}
              currentStatus={order.status}
              deliveryAgent={deliveryAgent}
              onCallAgent={handleCallAgent}
              onTrackLive={handleTrackLive}
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    ₹{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-gray-700">{order.deliveryAddress}</p>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="text-gray-900 font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className="text-green-600 font-medium">Paid</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                  <Package className="h-4 w-4" />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;