import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, Sparkles, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string }[];
  rating: number;
  numReviews: number;
  category: string;
  brand: string;
}

interface CartRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  addedProduct?: Product;
}

const CartRecommendationsModal: React.FC<CartRecommendationsModalProps> = ({
  isOpen,
  onClose,
  addedProduct
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && addedProduct) {
      generateRecommendations();
    }
  }, [isOpen, addedProduct]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock recommendations based on the added product
    const mockRecommendations: Product[] = [];
    for (let i = 0; i < 4; i++) {
      mockRecommendations.push({
        _id: `rec-${addedProduct?._id}-${i}`,
        name: `${addedProduct?.category} Accessory ${i + 1}`,
        price: Math.floor(Math.random() * 30000) + 5000,
        originalPrice: Math.floor(Math.random() * 40000) + 8000,
        images: [{
          url: `/api/placeholder/200/200?text=Rec-${i}`,
          alt: `Recommended product ${i}`
        }],
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        numReviews: Math.floor(Math.random() * 200) + 50,
        category: addedProduct?.category || 'Electronics',
        brand: `Brand ${i + 1}`
      });
    }
    
    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    // Use temporary cart to avoid authentication issues
    const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
    const existingItem = tempCart.find((item: any) => item.productId === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      tempCart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url || '/placeholder-image.jpg',
        quantity: 1
      });
    }
    
    localStorage.setItem('tempCart', JSON.stringify(tempCart));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} added to cart! (Demo Mode)`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Item Added to Cart!</h2>
                  <p className="text-sm text-gray-600">
                    {addedProduct?.name} has been added to your cart
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Smart Recommendations Header */}
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Frequently bought together</span>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Recommendations Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.images[0]?.url || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {product.name}
                        </h4>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.numReviews})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Demo Mode:</span> Recommendations are generated for demonstration purposes
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/cart';
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
                >
                  View Cart
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CartRecommendationsModal;