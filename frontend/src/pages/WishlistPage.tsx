import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, AlertCircle, TrendingDown, Package } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  moveToCart 
} from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wishlist, loading, error } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Item removed from wishlist');
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (productId: string, quantity: number = 1) => {
    try {
      await dispatch(moveToCart({ productId, quantity })).unwrap();
      toast.success('Item moved to cart');
    } catch (error) {
      toast.error('Failed to move item to cart');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await dispatch(clearWishlist()).unwrap();
        toast.success('Wishlist cleared');
        setSelectedItems([]);
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
    }
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlist?.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist?.items.map(item => item.product._id) || []);
    }
  };

  const handleMoveSelectedToCart = async () => {
    try {
      const promises = selectedItems.map(productId => 
        dispatch(moveToCart({ productId, quantity: 1 })).unwrap()
      );
      await Promise.all(promises);
      toast.success(`${selectedItems.length} items moved to cart`);
      setSelectedItems([]);
    } catch (error) {
      toast.error('Failed to move items to cart');
    }
  };

  const handleRemoveSelected = async () => {
    if (window.confirm(`Remove ${selectedItems.length} items from wishlist?`)) {
      try {
        const promises = selectedItems.map(productId => 
          dispatch(removeFromWishlist(productId)).unwrap()
        );
        await Promise.all(promises);
        toast.success(`${selectedItems.length} items removed`);
        setSelectedItems([]);
      } catch (error) {
        toast.error('Failed to remove items');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-6">Save your favorite items for later</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading wishlist</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(fetchWishlist())}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items you love to your wishlist. They'll appear here for easy access later.
            </p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Package className="w-5 h-5" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Heart className="w-8 h-8 text-red-500" />
                <span>My Wishlist</span>
              </h1>
              <p className="text-gray-600 mt-2">
                {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            
            {wishlist.items.length > 0 && (
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedItems.length === wishlist.items.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>

          {/* Bulk actions */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedItems.length} items selected
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleMoveSelectedToCart}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Move to Cart</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Selection checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product._id)}
                    onChange={() => handleSelectItem(item.product._id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    aria-label={`Select ${item.product.name} for bulk actions`}
                  />
                </div>

                {/* Product Image */}
                <div className="relative">
                  <Link to={`/products/${item.product._id}`}>
                    <img
                      src={
                        item.product.images[0] 
                          ? typeof item.product.images[0] === 'string' 
                            ? item.product.images[0] 
                            : item.product.images[0].url
                          : '/placeholder-image.jpg'
                      }
                      alt={item.product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Alerts */}
                  {item.alerts && item.alerts.length > 0 && (
                    <div className="absolute top-3 right-3">
                      {item.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`
                            px-2 py-1 rounded-full text-xs font-medium mb-1
                            ${alert.type === 'price_drop' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                            }
                          `}
                        >
                          {alert.type === 'price_drop' && <TrendingDown className="w-3 h-3 inline mr-1" />}
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <Link to={`/products/${item.product._id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ${item.product.price}
                      </span>
                      {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${item.product.originalPrice}
                        </span>
                      )}
                    </div>
                    {item.priceWhenAdded && item.priceWhenAdded > item.product.price && (
                      <span className="text-xs text-green-600 font-medium">
                        Price dropped!
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {(item.product.inStock ?? ((item.product.stockQuantity ?? 0) > 0)) && (item.product.stockQuantity ?? 0) > 0 ? (
                      <span className="text-sm text-green-600">In Stock</span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item.product._id)}
                      disabled={!(item.product.inStock ?? ((item.product.stockQuantity ?? 0) > 0)) || (item.product.stockQuantity ?? 0) === 0}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      aria-label={`Add ${item.product.name} to cart`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${item.product.name} from wishlist`}
                      title={`Remove ${item.product.name} from wishlist`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Added date */}
                  <p className="text-xs text-gray-500 mt-2">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;