import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Clock, Zap, Eye, Scale } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import QuickAddToCart from './QuickAddToCart';
import WishlistButton from './WishlistButton';
import CartRecommendationsModal from './CartRecommendationsModal';
import { checkAuthentication, clearAuthData } from '../utils/authHelpers';
import toast from 'react-hot-toast';
import { Product as MainProduct } from '../types';

// Local Review interface to avoid import issues
interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
}

// Extended Product interface to handle different incoming shapes (does not extend MainProduct)
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: (string | { url: string; alt: string })[];
  rating: number;
  numReviews: number;
  stock?: number;
  countInStock?: number;
  stockQuantity?: number;
  brand: string;
  category?: string;
  seller?: string | { _id: string; name: string };
  isActive?: boolean;
  specifications?: Record<string, any>;
  features?: string[];
}

interface ProductCardProps {
  product: Product;
  showQuickCommerce?: boolean;
  onAddToComparison?: (product: MainProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showQuickCommerce = true, onAddToComparison }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [showCompareTip, setShowCompareTip] = useState(false);

  useEffect(() => {
    let dismissed = false;
    let shownThisSession = false;
    try {
      dismissed = localStorage.getItem('compareTipDismissed') === 'true';
      shownThisSession = sessionStorage.getItem('compareTipShown') === 'true';
    } catch {}
    if (!dismissed && !shownThisSession) {
      setShowCompareTip(true);
      try { sessionStorage.setItem('compareTipShown', 'true'); } catch {}
    }
  }, []);

  // Helper function to normalize product data for CartRecommendationsModal
  const normalizeProductForModal = (prod: Product) => {
    return {
      _id: prod._id,
      name: prod.name,
      price: prod.price,
      originalPrice: prod.originalPrice,
      images: Array.isArray(prod.images) 
        ? prod.images.map((img) => 
            typeof img === 'string' 
              ? { url: img, alt: prod.name }
              : { url: img.url, alt: img.alt || prod.name }
          )
        : [{ url: '/placeholder-image.jpg', alt: prod.name }],
      rating: typeof prod.rating === 'number' ? prod.rating : 0,
      numReviews: typeof prod.numReviews === 'number' ? prod.numReviews : 0,
      category: prod.category ?? 'General',
      brand: prod.brand
    };
  };

