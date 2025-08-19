import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { logout, logoutSync } from "../store/slices/authSlice";
import { clearAllAuthData, forceLogout } from "../utils/authUtils";
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  MapPin,
  Clock,
  Zap,
  Bell,
  Eye,
} from "lucide-react";
import SearchWithSuggestions from "./SearchWithSuggestions";
import LocationSelector from "./LocationSelector";
import { Location } from "../services/locationService";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [tempCartCount, setTempCartCount] = useState(0);

  // Load cart count from temporary cart
  useEffect(() => {
    const loadCartCount = () => {
      const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
      const count = tempCart.reduce((total: number, item: any) => total + item.quantity, 0);
      setTempCartCount(count);
    };

    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    console.log('🔄 Header logout button clicked');
    
    try {
      // Use synchronous logout for immediate effect
      dispatch(logoutSync());
      
      // Also dispatch async logout as backup
      dispatch(logout());
      
      // Clear all auth data using utility
      clearAllAuthData();
      
      console.log('✅ Logout completed, navigating to home');
      toast.success('Logged out successfully');
      navigate("/");
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 200);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback to force logout
      forceLogout();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Use temporary cart count instead of Redux cart count
  const cartItemsCount = tempCartCount;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-gray-100">
        {/* Top Banner */}
        <div className="gradient-primary text-white py-2">
          <div className="container-modern">
            <div className="flex items-center justify-center space-x-6 text-sm font-medium">
              <div className="flex items-center space-x-10">
                <Zap className="h-4 w-4 animate-bounce-gentle" />
                <span>⚡ Lightning Fast Delivery in 10-15 minutes</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                <span>Free delivery on orders above ₹999</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Get notified about flash sales!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container-modern">
          <div className="flex justify-between items-center h-20 ">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover-scale">
              <div className="w-12 h-12  flex items-center justify-center shadow-lg">
                <img src="/Icon.png" alt="NexFuga Logo" className="h-6 w-6"/>
              </div>
              <div className=" hidden sm:block">
                <span className="text-4xl font-bold text-gradient text-yellow-500">
                  Nex
                </span>
                <span className="text-4xl font-bold text-gradient text-gray-800">
                  Fuga
                </span>
                {/* <span className="text-2xl font-bold text-gradient">
                  NexFuga
                </span> */}
                {/* <span className="text-sm text-blue-600 block -mt-1 font-semibold">
                  Express
                </span> */}
              </div>
            </Link>

            {/* Location & Search */}
            <div className="flex items-center justify-between max-w-3xl mx-6 space-y-3">
              {/* Location Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowLocationSelector(true)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-300 hover-lift"
                >
                  <MapPin className="h-5 w-5 text-red-500" />
                  <div className="text-left min-w-0">
                    <div className="text-xs text-gray-500 font-medium">
                      Deliver to
                    </div>
                    <div className="text-sm font-semibold truncate">
                      {selectedLocation
                        ? selectedLocation.name
                        : "Select Location"}
                    </div>
                  </div>
                </button>

                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    <Clock className=" h-4 w-4" />
                    <span className="flex items-center space-x-2 font-semibold">
                      10-15 min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">Express</span>
                  </div>
                  <Link
                    to="/vendor/dashboard"
                    className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-100 transition"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">Become a Vendor</span>
                  </Link>
                </div>
              </div>

              {/* Search Bar */}
              {/* <SearchWithSuggestions
                placeholder="Search for tech products..."
                className="w-full "
              /> */}
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/products"
                className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 hover-lift"
              >
                Products
              </Link>
              <Link
                to="/virtual-try-on"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover-lift"
              >
                <Eye className="h-4 w-4" />
                <span className="flex items-center">Try-On</span>
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative group"
                onClick={() => console.log('🛒 Header: Cart link clicked, navigating to /cart')}
              >
                <div className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all duration-300 hover-lift">
                  <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
                  <span className="font-semibold text-gray-700 group-hover:text-blue-600">
                    Cart
                  </span>
                  {cartItemsCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce-gentle">
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Notifications */}
              <button className="relative group">
                <div className="bg-gray-50 hover:bg-yellow-50 p-3 rounded-xl transition-all duration-300 hover-lift">
                  <Bell className="h-6 w-6 text-gray-700 group-hover:text-yellow-600" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse shadow-lg">
                    3
                  </span>
                </div>
              </button>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all duration-300 hover-lift">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-large py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/order-tracking"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Track Orders</span>
                    </Link>
                    {user.role === "seller" && (
                      <Link
                        to="/vendor/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Vendor Dashboard</span>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Products
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart ({cartItemsCount})</span>
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-700 hover:text-primary-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={(location) => {
          setSelectedLocation(location);
          setShowLocationSelector(false);
        }}
        selectedLocation={selectedLocation || undefined}
      />
    </>
  );
};

export default Header;
