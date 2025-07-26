import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { addToCart, updateCartItem } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface QuickAddToCartProps {
  product: Product;
  cartQuantity?: number;
  size?: 'sm' | 'md' | 'lg';
  showQuickBuy?: boolean;
}

const QuickAddToCart: React.FC<QuickAddToCartProps> = ({
  product,
  cartQuantity = 0,
  size = 'md',
  showQuickBuy = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(cartQuantity);

  const sizeClasses = {
    sm: {
      button: 'h-8 px-2 text-sm',
      icon: 'h-3 w-3',
      counter: 'h-8 px-3 text-sm'
    },
    md: {
      button: 'h-10 px-3 text-sm',
      icon: 'h-4 w-4',
      counter: 'h-10 px-4 text-sm'
    },
    lg: {
      button: 'h-12 px-4 text-base',
      icon: 'h-5 w-5',
      counter: 'h-12 px-5 text-base'
    }
  };

  const classes = sizeClasses[size];

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity: 1
      })).unwrap();
      
      setQuantity(prev => prev + 1);
      toast.success('Added to cart!', {
        duration: 2000,
        icon: '🛒',
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    if (newQuantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    setIsLoading(true);
    try {
      if (newQuantity === 0) {
        // Remove from cart
        await dispatch(updateCartItem({
          productId: product._id,
          quantity: 0
        })).unwrap();
        toast.success('Removed from cart');
      } else {
        await dispatch(updateCartItem({
          productId: product._id,
          quantity: newQuantity
        })).unwrap();
      }
      
      setQuantity(newQuantity);
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickBuy = () => {
    // Add to cart and redirect to checkout
    handleAddToCart();
    // You can add navigation logic here
    toast.success('Redirecting to checkout...', {
      icon: '⚡',
    });
  };

  // If item is not in cart, show Add to Cart button
  if (quantity === 0) {
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={isLoading || product.stock <= 0}
          className={`
            ${classes.button}
            bg-blue-600 hover:bg-blue-700 text-white rounded-lg
            flex items-center justify-center space-x-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 transform hover:scale-105
            font-medium
          `}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <ShoppingCart className={classes.icon} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {showQuickBuy && (
          <button
            onClick={handleQuickBuy}
            disabled={isLoading || product.stock <= 0}
            className={`
              ${classes.button}
              bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
              text-white rounded-lg flex items-center justify-center space-x-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 transform hover:scale-105
              font-medium
            `}
          >
            <Zap className={classes.icon} />
            <span>Quick Buy</span>
          </button>
        )}
      </div>
    );
  }

  // If item is in cart, show quantity controls
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleUpdateQuantity(quantity - 1)}
          disabled={isLoading}
          className={`
            ${classes.button}
            bg-white hover:bg-gray-50 text-gray-700 rounded-md
            flex items-center justify-center
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            border border-gray-200
          `}
        >
          <Minus className={classes.icon} />
        </button>

        <div className={`
          ${classes.counter}
          bg-white border border-gray-200 rounded-md
          flex items-center justify-center font-medium text-gray-900
          min-w-[60px]
        `}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent" />
          ) : (
            quantity
          )}
        </div>

        <button
          onClick={() => handleUpdateQuantity(quantity + 1)}
          disabled={isLoading || quantity >= product.stock}
          className={`
            ${classes.button}
            bg-white hover:bg-gray-50 text-gray-700 rounded-md
            flex items-center justify-center
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            border border-gray-200
          `}
        >
          <Plus className={classes.icon} />
        </button>
      </div>

      {showQuickBuy && (
        <button
          onClick={handleQuickBuy}
          disabled={isLoading}
          className={`
            ${classes.button}
            bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
            text-white rounded-lg flex items-center justify-center space-x-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 transform hover:scale-105
            font-medium
          `}
        >
          <Zap className={classes.icon} />
          <span>Quick Buy</span>
        </button>
      )}

      {/* Stock indicator */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="text-xs text-orange-600 text-center">
          Only {product.stock} left!
        </div>
      )}
    </div>
  );
};

export default QuickAddToCart;