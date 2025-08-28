import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';

interface InventoryStatusProps {
  stock: number;
  reserved?: number;
  threshold?: {
    low: number;
    critical: number;
  };
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({
  stock,
  reserved = 0,
  threshold = { low: 10, critical: 3 },
  showDetails = false,
  size = 'md'
}) => {
  const availableStock = stock - reserved;
  
  const getStockStatus = () => {
    if (availableStock <= 0) return 'out_of_stock';
    if (availableStock <= threshold.critical) return 'critical';
    if (availableStock <= threshold.low) return 'low';
    return 'in_stock';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return {
          label: 'Out of Stock',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          pulse: false
        };
      case 'critical':
        return {
          label: 'Critical Stock',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          pulse: true
        };
      case 'low':
        return {
          label: 'Low Stock',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: Clock,
          pulse: false
        };
      case 'in_stock':
        return {
          label: 'In Stock',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          pulse: false
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Package,
          pulse: false
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          icon: 'h-3 w-3',
          text: 'text-xs',
          badge: 'text-xs px-1.5 py-0.5'
        };
      case 'lg':
        return {
          container: 'px-4 py-3',
          icon: 'h-5 w-5',
          text: 'text-base',
          badge: 'text-sm px-3 py-1'
        };
      default:
        return {
          container: 'px-3 py-2',
          icon: 'h-4 w-4',
          text: 'text-sm',
          badge: 'text-xs px-2 py-1'
        };
    }
  };

  const status = getStockStatus();
  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses();
  const IconComponent = config.icon;

  const getStockMessage = () => {
    if (availableStock <= 0) {
      return 'Currently unavailable';
    }
    if (availableStock <= threshold.critical) {
      return `Only ${availableStock} left - Order now!`;
    }
    if (availableStock <= threshold.low) {
      return `${availableStock} items remaining`;
    }
    return `${availableStock}+ available`;
  };

  const getDeliveryMessage = () => {
    if (availableStock <= 0) {
      return 'Notify when available';
    }
    if (availableStock <= threshold.critical) {
      return 'Express delivery available';
    }
    return 'Fast delivery';
  };

  if (!showDetails) {
    // Simple badge version
    return (
      <div className={`
        inline-flex items-center space-x-1 rounded-full border
        ${config.bgColor} ${config.borderColor} ${config.color}
        ${sizeClasses.container} ${sizeClasses.badge}
        ${config.pulse ? 'animate-pulse' : ''}
      `}>
        <IconComponent className={sizeClasses.icon} />
        <span className={`font-medium ${sizeClasses.text}`}>
          {availableStock <= 0 ? 'Out of Stock' : `${availableStock} left`}
        </span>
      </div>
    );
  }

  // Detailed version
  return (
    <div className={`
      rounded-lg border ${config.bgColor} ${config.borderColor}
      ${sizeClasses.container}
    `}>
      <div className="flex items-start space-x-3">
        <div className={`
          flex-shrink-0 ${config.pulse ? 'animate-pulse' : ''}
        `}>
          <IconComponent className={`${sizeClasses.icon} ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium ${config.color} ${sizeClasses.text}`}>
              {config.label}
            </h4>
            <span className={`
              font-bold ${config.color} ${sizeClasses.text}
            `}>
              {availableStock}
            </span>
          </div>
          
          <p className={`text-gray-600 ${sizeClasses.text} mb-2`}>
            {getStockMessage()}
          </p>
          
          {/* Stock breakdown */}
          {reserved > 0 && (
            <div className={`text-gray-500 ${sizeClasses.text} mb-2`}>
              <div className="flex justify-between">
                <span>Total stock:</span>
                <span>{stock}</span>
              </div>
              <div className="flex justify-between">
                <span>Reserved:</span>
                <span>{reserved}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Available:</span>
                <span>{availableStock}</span>
              </div>
            </div>
          )}
          
          {/* Delivery info */}
          <div className={`
            flex items-center space-x-1 ${sizeClasses.text}
            ${availableStock > 0 ? 'text-green-600' : 'text-gray-500'}
          `}>
            <Clock className="h-3 w-3" />
            <span>{getDeliveryMessage()}</span>
          </div>
          
          {/* Stock level indicator */}
          {availableStock > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Stock Level</span>
                <span>{Math.round((availableStock / (threshold.low * 2)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    status === 'critical' ? 'bg-red-500' :
                    status === 'low' ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (availableStock / (threshold.low * 2)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryStatus;