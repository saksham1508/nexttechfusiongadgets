import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { addToCart, updateCartItem } from '../store/slices/cartSlice';
import CartRecommendationsModal from './CartRecommendationsModal';
import { checkAuthentication, clearAuthData } from '../utils/authHelpers';
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
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  // Load quantity only for authenticated users
  useEffect(() => {
    const loadQuantity = () => {
      const authResult = checkAuthentication(user);
      
      if (authResult.isAuthenticated) {
        // For authenticated users, quantity will be managed by Redux state
        // This will be updated when the parent component fetches cart data
        setQuantity(cartQuantity);
        console.log('🔄 QuickAdd: Setting quantity from Redux:', { productId: product._id, cartQuantity });
      } else {
        // For non-authenticated users, always show 0
        setQuantity(0);
        console.log('🔄 QuickAdd: User not authenticated, setting quantity to 0');
      }
    };

    loadQuantity();
    
    // Listen for cart updates (only for authenticated users)
    const handleCartUpdate = () => {
      console.log('🔄 QuickAdd: Cart update event received');
      loadQuantity();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [product._id, cartQuantity, user]);

  // Additional effect to sync with Redux cart state changes
  useEffect(() => {
    const authResult = checkAuthentication(user);
    if (authResult.isAuthenticated) {
      setQuantity(cartQuantity);
      console.log('🔄 QuickAdd: Syncing with Redux cart quantity:', { productId: product._id, cartQuantity });
    }
  }, [cartQuantity, user, product._id]);

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

    // Use the centralized authentication check
    const authResult = checkAuthentication(user);
    
    if (!authResult.isAuthenticated) {
      // User not logged in - show login prompt
      toast.error('Please log in to add items to cart', {
        duration: 4000,
        icon: '🔒',
      });
      
      // Clear any invalid auth data
      if (authResult.error) {
        clearAuthData();
      }
      
      // Optional: Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    setIsLoading(true);
    
    // User is authenticated - proceed with cart operations
    try {
      console.log('🚀 QuickAdd: Adding to authenticated cart:', { productId: product._id, quantity: 1 });
      
      const result = await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      console.log('✅ QuickAdd: Cart operation successful', result);
      
      // Update local quantity based on the result
      const updatedItem = result.items?.find((item: any) => item.product._id === product._id);
      if (updatedItem) {
        setQuantity(updatedItem.quantity);
        console.log('✅ QuickAdd: Updated local quantity to', updatedItem.quantity);
      } else {
        setQuantity(prev => prev + 1);
      }
      
      toast.success('Added to cart!', {
        duration: 3000,
        icon: '🛒',
      });
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { productId: product._id, action: 'add', result } 
      }));
      
      // Show smart recommendations modal
      setShowRecommendationsModal(true);
    } catch (error: any) {
      console.error('❌ QuickAdd Cart error:', error);
      console.error('❌ Error details:', error.message || error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to add item to cart. Please try again.';
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Unauthorized') || error.message.includes('session has expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Clear invalid auth data
          clearAuthData();
          
          toast.error(errorMessage, {
            duration: 4000,
            icon: '🔒',
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          setIsLoading(false);
          return;
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('stock') || error.message.includes('Stock')) {
          errorMessage = 'This item is out of stock.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌',
      });
    }
    
    setIsLoading(false);
  };



  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    if (newQuantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }

    // Use the centralized authentication check
    const authResult = checkAuthentication(user);

    if (!authResult.isAuthenticated) {
      // User not logged in - show login prompt
      toast.error('Please log in to manage cart items', {
        duration: 4000,
        icon: '🔒',
      });
      
      // Clear any invalid auth data
      if (authResult.error) {
        clearAuthData();
      }
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setIsLoading(true);
    
    // User is authenticated - proceed with cart operations
    try {
      if (newQuantity === 0) {
        // Remove from cart
        const result = await dispatch(updateCartItem({ productId: product._id, quantity: 0 })).unwrap();
        console.log('✅ QuickAdd: Remove from cart operation successful', result);
        setQuantity(0);
        toast.success('Removed from cart', {
          duration: 2000,
          icon: '🗑️',
        });
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { productId: product._id, action: 'remove', result } 
        }));
      } else {
        // Update quantity
        const result = await dispatch(updateCartItem({ productId: product._id, quantity: newQuantity })).unwrap();
        console.log('✅ QuickAdd: Update cart operation successful', result);
        
        // Update local quantity based on the result
        const updatedItem = result.items?.find((item: any) => item.product._id === product._id);
        if (updatedItem) {
          setQuantity(updatedItem.quantity);
          console.log('✅ QuickAdd: Updated local quantity to', updatedItem.quantity);
        } else {
          setQuantity(newQuantity);
        }
        
        toast.success('Cart updated', {
          duration: 2000,
          icon: '✅',
        });
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { productId: product._id, action: 'update', result } 
        }));
      }
    } catch (error: any) {
      console.error('❌ Update cart error:', error);
      console.error('❌ Error details:', error.message || error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to update cart. Please try again.';
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Unauthorized') || error.message.includes('session has expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Clear invalid auth data
          clearAuthData();
          
          toast.error(errorMessage, {
            duration: 4000,
            icon: '🔒',
          });
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          setIsLoading(false);
          return;
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('stock') || error.message.includes('Stock')) {
          errorMessage = 'Not enough stock available.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌',
      });
    }
    
    setIsLoading(false);
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
          type="button"
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
            type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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

      {/* Smart Recommendations Modal */}
      <CartRecommendationsModal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        addedProduct={{
          _id: product._id,
          name: product.name,
          price: product.price,
          images: [{ url: product.image, alt: product.name }],
          rating: 4.5,
          numReviews: 100,
          category: 'Electronics',
          brand: 'Brand'
        }}
      />
    </div>
  );
};

export default QuickAddToCart;