  // Helper function to normalize product data for comparison
  const normalizeProductForComparison = (prod: Product) => {
    return {
      _id: prod._id,
      name: prod.name,
      description: prod.description ?? 'No description provided',
      price: prod.price,
      originalPrice: prod.originalPrice,
      discount: prod.originalPrice ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : undefined,
      category: prod.category ?? 'General',
      subcategory: undefined,
      brand: prod.brand,
      rating: typeof prod.rating === 'number' ? prod.rating : 0,
      numReviews: typeof prod.numReviews === 'number' ? prod.numReviews : 0,
      images: Array.isArray(prod.images) 
        ? prod.images.map((img, index) => 
            typeof img === 'string' 
              ? { url: img, alt: prod.name, isPrimary: index === 0 }
              : { ...img, isPrimary: index === 0 }
          )
        : [{ url: '/placeholder-image.jpg', alt: prod.name, isPrimary: true }],
      seller: typeof prod.seller === 'string' ? prod.seller : prod.seller?._id || '',
      stockQuantity: prod.stock ?? prod.countInStock ?? prod.stockQuantity ?? 0,
      inStock: (prod.stock ?? prod.countInStock ?? prod.stockQuantity ?? 0) > 0,
      specifications: {},
      features: [],
      reviews: [] as any,
      tags: [],
      lowStockThreshold: 5,
      deliveryInfo: {
        estimatedTime: '2-3 days',
        freeDelivery: true,
        deliveryCharge: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: prod.isActive ?? true,
      isFeatured: false
    };
  };

  // Load cart quantity for authenticated users only
  useEffect(() => {
    const loadCartQuantity = () => {
      const authResult = checkAuthentication(user);
      
      if (authResult.isAuthenticated) {
        // For authenticated users, get quantity from Redux state
        const existingItem = items.find(item => item.product._id === product._id);
        setCartQuantity(existingItem ? existingItem.quantity : 0);
      } else {
        // For non-authenticated users, always show 0
        setCartQuantity(0);
      }
    };

    loadCartQuantity();
    
    // Listen for cart updates (for authenticated users only)
    const handleCartUpdate = () => {
      loadCartQuantity();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [product._id, items, user]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 Add to cart clicked for product:', product._id);
    
    const stockCount = product.stock ?? product.countInStock ?? product.stockQuantity ?? 0;
    if (stockCount === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Use the centralized authentication check
    const authResult = checkAuthentication(user);
    
    console.log('🛒 ProductCard: Auth check before add to cart:', {
      isAuthenticated: authResult.isAuthenticated,
      hasUser: !!authResult.user,
      hasToken: !!authResult.token,
      userId: authResult.user?._id || authResult.user?.id,
      error: authResult.error
    });
    
    if (authResult.isAuthenticated) {
      // User is authenticated - use Redux/API cart system
      console.log('✅ ProductCard: Authentication passed, proceeding with authenticated cart add');

      try {
        console.log('🚀 Adding to authenticated cart:', { productId: product._id, quantity: 1 });
        console.log('📦 User data:', authResult.user);
        console.log('🔑 Token:', authResult.token?.substring(0, 20) + '...');
        
        // Save a snapshot so mock cart uses the correct name/price/images
        try {
          localStorage.setItem(
            `productSnapshot:${product._id}`,
            JSON.stringify({
              _id: product._id,
              name: product.name,
              price: product.price,
              images: Array.isArray(product.images) && product.images.length
                ? (typeof product.images[0] === 'string'
                    ? [{ url: product.images[0], alt: product.name }]
                    : [{ url: product.images[0].url, alt: product.images[0].alt || product.name }])
                : [{ url: '/placeholder-image.jpg', alt: product.name }],
              stock: product.stock ?? product.countInStock ?? 10
            })
          );
        } catch {}

        const result = await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
        console.log('✅ Cart add result:', result);
        toast.success('Added to cart successfully!', {
          duration: 3000,
          icon: '🛒',
        });
        
        // Show smart recommendations modal
        setShowRecommendationsModal(true);
      } catch (error: any) {
        console.error('❌ Cart error:', error);
        console.error('❌ Error details:', error.message || error);
        console.error('❌ Full error object:', error);
        
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
            return;
          } else if (error.message.includes('Network') || error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.message.includes('stock') || error.message.includes('Stock')) {
            errorMessage = 'This item is out of stock.';
          } else {
            errorMessage = error.message;
          }
        }
        
        // Soft offline fallback: add to local mock cart to keep UX working
        try {
          const existing = localStorage.getItem('mockCart');
          const cart = existing ? JSON.parse(existing) : [];
          const idx = cart.findIndex((i: any) => i.product?._id === product._id);
          if (idx >= 0) cart[idx].quantity += 1; else cart.push({ product: { _id: product._id, name: product.name, price: product.price, images: [{ url: Array.isArray(product.images) && product.images.length ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : '/placeholder-image.jpg', alt: product.name }], stock: product.stock ?? product.countInStock ?? product.stockQuantity ?? 0 }, quantity: 1 });
          localStorage.setItem('mockCart', JSON.stringify(cart));
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { productId: product._id, action: 'add-offline' } }));
          toast.success('Added to cart (offline mode)', { duration: 2500, icon: '🛒' });
        } catch (e) {
          toast.error(errorMessage, { duration: 4000, icon: '❌' });
        }
      }
    } else {
      // User not logged in - use guest cart (localStorage)
      console.log('👤 ProductCard: User not authenticated, using guest cart');
      
      try {
        const existing = localStorage.getItem('mockCart');
        const cart = existing ? JSON.parse(existing) : [];
        
        // Check if product already exists in cart
        const existingIndex = cart.findIndex((i: any) => i.product?._id === product._id);
        
        if (existingIndex >= 0) {
          // Update quantity
          cart[existingIndex].quantity += 1;
          console.log('📦 Updated existing item in guest cart:', cart[existingIndex]);
        } else {
          // Add new item
          const newItem = {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: Array.isArray(product.images) && product.images.length
                ? (typeof product.images[0] === 'string'
                    ? [{ url: product.images[0], alt: product.name }]
                    : [{ url: product.images[0].url, alt: product.images[0].alt || product.name }])
                : [{ url: '/placeholder-image.jpg', alt: product.name }],
              stock: product.stock ?? product.countInStock ?? product.stockQuantity ?? 0
            },
            quantity: 1
          };
          cart.push(newItem);
          console.log('📦 Added new item to guest cart:', newItem);
        }
        
        localStorage.setItem('mockCart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { productId: product._id, action: 'add-guest' } }));
        
        toast.success('Added to cart successfully!', {
          duration: 3000,
          icon: '🛒',
        });
        
        // Show smart recommendations modal
        setShowRecommendationsModal(true);
      } catch (error) {
        console.error('❌ Guest cart error:', error);
        toast.error('Failed to add item to cart. Please try again.', {
          duration: 4000,
          icon: '❌',
        });
      }
    }
  };



  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isVendor = user?.role === 'seller';

  return (
    <div className="card-product group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link
          to={isVendor ? `/vendor/products/${product._id}` : `/products/${product._id}`}
          onClick={(e) => {
            // If in compare select mode, intercept click to add to comparison and prevent navigation
            try {
              if (localStorage.getItem('compareSelectMode') === '1' && onAddToComparison) {
                e.preventDefault();
                e.stopPropagation();
                const normalized = normalizeProduct(product);
                onAddToComparison(normalized);
                // ensure item is persisted for HomePage pickup
                const existing = localStorage.getItem('comparePending');
                const list = existing ? JSON.parse(existing) : [];
                if (!list.find((x: any) => x._id === normalized._id)) list.push(normalized);
                localStorage.setItem('comparePending', JSON.stringify(list));
                // signal to reopen comparison modal on HomePage
                localStorage.setItem('compareReopen', '1');
                localStorage.removeItem('compareSelectMode');
                toast.success('Added to comparison');
                navigate('/');
              }
            } catch {}
          }}
        >
          <img
            src={'/Icon.png'}
            alt={product.name}
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
          {/* Comparison feature temporarily disabled */}
          <Link
            to={isVendor ? `/vendor/products/${product._id}` : `/products/${product._id}`}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover-scale"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </Link>
        </div>

        {/* Stock Status Overlay */}
        {(product.stock ?? product.countInStock ?? 0) === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-xl">
              <span className="text-gray-900 font-semibold">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Low Stock Warning */}
        {(product.stock ?? product.countInStock ?? 0) > 0 && (product.stock ?? product.countInStock ?? 0) <= 5 && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Only {product.stock ?? product.countInStock} left!
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

        {/* Guest Cart Notice */}
        {!isVendor && !checkAuthentication(user).isAuthenticated && (
          <div className="flex items-center space-x-2 mb-4 bg-blue-50 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-semibold text-blue-700">Shopping as guest - Login to sync cart</span>
          </div>
        )}

        {/* Delivery Info */}
        {showQuickCommerce && (
          <div className="flex items-center space-x-2 mb-4 bg-green-50 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Delivery in 10-15 min</span>
          </div>
        )}

        {/* Add to Cart */}
        {isVendor ? (
          <Link
            to={`/vendor/products/${product._id}`}
            className="w-full inline-flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Eye className="h-5 w-5" />
            <span>View Details</span>
          </Link>
        ) : showQuickCommerce ? (
          <QuickAddToCart
            product={{
              _id: product._id,
              name: product.name,
              price: product.price,
              image: Array.isArray(product.images) && product.images.length > 0
                ? typeof product.images[0] === 'string' 
                  ? product.images[0] 
                  : product.images[0]?.url || '/placeholder-image.jpg'
                : '/placeholder-image.jpg',
              stock: product.stock ?? product.countInStock ?? product.stockQuantity ?? 0
            }}
            cartQuantity={cartQuantity}
            size="sm"
            showQuickBuy={true}
          />
        ) : (
          <div className="space-y-3">
            {/* Stock Status */}
            {(product.stock ?? product.countInStock ?? product.stockQuantity ?? 0) <= 5 && (product.stock ?? product.countInStock ?? product.stockQuantity ?? 0) > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Only {product.stock ?? product.countInStock ?? product.stockQuantity} left!</span>
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
        addedProduct={normalizeProductForModal(product)}
      />
    </div>
  );
};

export default ProductCard;
