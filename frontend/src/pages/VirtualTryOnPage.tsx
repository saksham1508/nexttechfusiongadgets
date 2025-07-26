import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Watch, 
  Headphones, 
  Eye, 
  Camera, 
  Smartphone,
  Sparkles,
  Shield,
  Award,
  Zap,
  Cpu,
  Bluetooth,
  Wifi,
  Battery,
  Volume2,
  Monitor,
  Gamepad2
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import VirtualTryOn from '../components/VirtualTryOn';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';


const VirtualTryOnPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector(state => state.products);
  
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showTryOn, setShowTryOn] = useState(false);
  const [productType, setProductType] = useState<'smartwatch' | 'headphones' | 'vr_headset' | 'smart_glasses' | 'earbuds'>('smartwatch');

  // Fetch products on mount
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts({ page: 1 }));
    }
  }, [dispatch, products]);

  // Find selected product
  useEffect(() => {
    if (productId && products && products.length > 0) {
      const product = products.find(p => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        // Determine product type based on category or name
        const name = product.name.toLowerCase();
        const category = product.category.toLowerCase();
        
        if (name.includes('headphone') || category.includes('headphone')) {
          setProductType('headphones');
        } else if (name.includes('watch') || category.includes('watch')) {
          setProductType('smartwatch');
        } else if (name.includes('vr') || name.includes('virtual reality') || category.includes('vr')) {
          setProductType('vr_headset');
        } else if (name.includes('smart glass') || name.includes('ar glass')) {
          setProductType('smart_glasses');
        } else if (name.includes('earbud') || name.includes('airpod') || category.includes('earbud')) {
          setProductType('earbuds');
        } else {
          setProductType('smartwatch');
        }
      }
    }
  }, [productId, products]);

  // Mock wearable tech products for demonstration
  const filteredProducts = products ? products.filter(product => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    return name.includes('watch') || name.includes('headphone') || name.includes('earbud') ||
           name.includes('vr') || name.includes('smart glass') || name.includes('fitness') ||
           category.includes('wearable') || category.includes('audio') || category.includes('accessories');
  }) : [];

  // Add mock products if no filtered products found
  const mockWearableProducts = [
    {
      _id: 'mock-smartwatch-1',
      name: 'Apple Watch Series 9',
      price: 399,
      category: 'Smartwatch',
      brand: 'Apple',
      stock: 50,
      images: [{ url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', alt: 'Apple Watch' }],
      rating: 4.8,
      numReviews: 1250,
      specifications: { 'Display': '45mm', 'Battery': '18 hours', 'Water Resistance': '50m' },
      reviews: [],
      seller: { _id: 'seller1', name: 'Apple Store' },
      isActive: true,
      tags: ['smartwatch', 'fitness', 'health'],
      warranty: '1 year',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock-headphones-1',
      name: 'Sony WH-1000XM5',
      price: 349,
      category: 'Headphones',
      brand: 'Sony',
      stock: 30,
      images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Sony Headphones' }],
      rating: 4.7,
      numReviews: 890,
      specifications: { 'Driver': '30mm', 'Battery': '30 hours', 'Noise Cancellation': 'Active' },
      reviews: [],
      seller: { _id: 'seller2', name: 'Sony Store' },
      isActive: true,
      tags: ['headphones', 'noise-cancelling', 'wireless'],
      warranty: '2 years',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock-earbuds-1',
      name: 'AirPods Pro 2',
      price: 249,
      category: 'Earbuds',
      brand: 'Apple',
      stock: 75,
      images: [{ url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400', alt: 'AirPods Pro' }],
      rating: 4.6,
      numReviews: 2100,
      specifications: { 'Driver': '11mm', 'Battery': '6 hours + 24 hours case', 'Noise Cancellation': 'Active' },
      reviews: [],
      seller: { _id: 'seller1', name: 'Apple Store' },
      isActive: true,
      tags: ['earbuds', 'wireless', 'noise-cancelling'],
      warranty: '1 year',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'mock-vr-1',
      name: 'Meta Quest 3',
      price: 499,
      category: 'VR Headset',
      brand: 'Meta',
      stock: 25,
      images: [{ url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400', alt: 'VR Headset' }],
      rating: 4.5,
      numReviews: 650,
      specifications: { 'Display': '2064x2208 per eye', 'Storage': '128GB', 'Tracking': '6DOF' },
      reviews: [],
      seller: { _id: 'seller3', name: 'Meta Store' },
      isActive: true,
      tags: ['vr', 'gaming', 'mixed-reality'],
      warranty: '1 year',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const wearableTechProducts = filteredProducts.length > 0 ? filteredProducts.slice(0, 8) : mockWearableProducts;

  const features = [
    {
      icon: <Camera className="h-6 w-6" />,
      title: 'Real-time Try-On',
      description: 'See how wearable tech looks on you instantly using your camera'
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: 'AI-Powered Fitting',
      description: 'Advanced AI ensures perfect virtual fit for smartwatches and headphones'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Privacy Protected',
      description: 'Your photos are processed locally and never stored'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Size Recommendations',
      description: 'Get personalized size and fit recommendations for wearables'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Virtual Try-On</h1>
                  <p className="text-sm text-gray-600">Experience wearable tech before you buy</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Beta Feature
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Try Before You Buy
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Experience wearable tech with our revolutionary virtual try-on technology
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Smartphone className="h-5 w-5" />
                  <span>Works on any device</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                  <span>100% Private & Secure</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Selected Product Try-On */}
      {selectedProduct && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img
                    src={selectedProduct.images[0]?.url || '/placeholder-product.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                  />
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedProduct.description}
                  </p>
                  <div className="text-3xl font-bold text-blue-600 mb-6">
                    ₹{selectedProduct.price.toLocaleString()}
                  </div>
                  
                  <motion.button
                    type="button"
                    onClick={() => setShowTryOn(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Camera className="h-6 w-6" />
                    <span>Try On Now</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Virtual Try-On?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of online shopping with our advanced virtual try-on technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg text-center"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-purple-600">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Try On Wearable Tech
            </h3>
            <p className="text-xl text-gray-600">
              Explore our virtual try-on experience for smartwatches, headphones, and more
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setProductType('smartwatch');
                if (wearableTechProducts.length > 0) {
                  setSelectedProduct(wearableTechProducts[0]);
                  setShowTryOn(true);
                }
              }}
            >
              <Watch className="h-12 w-12 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Smartwatches</h4>
              <p className="text-white/90">Try on the latest smartwatches and fitness trackers</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setProductType('headphones');
                if (wearableTechProducts.length > 0) {
                  setSelectedProduct(wearableTechProducts[0]);
                  setShowTryOn(true);
                }
              }}
            >
              <Headphones className="h-12 w-12 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Headphones</h4>
              <p className="text-white/90">Experience premium audio with perfect fit</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 rounded-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setProductType('earbuds');
                if (wearableTechProducts.length > 0) {
                  setSelectedProduct(wearableTechProducts[0]);
                  setShowTryOn(true);
                }
              }}
            >
              <Volume2 className="h-12 w-12 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Earbuds</h4>
              <p className="text-white/90">Wireless earbuds and in-ear monitors</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setProductType('vr_headset');
                if (wearableTechProducts.length > 0) {
                  setSelectedProduct(wearableTechProducts[0]);
                  setShowTryOn(true);
                }
              }}
            >
              <Monitor className="h-12 w-12 mb-4" />
              <h4 className="text-2xl font-bold mb-2">VR Headsets</h4>
              <p className="text-white/90">Virtual reality headsets and AR devices</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-8 rounded-2xl cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setProductType('smart_glasses');
                if (wearableTechProducts.length > 0) {
                  setSelectedProduct(wearableTechProducts[0]);
                  setShowTryOn(true);
                }
              }}
            >
              <Eye className="h-12 w-12 mb-4" />
              <h4 className="text-2xl font-bold mb-2">Smart Glasses</h4>
              <p className="text-white/90">AR glasses and smart eyewear technology</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Products */}
      {wearableTechProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Available for Virtual Try-On
              </h3>
              <p className="text-xl text-gray-600">
                Choose from our collection of wearable tech products
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {wearableTechProducts.map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard product={product} showQuickCommerce={false} />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowTryOn(true);
                    }}
                    className="absolute bottom-4 left-4 right-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Try On</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Virtual Try-On Modal */}
      {selectedProduct && (
        <VirtualTryOn
          isOpen={showTryOn}
          onClose={() => setShowTryOn(false)}
          product={selectedProduct}
          productType={productType}
        />
      )}
    </div>
  );
};

export default VirtualTryOnPage;