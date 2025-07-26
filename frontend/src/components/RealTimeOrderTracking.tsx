import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  Phone,
  MessageCircle,
  Navigation,
  Zap,
  User,
  Star,
  AlertCircle
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface OrderStatus {
  id: string;
  status: 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered';
  timestamp: string;
  location?: string;
  message: string;
  isActive: boolean;
  estimatedTime?: string;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  rating: number;
  photo: string;
  vehicleNumber: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface RealTimeOrderTrackingProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RealTimeOrderTracking: React.FC<RealTimeOrderTrackingProps> = ({
  orderId,
  isOpen,
  onClose
}) => {
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.1 });

  // Mock real-time updates
  useEffect(() => {
    if (!isOpen) return;

    // Initialize order statuses
    const initialStatuses: OrderStatus[] = [
      {
        id: '1',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        message: 'Order confirmed and payment received',
        isActive: true
      },
      {
        id: '2',
        status: 'preparing',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        message: 'Your order is being prepared',
        isActive: true,
        estimatedTime: '2-3 minutes'
      },
      {
        id: '3',
        status: 'picked_up',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        message: 'Order picked up by delivery partner',
        isActive: true,
        location: 'NextTech Store, MG Road'
      },
      {
        id: '4',
        status: 'in_transit',
        timestamp: new Date().toISOString(),
        message: 'On the way to your location',
        isActive: true,
        estimatedTime: '5-7 minutes',
        location: 'Brigade Road Junction'
      },
      {
        id: '5',
        status: 'delivered',
        timestamp: '',
        message: 'Order delivered successfully',
        isActive: false,
        estimatedTime: '3-5 minutes'
      }
    ];

    setOrderStatuses(initialStatuses);
    setCurrentStep(3); // Currently in transit

    // Mock delivery partner
    setDeliveryPartner({
      id: 'dp-001',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      rating: 4.8,
      photo: '/api/placeholder/100/100?text=RK',
      vehicleNumber: 'KA 01 AB 1234',
      currentLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Brigade Road Junction, Bangalore'
      }
    });

    setEstimatedDelivery('5-7 minutes');

    // Simulate real-time updates
    const interval = setInterval(() => {
      setOrderStatuses(prev => prev.map(status => {
        if (status.status === 'in_transit') {
          return {
            ...status,
            timestamp: new Date().toISOString(),
            location: getRandomLocation()
          };
        }
        return status;
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const getRandomLocation = () => {
    const locations = [
      'Brigade Road Junction',
      'Commercial Street',
      'MG Road Metro Station',
      'Trinity Circle',
      'Your Building Entrance'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getStatusIcon = (status: OrderStatus['status'], isActive: boolean) => {
    const iconClass = `h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`;
    
    switch (status) {
      case 'confirmed':
        return <CheckCircle className={iconClass} />;
      case 'preparing':
        return <Package className={iconClass} />;
      case 'picked_up':
        return <Truck className={iconClass} />;
      case 'in_transit':
        return <Navigation className={iconClass} />;
      case 'delivered':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusColor = (status: OrderStatus['status'], isActive: boolean) => {
    if (!isActive) return 'bg-gray-300';
    
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'picked_up':
        return 'bg-purple-500';
      case 'in_transit':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-600';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getRelativeTime = (timestamp: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Order Tracking</h2>
              <p className="text-blue-100">Order ID: #{orderId}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close tracking"
            >
              ✕
            </button>
          </div>
          
          {/* Estimated Delivery */}
          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/30 p-2 rounded-full">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-blue-100">Estimated Delivery</p>
                <p className="text-lg font-bold">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Delivery Partner Info */}
          {deliveryPartner && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Partner</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={deliveryPartner.photo}
                  alt={deliveryPartner.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{deliveryPartner.name}</h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{deliveryPartner.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Vehicle: {deliveryPartner.vehicleNumber}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="bg-green-100 text-green-700 p-3 rounded-full hover:bg-green-200 transition-colors"
                    title="Call delivery partner"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="bg-blue-100 text-blue-700 p-3 rounded-full hover:bg-blue-200 transition-colors"
                    title="Message delivery partner"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Current Location */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Current Location:</span>
                </div>
                <p className="text-sm text-orange-800 mt-1">
                  {deliveryPartner.currentLocation.address}
                </p>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="p-6" ref={ref}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {orderStatuses.map((status, index) => (
                <motion.div
                  key={status.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative flex items-start space-x-4 pb-8"
                >
                  {/* Status Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(status.status, status.isActive)}`}>
                    {getStatusIcon(status.status, status.isActive)}
                    
                    {/* Pulse animation for active status */}
                    {status.isActive && index === currentStep && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20"></div>
                    )}
                  </div>
                  
                  {/* Status Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${status.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {status.message}
                      </h4>
                      {status.timestamp && (
                        <span className="text-sm text-gray-500">
                          {formatTime(status.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {status.location && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{status.location}</span>
                      </div>
                    )}
                    
                    {status.estimatedTime && status.isActive && !status.timestamp && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-sm text-blue-600">ETA: {status.estimatedTime}</span>
                      </div>
                    )}
                    
                    {status.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(status.timestamp)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Updates */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Live Tracking Active</p>
                <p className="text-xs text-gray-600">Updates every 30 seconds</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Need Help?</h4>
              </div>
              <p className="text-sm text-red-800 mt-1">
                If you face any issues with your delivery, contact our support team.
              </p>
              <div className="flex space-x-3 mt-3">
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Call Support
                </button>
                <button
                  type="button"
                  className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
                >
                  Chat Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeOrderTracking;