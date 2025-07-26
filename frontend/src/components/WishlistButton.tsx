import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  notifyOnPriceChange?: boolean;
  notifyOnStock?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 'md',
  className = '',
  showText = false,
  notifyOnPriceChange = false,
  notifyOnStock = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist, loading } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if product is in wishlist
  const isInWishlist = wishlist?.items.some(item => item.product._id === productId) || false;

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'p-1.5',
      text: 'text-xs'
    },
    md: {
      icon: 'w-5 h-5',
      button: 'p-2',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'p-3',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  const handleToggleWishlist = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    if (loading) return;

    setIsAnimating(true);
    
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        await dispatch(addToWishlist({
          productId,
          notifyOnPriceChange,
          notifyOnStock
        })).unwrap();
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  if (!user) {
    return null; // Don't show wishlist button for non-authenticated users
  }

  return (
    <motion.button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`
        ${config.button}
        ${className}
        relative inline-flex items-center justify-center
        rounded-full transition-all duration-200
        ${isInWishlist 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      `}
      whileTap={{ scale: 0.95 }}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Heart 
        className={`
          ${config.icon} 
          transition-all duration-200
          ${isInWishlist ? 'fill-current' : ''}
        `}
      />
      
      {showText && (
        <span className={`ml-2 ${config.text} font-medium`}>
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Success animation */}
      {isAnimating && isInWishlist && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </motion.div>
      )}
    </motion.button>
  );
};

export default WishlistButton;