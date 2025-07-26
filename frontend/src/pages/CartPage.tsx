import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trash2, Plus, Minus, ShoppingBag } from '../components/Icons';

interface ProductImage {
  url: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  images?: ProductImage[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ _id: string; name: string; email: string } | null>(
    { _id: 'user123', name: 'John Doe', email: 'john.doe@example.com' }
  );

  const navigate = useCallback((path: string) => {
    console.log(`Navigating to: ${path}`);
  }, []);

  const mockCartItems: CartItem[] = [
    {
      product: {
        _id: 'prod1',
        name: 'Wireless Headphones',
        brand: 'AudioTech',
        price: 75.50,
        images: [{ url: 'https://placehold.co/100x100/A0B2C3/FFFFFF?text=Headphones' }],
      },
      quantity: 2,
    },
    {
      product: {
        _id: 'prod2',
        name: 'Smartwatch Pro',
        brand: 'WearableCo',
        price: 199.99,
        images: [{ url: 'https://placehold.co/100x100/B2C3A0/FFFFFF?text=Smartwatch' }],
      },
      quantity: 1,
    },
    {
      product: {
        _id: 'prod3',
        name: 'Portable Bluetooth Speaker',
        brand: 'SoundBlast',
        price: 49.00,
        images: [{ url: 'https://placehold.co/100x100/C3A0B2/FFFFFF?text=Speaker' }],
      },
      quantity: 1,
    },
  ];

  const calculateTotal = useCallback((cartItems: CartItem[]) => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, []);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setItems(mockCartItems);
      setTotal(calculateTotal(mockCartItems));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateTotal]);

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.product._id === productId ? { ...item, quantity: quantity } : item
      ).filter(item => item.quantity > 0);

      setTotal(calculateTotal(updatedItems));
      console.log(`Cart item ${productId} quantity updated to ${quantity}`);
      return updatedItems;
    });
  }, [calculateTotal]);

  const removeFromCart = useCallback(async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.product._id !== productId);
      setTotal(calculateTotal(updatedItems));
      console.log(`Cart item ${productId} removed`);
      return updatedItems;
    });
  }, [calculateTotal]);

  const clearCart = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setItems([]);
    setTotal(0);
    console.log('Cart cleared');
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    updateCartItem(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your cart</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <LoadingSpinner size="lg" />
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
              <div key={item.product._id} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                <Link to={`/products/${item.product._id}`}>
                  <img
                    src={item.product.images?.[0]?.url || `https://placehold.co/80x80/E0E0E0/333333?text=${item.product.name.split(' ').map(n => n[0]).join('')}`}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src = `https://placehold.co/80x80/E0E0E0/333333?text=No+Image`;
                    }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    <Link to={`/products/${item.product._id}`} className="hover:text-indigo-600">
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm">{item.product.brand}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.product.name}`}
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  <span className="w-8 text-center font-medium text-lg text-gray-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    aria-label={`Increase quantity of ${item.product.name}`}
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="text-red-600 hover:text-red-700 transition duration-150 ease-in-out p-1 rounded-md hover:bg-red-50"
                    aria-label={`Remove ${item.product.name} from cart`}
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
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Order Total</span>
                  <span className="text-indigo-600">${finalTotal.toFixed(2)}</span>
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
