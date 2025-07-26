import React from 'react';
import { CreditCard, Smartphone, Building, Bitcoin, Edit, Trash2, Check } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onSelect?: (paymentMethodId: string) => void;
  onEdit?: (paymentMethodId: string) => void;
  onDelete?: (paymentMethodId: string) => void;
  onSetDefault?: (paymentMethodId: string) => void;
  showActions?: boolean;
  className?: string;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  className = ''
}) => {
  const getPaymentIcon = () => {
    switch (paymentMethod.type) {
      case 'card':
        return <CreditCard className="w-6 h-6" />;
      case 'digital_wallet':
        return <Smartphone className="w-6 h-6" />;
      case 'bank_account':
        return <Building className="w-6 h-6" />;
      case 'crypto':
        return <Bitcoin className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'text-blue-600';
      case 'mastercard':
        return 'text-red-600';
      case 'amex':
        return 'text-green-600';
      case 'discover':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDisplayInfo = () => {
    switch (paymentMethod.type) {
      case 'card':
        return {
          title: paymentMethod.nickname || `${paymentMethod.card?.brand?.toUpperCase()} ****${paymentMethod.card?.last4}`,
          subtitle: `Expires ${paymentMethod.card?.expMonth}/${paymentMethod.card?.expYear}`,
          icon: getPaymentIcon()
        };
      case 'digital_wallet':
        return {
          title: paymentMethod.nickname || paymentMethod.digitalWallet?.walletType?.toUpperCase(),
          subtitle: paymentMethod.digitalWallet?.email,
          icon: getPaymentIcon()
        };
      case 'bank_account':
        return {
          title: paymentMethod.nickname || `${paymentMethod.bankAccount?.bankName} ****${paymentMethod.bankAccount?.last4}`,
          subtitle: paymentMethod.bankAccount?.accountType?.toUpperCase(),
          icon: getPaymentIcon()
        };
      case 'crypto':
        return {
          title: paymentMethod.nickname || paymentMethod.cryptoWallet?.currency?.toUpperCase(),
          subtitle: `${paymentMethod.cryptoWallet?.address?.slice(0, 10)}...`,
          icon: getPaymentIcon()
        };
      default:
        return {
          title: paymentMethod.nickname || 'Payment Method',
          subtitle: paymentMethod.provider,
          icon: getPaymentIcon()
        };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <div
      className={`
        ${className}
        relative p-4 border rounded-lg transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${!paymentMethod.isActive ? 'opacity-50' : ''}
      `}
      onClick={() => onSelect?.(paymentMethod._id)}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Default badge */}
      {paymentMethod.isDefault && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Default
          </span>
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Payment method icon */}
        <div className={`
          flex-shrink-0 p-2 rounded-lg
          ${paymentMethod.type === 'card' ? getCardBrandColor(paymentMethod.card?.brand || '') : 'text-gray-600'}
          bg-gray-100
        `}>
          {displayInfo.icon}
        </div>

        {/* Payment method details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {displayInfo.title}
            </h3>
          </div>
          
          {displayInfo.subtitle && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {displayInfo.subtitle}
            </p>
          )}

          {/* Billing address */}
          {paymentMethod.billingAddress && (
            <p className="text-xs text-gray-400 truncate mt-1">
              {paymentMethod.billingAddress.city}, {paymentMethod.billingAddress.state}
            </p>
          )}

          {/* Provider info */}
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-400 capitalize">
              {paymentMethod.provider}
            </span>
            {!paymentMethod.isActive && (
              <span className="text-xs text-red-500">Inactive</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
          {!paymentMethod.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(paymentMethod._id);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              aria-label={`Set ${displayInfo.title} as default payment method`}
            >
              Set as Default
            </button>
          )}
          
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(paymentMethod._id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label={`Edit ${displayInfo.title} payment method`}
              title="Edit payment method"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && !paymentMethod.isDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(paymentMethod._id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              aria-label={`Delete ${displayInfo.title} payment method`}
              title="Delete payment method"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;