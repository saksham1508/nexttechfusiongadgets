import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickCommerceFeatures from '../components/QuickCommerceFeatures';
import FlashSale from '../components/FlashSale';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import LocationSelector from '../components/LocationSelector';
import CategoryQuickBrowse from '../components/CategoryQuickBrowse';
import OffersAndCoupons from '../components/OffersAndCoupons';
import LiveOrderUpdates from '../components/LiveOrderUpdates';
import DealOfTheDay from '../components/DealOfTheDay';
import SmartRecommendations from '../components/SmartRecommendations';
import ProductComparison from '../components/ProductComparison';
import BulkOrderManager from '../components/BulkOrderManager';
import { ArrowRight, Smartphone, Laptop, Headphones, Watch, MapPin, Clock, Zap, Scale, Package } from 'lucide-react';
import { Location } from '../services/locationService';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);
  const [showBulkOrder, setShowBulkOrder] = useState(false);
  const [viewedProducts, setViewedProducts] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1 }));
  }, [dispatch]);

  const categories = [
    { name: 'Smartphones', icon: Smartphone, link: '/products?category=smartphones' },
    { name: 'Laptops', icon: Laptop, link: '/products?category=laptops' },
    { name: 'Audio', icon: Headphones, link: '/products?category=audio' },
    { name: 'Wearables', icon: Watch, link: '/products?category=wearables' },
  ];

  const featuredProducts = products?.slice(0, 8) || [];

  // Mock flash sale data
  const flashSaleProducts = (products || []).slice(0, 4).map((product: any) => ({
    ...product,
    image: product.images && product.images.length > 0 ? product.images[0].url : '',
    originalPrice: product.price * 1.3,
    salePrice: product.price,
    discount: 23,
    stock: 50,
    sold: 30,
    rating: 4.5,
    reviews: 120
  }));

  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 2); // 2 hours from now

  // Mock deal of the day data
  const dealProducts = (products || []).slice(0, 3).map((product: any) => ({
    ...product,
    dealPrice: Math.round(product.price * 0.7), // 30% off
    dealEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    dealStock: 100,
    dealSold: Math.floor(Math.random() * 50),
    isLimitedTime: true,
    dealBadge: 'MEGA DEAL'
  }));

  // Handle product comparison
  const addToComparison = (product: any) => {
    if (comparisonProducts.length >= 4) {
      alert('You can compare up to 4 products at a time');
      return;
    }
    if (!comparisonProducts.find(p => p._id === product._id)) {
      setComparisonProducts([...comparisonProducts, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setComparisonProducts(comparisonProducts.filter(p => p._id !== productId));
  };

  // Track viewed products (mock implementation)
  useEffect(() => {
    if (products && products.length > 0) {
      setViewedProducts(products.slice(0, 6));
    }
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Location & Search Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-soft">
        <div className="container-modern py-4">
          <div className="flex items-center space-x-6">
            {/* Location Selector */}
            <button
              onClick={() => setShowLocationSelector(true)}
              className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition-all duration-300 hover-lift min-w-0"
            >
              <MapPin className="h-6 w-6 text-red-500" />
              <div className="text-left min-w-0">
                <div className="text-xs text-gray-500 font-medium">Deliver to</div>
                <div className="text-sm font-semibold truncate">
                  {selectedLocation ? selectedLocation.name : 'Select Location'}
                </div>
              </div>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-3xl">
              <SearchWithSuggestions />
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Comparison Button */}
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="relative bg-purple-50 text-purple-700 px-4 py-3 rounded-xl hover:bg-purple-100 transition-colors flex items-center space-x-2"
                disabled={comparisonProducts.length === 0}
              >
                <Scale className="h-5 w-5" />
                <span className="text-sm font-semibold">Compare</span>
                {comparisonProducts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {comparisonProducts.length}
                  </span>
                )}
              </button>

              {/* Bulk Order Button */}
              <button
                type="button"
                onClick={() => setShowBulkOrder(true)}
                className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center space-x-2"
              >
                <Package className="h-5 w-5" />
                <span className="text-sm font-semibold">Bulk Order</span>
              </button>

              {/* Delivery Info */}
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Zap className="h-5 w-5" />
                <span className="text-sm font-semibold">10-15 min delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="gradient-primary text-white section-padding relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-#F4A300 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-#2E2E2E rounded-full blur-3xl animate-bounce-gentle"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        <div className="container-modern relative z-10">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <Zap className="h-16 w-16 text-yellow-300 animate-bounce-gentle" />
                <div className="absolute inset-0 h-16 w-16 animate-ping">
                  <Zap className="h-16 w-16 text-yellow-300/50" />
                </div>
              </div>
              <h1 className="flex text-5xl md:text-7xl font-black tracking-tight">
                <span className="block text-yellow-500">Nex</span>
                <span className="block text-gray-800">Fuga</span>

                {/* <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  FusionGadgets
                </span> */}
              </h1>
              <div className="relative">
                <Zap className="h-16 w-16 text-yellow-300 animate-bounce-gentle" />
                <div className="absolute inset-0 h-16 w-16 animate-ping">
                  <Zap className="h-16 w-16 text-yellow-300/50" />
                </div>
              </div>
            </div>
            <p className="text-2xl md:text-3xl mb-8 text-white/90 font-medium">
              🚀 Tech gadgets delivered in <span className="text-yellow-300 font-bold">10-15 minutes</span> ⚡
            </p>
            <p className="text-xl mb-12 text-white/80 font-medium max-w-2xl mx-auto">
              🌟 Experience India's fastest tech delivery service with premium gadgets at your doorstep
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <Link
                to="/products"
                className="flex btn-secondary text-lg px-10 py-4 hover-glow"
              >
                <span>🛍️ Shop Now</span>
                <ArrowRight className="h-6 w-6 ml-2" />
              </Link>
              <div className="flex items-center space-x-8 text-white/90">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Clock className="h-5 w-5 text-green-300" />
                  <span className="font-semibold">10-15 min delivery</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <span className="font-semibold">25+ cities</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Zap className="h-5 w-5 text-yellow-300" />
                  <span className="font-semibold">24/7 service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Commerce Features */}
      <QuickCommerceFeatures />

      {/* Deal of the Day */}
      {dealProducts.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-modern">
            <DealOfTheDay 
              deals={dealProducts}
              onViewAll={() => window.location.href = '/deals'}
            />
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <FlashSale
          endTime={flashSaleEndTime}
          products={flashSaleProducts}
          title="⚡ Lightning Deals"
        />
      )}

      {/* Category Quick Browse */}
      <CategoryQuickBrowse />

      {/* Offers & Coupons */}
      <OffersAndCoupons />

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="container-modern">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-16 space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                🌟 Featured Products
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                Handpicked premium gadgets just for you
              </p>
            </div>
            <Link
              to="/products"
              className="flex btn-outline hover-glow"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="skeleton h-56 w-full mb-4"></div>
                  <div className="p-6">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-4 w-1/2 mb-4"></div>
                    <div className="skeleton h-8 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
              {featuredProducts.map((product: any, index: number) => {
                const delayClass = `animate-delay-${Math.min(index * 100, 700)}`;
                return (
                  <div key={product._id} className={delayClass}>
                    <ProductCard 
                      product={product} 
                      showQuickCommerce={true}
                      onAddToComparison={addToComparison}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Smart Recommendations */}
      <section className="section-padding bg-gray-50">
        <div className="container-modern">
          <SmartRecommendations
            userId={user?._id}
            viewedProducts={viewedProducts}
            cartItems={[]}
            className="shadow-lg"
          />
        </div>
      </section>

      {/* Live Order Updates */}
      <LiveOrderUpdates />

      {/* Modals */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={(location) => {
          setSelectedLocation(location);
          setShowLocationSelector(false);
        }}
        selectedLocation={selectedLocation || undefined}
      />

      <ProductComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        products={comparisonProducts}
        onRemoveProduct={removeFromComparison}
      />

      <BulkOrderManager
        isOpen={showBulkOrder}
        onClose={() => setShowBulkOrder(false)}
        initialProducts={featuredProducts.slice(0, 2)}
      />
    </div>
  );
};

export default HomePage;
