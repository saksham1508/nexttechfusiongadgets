import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from '../components/Icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchCart, updateCartItem, removeFromCart, clearCart as clearApiCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: reduxItems, totalAmount, isLoading } = useSelector((state: RootState) => state.cart);
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ _id: string; name: string; email: string } | null>(null);
  const [useApiCart, setUseApiCart] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug: Log when CartPage component mounts
  useEffect(() => {
    console.log('🛒 CartPage mounted');
    console.log('🛒 Current URL:', window.location.pathname);
    console.log('🛒 Current search:', window.location.search);
    return () => {
      console.log('🛒 CartPage unmounted');
    };
  }, []);

  // Check for user authentication - allow both authenticated and guest users
  useEffect(() => {
    console.log('🔍 CartPage: Checking authentication status...');
    const userData = localStorage.getItem('user');
    
    if (userData) {
      console.log('🔍 CartPage: User data found in localStorage');
      try {
        const parsedUser = JSON.parse(userData);
        // Handle both wrapped and direct user objects
        const user = parsedUser.user || parsedUser;
        if (user && (user._id || user.id)) {
          console.log('✅ CartPage: Valid user found, using API cart');
          setUser(user);
          setUseApiCart(true);
          // Fetch cart from API for authenticated users
          dispatch(fetchCart());
        } else {
          console.log('❌ CartPage: Invalid user data, using guest cart');
          // Invalid user data, clear it and use guest cart
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setUseApiCart(false);
        }
      } catch (error) {
        console.error('❌ CartPage: Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setUseApiCart(false);
      }
    } else {
      console.log('👤 CartPage: No user logged in, using guest cart');
      // No user logged in - allow guest cart access
      setUser(null);
      setUseApiCart(false);
    }
    
    // Mark as initialized to prevent any redirect loops
    setIsInitialized(true);
  }, [dispatch, navigate]);

  const calculateTotal = useCallback((cartItems: CartItem[]) => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, []);

  // Load cart from localStorage (for non-authenticated users)
  useEffect(() => {
    if (!useApiCart) {
      const loadCart = () => {
        const tempCart = localStorage.getItem('tempCart');
        if (tempCart) {
          try {
            const cartItems = JSON.parse(tempCart);
            setItems(cartItems);
          } catch (error) {
            console.error('Error parsing cart data:', error);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      };

      loadCart();
      
      // Listen for storage changes (when items are added from other components)
      const handleStorageChange = () => {
        loadCart();
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom events when localStorage is updated from the same tab
      const handleCartUpdate = () => {
        loadCart();
      };
      
      window.addEventListener('cartUpdated', handleCartUpdate);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('cartUpdated', handleCartUpdate);
      };
    }
  }, [useApiCart]);

  // Convert Redux cart items to local cart format for display
  useEffect(() => {
    if (useApiCart && reduxItems) {
      const convertedItems = reduxItems.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0]?.url || '/placeholder-image.jpg',
        quantity: item.quantity
      }));
      setItems(convertedItems);
    }
  }, [useApiCart, reduxItems]);

  const updateLocalStorage = (updatedItems: CartItem[]) => {
    localStorage.setItem('tempCart', JSON.stringify(updatedItems));
    setItems(updatedItems);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    if (useApiCart) {
      // Use API for authenticated users
      try {
        await dispatch(updateCartItem({ productId, quantity })).unwrap();
        toast.success('Cart updated successfully');
      } catch (error) {
        toast.error('Failed to update cart');
        console.error('Update cart error:', error);
      }
    } else {
      // Use localStorage for non-authenticated users
      const updatedItems = items.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      );
      
      updateLocalStorage(updatedItems);
      toast.success('Cart updated successfully');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (useApiCart) {
      // Use API for authenticated users
      try {
        await dispatch(removeFromCart(productId)).unwrap();
        toast.success('Item removed from cart');
      } catch (error) {
        toast.error('Failed to remove item');
        console.error('Remove item error:', error);
      }
    } else {
      // Use localStorage for non-authenticated users
      const updatedItems = items.filter(item => item.productId !== productId);
      updateLocalStorage(updatedItems);
      toast.success('Item removed from cart');
    }
  };

  const handleClearCart = async () => {
    if (useApiCart) {
      // Use API for authenticated users
      try {
        await dispatch(clearApiCart()).unwrap();
        toast.success('Cart cleared successfully');
      } catch (error) {
        toast.error('Failed to clear cart');
        console.error('Clear cart error:', error);
      }
    } else {
      // Use localStorage for non-authenticated users
      updateLocalStorage([]);
      toast.success('Cart cleared successfully');
    }
  };

  // Remove the user check since we're using temporary cart that doesn't require authentication
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
  //       <div className="text-center p-8 bg-white rounded-lg shadow-lg">
  //         <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
  //         <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
  //         <p className="text-gray-600 mb-6">You need to login to view your cart</p>
  //         <Link
  //           to="/login"
  //           className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
  //         >
  //           Login
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing cart...</p>
        </div>
      </div>
    );
  }

  // Show loading state for API cart operations
  if (useApiCart && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateTotal(items);
  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const taxRate = 0.08;
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + taxAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50 min-h-screen font-sans">
      {/* Cart Status Notice */}
      <div className={`border rounded-lg p-4 mb-6 ${useApiCart ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className={`h-5 w-5 ${useApiCart ? 'text-green-400' : 'text-blue-400'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className={`text-sm ${useApiCart ? 'text-green-700' : 'text-blue-700'}`}>
              {useApiCart ? (
                <>
                  <strong>Authenticated Cart:</strong> Your cart is synced with your account and will persist across sessions.
                </>
              ) : (
                <>
                  <strong>Demo Mode:</strong> This cart uses temporary storage. Items will be cleared when you refresh the page or close the browser.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        <button
          type="button"
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
          aria-label="Clear shopping cart"
        >
          <Trash2 className="h-5 w-5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image || `https://placehold.co/80x80/E0E0E0/333333?text=${item.name.split(' ').map(n => n[0]).join('')}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src = `https://placehold.co/80x80/E0E0E0/333333?text=No+Image`;
                    }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    <Link to={`/products/${item.productId}`} className="hover:text-indigo-600">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="text-lg font-bold text-indigo-600 mt-1">
                    ₹{item.price.toFixed(2)}
                  </p>
                  {!useApiCart && (
                    <p className="text-sm text-gray-500 mt-1">Demo Mode - Temporary Cart</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  <span className="w-8 text-center font-medium text-lg text-gray-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-700 transition duration-150 ease-in-out p-1 rounded-md hover:bg-red-50"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Order Total</span>
                  <span className="text-indigo-600">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-indigo-600 hover:text-indigo-700 font-medium transition duration-150 ease-in-out"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
