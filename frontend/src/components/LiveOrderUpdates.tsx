import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X,
  MapPin,
  Phone,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderUpdate {
  id: string;
  orderId: string;
  type: 'confirmed' | 'preparing' | 'picked' | 'out_for_delivery' | 'delivered' | 'delayed';
  title: string;
  message: string;
  timestamp: Date;
  estimatedTime?: number;
  deliveryAgent?: {
    name: string;
    phone: string;
    location: string;
  };
  priority: 'low' | 'medium' | 'high';
}

interface LiveOrderUpdatesProps {
  userId?: string;
}

const LiveOrderUpdates: React.FC<LiveOrderUpdatesProps> = ({ userId }) => {
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock real-time updates
  useEffect(() => {
    const mockUpdates: OrderUpdate[] = [
      {
        id: '1',
        orderId: 'ORD123456',
        type: 'confirmed',
        title: 'Order Confirmed!',
        message: 'Your order for iPhone 15 Pro has been confirmed and is being prepared.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        estimatedTime: 15,
        priority: 'medium'
      },
      {
        id: '2',
        orderId: 'ORD123456',
        type: 'preparing',
        title: 'Order Being Prepared',
        message: 'Your items are being picked and packed at our fulfillment center.',
        timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        estimatedTime: 12,
        priority: 'medium'
      },
      {
        id: '3',
        orderId: 'ORD123456',
        type: 'out_for_delivery',
        title: 'Out for Delivery!',
        message: 'Your order is on the way. Rajesh will deliver it in 8 minutes.',
        timestamp: new Date(),
        estimatedTime: 8,
        deliveryAgent: {
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          location: '500m away'
        },
        priority: 'high'
      }
    ];

    setUpdates(mockUpdates);
    setUnreadCount(mockUpdates.length);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const randomUpdate: OrderUpdate = {
        id: Date.now().toString(),
        orderId: 'ORD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: ['confirmed', 'preparing', 'out_for_delivery', 'delivered'][Math.floor(Math.random() * 4)] as any,
        title: 'New Order Update',
        message: 'Your order status has been updated.',
        timestamp: new Date(),
        estimatedTime: Math.floor(Math.random() * 20) + 5,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
      };

      setUpdates(prev => [randomUpdate, ...prev.slice(0, 9)]); // Keep only 10 latest
      setUnreadCount(prev => prev + 1);
    }, 30000); // New update every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'confirmed': return CheckCircle;
      case 'preparing': return Package;
      case 'picked': return Package;
      case 'out_for_delivery': return Truck;
      case 'delivered': return CheckCircle;
      case 'delayed': return Clock;
      default: return Bell;
    }
  };

  const getUpdateColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'preparing': return 'text-blue-600 bg-blue-50';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setUnreadCount(0); // Mark as read when opened
    }
  };

  const handleCallAgent = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleTrackLocation = () => {
    // Open tracking in new window
    window.open('/live-tracking', '_blank');
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleToggleVisibility}
          className="relative bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Bell className="h-6 w-6 text-gray-700" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </button>
      </div>

      {/* Updates Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">Live Updates</h3>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Updates List */}
            <div className="max-h-96 overflow-y-auto">
              {updates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No updates yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {updates.map((update, index) => {
                    const IconComponent = getUpdateIcon(update.type);
                    const colorClasses = getUpdateColor(update.type, update.priority);
                    
                    return (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {update.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(update.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {update.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-mono">
                                #{update.orderId}
                              </span>
                              {update.estimatedTime && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {update.estimatedTime} min
                                </span>
                              )}
                            </div>

                            {/* Delivery Agent Info */}
                            {update.deliveryAgent && (
                              <div className="mt-3 bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-blue-900">
                                    Delivery Partner
                                  </span>
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs">{update.deliveryAgent.location}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">
                                    {update.deliveryAgent.name}
                                  </span>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleCallAgent(update.deliveryAgent!.phone)}
                                      className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                      title="Call delivery partner"
                                    >
                                      <Phone className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={handleTrackLocation}
                                      className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                      title="Track live location"
                                    >
                                      <Navigation className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Orders
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveOrderUpdates;