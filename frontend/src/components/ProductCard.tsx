import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Clock, Zap, Eye, Scale } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import QuickAddToCart from './QuickAddToCart';
import WishlistButton from './WishlistButton';
import CartRecommendationsModal from './CartRecommendationsModal';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string }[];
  rating: number;
  numReviews: number;
  stock: number;
  brand: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  showQuickCommerce?: boolean;
  onAddToComparison?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showQuickCommerce = true, onAddToComparison }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  // Load cart quantity for authenticated users only
  useEffect(() => {
    const loadCartQuantity = () => {
      const user = localStorage.getItem('user');
      
      if (user) {
        // For authenticated users, get quantity from Redux state
        const existingItem = items.find(item => item.product._id === product._id);
        setCartQuantity(existingItem ? existingItem.quantity : 0);
      } else {
        // For non-authenticated users, no cart quantity
        setCartQuantity(0);
      }
    };

    loadCartQuantity();
  }, [product._id, items]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 Add to cart clicked for product:', product._id);
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Check if user is logged in using Redux state first, then localStorage as fallback
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const isAuthenticated = user || (storedUser && storedToken);
    
    console.log('🔍 Auth check:', {
      reduxUser: !!user,
      storedUser: !!storedUser,
      storedToken: !!storedToken,
      isAuthenticated
    });
    
    if (isAuthenticated) {
      // User is logged in - use Redux/API cart system
      try {
        console.log('🚀 Adding to cart:', { productId: product._id, quantity: 1 });
        console.log('📦 User data:', user);
        console.log('🔑 Token:', storedToken?.substring(0, 20) + '...');
        
        const result = await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
        console.log('✅ Cart add result:', result);
        toast.success('Added to cart successfully');
        // Show smart recommendations modal
        setShowRecommendationsModal(true);
      } catch (error: any) {
        console.error('❌ Cart error:', error);
        console.error('❌ Error details:', error.message || error);
        console.error('❌ Full error object:', error);
        toast.error(`Failed to add item to cart: ${error.message || 'Please try again'}`);
      }
    } else {
      // User not logged in - redirect to login
      console.log('❌ User not authenticated, redirecting to login');
      toast.error('Please login to add items to cart');
      navigate('/login');
    }
  };



  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card-product group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0]?.url || '/placeholder-image.jpg'}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {discountPercentage > 0 && (
            <span className="badge-discount text-xs px-3 py-1 rounded-full font-bold animate-pulse">
              {discountPercentage}% OFF
            </span>
          )}
          {showQuickCommerce && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 shadow-lg">
              <Zap className="h-3 w-3" />
              <span>15 min</span>
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <WishlistButton
            productId={product._id}
            size="sm"
            className="bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 hover-scale"
          />
          {onAddToComparison && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToComparison(product);
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover-scale"
              title="Add to comparison"
            >
              <Scale className="h-4 w-4 text-gray-700" />
            </button>
          )}
          <Link
            to={`/products/${product._id}`}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover-scale"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </Link>
        </div>

        {/* Stock Status Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-xl">
              <span className="text-gray-900 font-semibold">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Only {product.stock} left!
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-300 text-lg leading-tight">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-3 font-medium">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-700 ml-2 font-semibold">
              {product.rating} ({product.numReviews})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-lg text-gray-400 line-through ml-3">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-green-600 font-semibold ml-2">
                Save ₹{(product.originalPrice - product.price).toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* Delivery Info */}
        {showQuickCommerce && (
          <div className="flex items-center space-x-2 mb-4 bg-green-50 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Delivery in 10-15 min</span>
          </div>
        )}

        {/* Add to Cart */}
        {showQuickCommerce ? (
          <QuickAddToCart
            product={{
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url || '/placeholder-image.jpg',
              stock: product.stock
            }}
            cartQuantity={cartQuantity}
            size="sm"
            showQuickBuy={true}
          />
        ) : (
          <div className="space-y-3">
            {/* Stock Status */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Only {product.stock} left!</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'btn-primary hover:shadow-colored active:scale-95'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Smart Recommendations Modal */}
      <CartRecommendationsModal
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        addedProduct={{
          ...product,
          category: product.category || 'Electronics'
        }}
      />
    </div>
  );
};

export default ProductCard;
