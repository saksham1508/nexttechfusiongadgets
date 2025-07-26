import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  User,
  Phone,
  Navigation,
  AlertCircle
} from 'lucide-react';

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ComponentType<any>;
}

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  rating: number;
  image: string;
  vehicleNumber: string;
}

interface DeliveryTrackingProps {
  orderId: string;
  estimatedTime: number; // in minutes
  currentStatus: string;
  deliveryAgent?: DeliveryAgent;
  onCallAgent?: () => void;
  onTrackLive?: () => void;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  orderId,
  estimatedTime,
  currentStatus,
  deliveryAgent,
  onCallAgent,
  onTrackLive
}) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [currentStep, setCurrentStep] = useState(1);

  const deliverySteps: DeliveryStep[] = [
    {
      id: '1',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      timestamp: '2 min ago',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: '2',
      title: 'Preparing Order',
      description: 'Your items are being picked and packed',
      timestamp: '1 min ago',
      status: 'completed',
      icon: Package
    },
    {
      id: '3',
      title: 'Out for Delivery',
      description: 'Your order is on the way to your location',
      status: 'current',
      icon: Truck
    },
    {
      id: '4',
      title: 'Delivered',
      description: 'Order delivered successfully',
      status: 'pending',
      icon: CheckCircle
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with ETA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Order #{orderId}</h2>
            <p className="text-green-100">Arriving in {formatTime(timeRemaining)}</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(currentStep / deliverySteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Delivery Agent Info */}
      {deliveryAgent && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Your Delivery Partner</h3>
          <div className="flex items-center space-x-4">
            <img
              src={deliveryAgent.image}
              alt={deliveryAgent.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{deliveryAgent.name}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600">{deliveryAgent.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Vehicle: {deliveryAgent.vehicleNumber}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onCallAgent}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                title="Call delivery partner"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={onTrackLive}
                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                title="Track live location"
              >
                <Navigation className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Steps */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Delivery Status</h3>
        <div className="space-y-4">
          {deliverySteps.map((step, index) => {
            const status = getStepStatus(index);
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : status === 'current'
                      ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`
                      font-medium
                      ${status === 'completed' 
                        ? 'text-green-900' 
                        : status === 'current'
                        ? 'text-blue-900'
                        : 'text-gray-500'
                      }
                    `}>
                      {step.title}
                    </h4>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">{step.timestamp}</span>
                    )}
                  </div>
                  <p className={`
                    text-sm mt-1
                    ${status === 'completed' 
                      ? 'text-green-700' 
                      : status === 'current'
                      ? 'text-blue-700'
                      : 'text-gray-500'
                    }
                  `}>
                    {step.description}
                  </p>
                  
                  {status === 'current' && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">In Progress</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Delivery Instructions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Please be available at the delivery address</li>
              <li>• Keep your phone accessible for delivery updates</li>
              <li>• Have a valid ID ready for verification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">View on Map</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;