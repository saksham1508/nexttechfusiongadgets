// Optimized Product Card - O(1) rendering with lazy loading and memoization
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import performanceOptimizer from '../utils/performanceOptimizer';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  numReviews: number;
  category: string;
  brand: string;
  countInStock: number;
  isNew?: boolean;
  discount?: number;
}

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  isInWishlist?: boolean;
  isInCart?: boolean;
  className?: string;
  lazy?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

// O(1) - Memoized product card component
const OptimizedProductCard: React.FC<OptimizedProductCardProps> = React.memo(({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isInWishlist = false,
  isInCart = false,
  className = '',
  lazy = true,
  priority = 'normal'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // O(1) - Memoized price calculations
  const priceInfo = useMemo(() => {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount 
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0;

    return {
      hasDiscount,
      discountPercentage,
      formattedPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.price),
      formattedOriginalPrice: product.originalPrice 
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(product.originalPrice)
        : null
    };
  }, [product.price, product.originalPrice]);

  // O(1) - Memoized rating display
  const ratingDisplay = useMemo(() => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      fullStars,
      hasHalfStar,
      emptyStars,
      formattedRating: product.rating.toFixed(1)
    };
  }, [product.rating]);

  // O(1) - Optimized image source with lazy loading
  const optimizedImageSrc = useMemo(() => {
    if (!product.images.length) return '/placeholder-product.jpg';
    
    const primaryImage = product.images[0];
    return performanceOptimizer.optimizeImage(
      primaryImage,
      300, // width
      300, // height
      80,  // quality
      'webp' // format
    );
  }, [product.images]);

  // O(1) - Debounced event handlers
  const handleAddToCart = useCallback(
    performanceOptimizer.debounce(() => {
      onAddToCart(product.id);
    }, 300),
    [onAddToCart, product.id]
  );

  const handleToggleWishlist = useCallback(
    performanceOptimizer.debounce(() => {
      onToggleWishlist(product.id);
    }, 300),
    [onToggleWishlist, product.id]
  );

  const handleQuickView = useCallback(
    performanceOptimizer.debounce(() => {
      onQuickView(product.id);
    }, 300),
    [onQuickView, product.id]
  );

  // O(1) - Image load handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // O(1) - Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !cardRef.current) return;

    const cleanup = performanceOptimizer.lazyLoad(
      cardRef.current,
      () => setIsVisible(true),
      { threshold: 0.1 }
    );

    return cleanup;
  }, [lazy]);

  // O(1) - Preload image when visible
  useEffect(() => {
    if (isVisible && imageRef.current && !imageLoaded && !imageError) {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = optimizedImageSrc;
    }
  }, [isVisible, optimizedImageSrc, imageLoaded, imageError, handleImageLoad, handleImageError]);

  // O(1) - Stock status
  const stockStatus = useMemo(() => {
    if (product.countInStock === 0) return { status: 'out-of-stock', text: 'Out of Stock', color: 'text-red-600' };
    if (product.countInStock <= 5) return { status: 'low-stock', text: `Only ${product.countInStock} left`, color: 'text-orange-600' };
    return { status: 'in-stock', text: 'In Stock', color: 'text-green-600' };
  }, [product.countInStock]);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {isVisible ? (
          <>
            <img
              ref={imageRef}
              src={optimizedImageSrc}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={priority === 'high' ? 'eager' : 'lazy'}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Error fallback */}
            {imageError && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Image not available</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">NEW</span>
          )}
          {priceInfo.hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{priceInfo.discountPercentage}%
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full shadow-md transition-colors duration-200 ${
              isInWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleQuickView}
            className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock overlay */}
        {stockStatus.status === 'out-of-stock' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{product.category}</span>
          <span>{product.brand}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {/* Full stars */}
            {Array.from({ length: ratingDisplay.fullStars }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
            
            {/* Half star */}
            {ratingDisplay.hasHalfStar && (
              <div className="relative">
                <Star className="w-4 h-4 text-gray-300" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
            )}
            
            {/* Empty stars */}
            {Array.from({ length: ratingDisplay.emptyStars }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-gray-300" />
            ))}
          </div>
          
          <span className="text-sm text-gray-600">
            {ratingDisplay.formattedRating} ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {priceInfo.formattedPrice}
          </span>
          {priceInfo.formattedOriginalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {priceInfo.formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className={`text-sm mb-4 ${stockStatus.color}`}>
          {stockStatus.text}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={stockStatus.status === 'out-of-stock' || isInCart}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            stockStatus.status === 'out-of-stock'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isInCart
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {stockStatus.status === 'out-of-stock' 
            ? 'Out of Stock'
            : isInCart 
            ? 'Added to Cart'
            : 'Add to Cart'
          }
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // O(1) - Custom comparison for optimal re-rendering
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.countInStock === nextProps.product.countInStock &&
    prevProps.isInWishlist === nextProps.isInWishlist &&
    prevProps.isInCart === nextProps.isInCart
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;