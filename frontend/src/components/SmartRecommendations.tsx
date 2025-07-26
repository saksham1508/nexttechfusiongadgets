import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  ShoppingCart, 
  Heart,
  Eye,
  Zap,
  Target,
  Brain,
  Filter
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

interface RecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: any[];
  algorithm: 'collaborative' | 'content' | 'trending' | 'personalized' | 'similar';
  confidence: number;
}

interface SmartRecommendationsProps {
  userId?: string;
  currentProduct?: any;
  viewedProducts?: any[];
  cartItems?: any[];
  className?: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  currentProduct,
  viewedProducts = [],
  cartItems = [],
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector(state => state.wishlist);
  const wishlistItems = wishlist?.items || [];
  const [activeSection, setActiveSection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);

  // Mock recommendation data - in real app, this would come from API
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecommendations: RecommendationSection[] = [
        {
          id: 'personalized',
          title: 'Recommended for You',
          subtitle: 'Based on your browsing and purchase history',
          icon: <Brain className="h-5 w-5" />,
          algorithm: 'personalized',
          confidence: 92,
          products: generateMockProducts(6, 'personalized')
        },
        {
          id: 'similar',
          title: 'Similar Products',
          subtitle: currentProduct ? `Products similar to ${currentProduct.name}` : 'Products you might like',
          icon: <Target className="h-5 w-5" />,
          algorithm: 'similar',
          confidence: 88,
          products: generateMockProducts(6, 'similar')
        },
        {
          id: 'trending',
          title: 'Trending Now',
          subtitle: 'Popular products this week',
          icon: <TrendingUp className="h-5 w-5" />,
          algorithm: 'trending',
          confidence: 85,
          products: generateMockProducts(6, 'trending')
        },
        {
          id: 'collaborative',
          title: 'Customers Also Bought',
          subtitle: 'Products frequently bought together',
          icon: <Users className="h-5 w-5" />,
          algorithm: 'collaborative',
          confidence: 79,
          products: generateMockProducts(6, 'collaborative')
        },
        {
          id: 'recently_viewed',
          title: 'Recently Viewed',
          subtitle: 'Continue where you left off',
          icon: <Clock className="h-5 w-5" />,
          algorithm: 'content',
          confidence: 95,
          products: viewedProducts.slice(0, 6)
        }
      ];

      setRecommendations(mockRecommendations.filter(section => section.products.length > 0));
      setIsLoading(false);
    };

    generateRecommendations();
  }, [userId, currentProduct, viewedProducts]);

  // Generate mock products for demonstration
  const generateMockProducts = (count: number, type: string): any[] => {
    const mockProducts: any[] = [];
    for (let i = 0; i < count; i++) {
      mockProducts.push({
        _id: `${type}-${i}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Product ${i + 1}`,
        description: `High-quality product recommended based on ${type} algorithm`,
        price: Math.floor(Math.random() * 50000) + 1000,
        originalPrice: Math.floor(Math.random() * 60000) + 2000,
        discount: Math.floor(Math.random() * 50) + 10,
        category: 'Electronics',
        brand: `Brand ${i + 1}`,
        images: [{
          url: `/api/placeholder/300/300?text=${type}-${i}`,
          alt: `${type} product ${i}`,
          isPrimary: true
        }],
        specifications: {},
        features: [`Feature ${i + 1}`, `Feature ${i + 2}`],
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 100) + 10,
        lowStockThreshold: 5,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        numReviews: Math.floor(Math.random() * 500) + 10,
        reviews: [],
        tags: [type],
        seller: 'seller-1',
        isActive: true,
        isFeatured: Math.random() > 0.7,
        deliveryInfo: {
          estimatedTime: '2-3 days',
          freeDelivery: true,
          deliveryCharge: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return mockProducts;
  };

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      productId: product._id,
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (productId: string) => {
    dispatch(toggleWishlist(productId));
    const isInWishlist = wishlistItems.some(item => item.product._id === productId);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Section Tabs */}
      <div className="border-b border-gray-200 px-6 pt-6">
        <div className="flex items-center space-x-4 mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
        </div>
        
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {recommendations.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(index)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                activeSection === index
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.icon}
              <span className="font-medium">{section.title}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(section.confidence)}`}>
                {section.confidence}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {recommendations[activeSection].title}
                  </h3>
                  <p className="text-gray-600">{recommendations[activeSection].subtitle}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Zap className="h-4 w-4" />
                    <span>AI Powered</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getConfidenceColor(recommendations[activeSection].confidence)
                  }`}>
                    {recommendations[activeSection].confidence}% Match
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations[activeSection].products.map((product, productIndex) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: productIndex * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                    <img
                      src={product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(product._id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          isInWishlist(product._id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white bg-opacity-80 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                        aria-label={`${isInWishlist(product._id) ? 'Remove from' : 'Add to'} wishlist`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Discount Badge */}
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.numReviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Algorithm Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>
                  These recommendations are generated using our {recommendations[activeSection].algorithm} algorithm
                  with {recommendations[activeSection].confidence}% confidence based on your preferences and behavior.
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartRecommendations;