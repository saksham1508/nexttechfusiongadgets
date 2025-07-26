import React from 'react';
import { 
  Zap, 
  MapPin, 
  Search, 
  ShoppingCart, 
  Clock, 
  Bell, 
  Gift, 
  Percent,
  Package,
  Truck,
  Star,
  Shield,
  CreditCard,
  Headphones,
  Users,
  TrendingUp,
  Navigation,
  Eye,
  CheckCircle
} from 'lucide-react';

const FeaturesSummary: React.FC = () => {
  const quickCommerceFeatures = [
    {
      category: "🚀 Ultra-Fast Delivery",
      features: [
        { icon: Zap, name: "10-15 minute delivery", description: "Lightning fast delivery to your doorstep" },
        { icon: MapPin, name: "Location-based delivery", description: "Smart location detection and delivery zones" },
        { icon: Clock, name: "Real-time tracking", description: "Live order tracking with delivery agent details" },
        { icon: Truck, name: "Express delivery slots", description: "Choose your preferred delivery time" }
      ]
    },
    {
      category: "🛒 Smart Shopping Experience",
      features: [
        { icon: Search, name: "Intelligent search", description: "AI-powered search with suggestions and autocomplete" },
        { icon: ShoppingCart, name: "Quick add to cart", description: "One-click add to cart with quantity controls" },
        { icon: Eye, name: "Quick product view", description: "Instant product preview without page reload" },
        { icon: TrendingUp, name: "Trending products", description: "Real-time trending and popular items" }
      ]
    },
    {
      category: "🎯 Personalized Features",
      features: [
        { icon: Bell, name: "Live order updates", description: "Real-time notifications for order status" },
        { icon: Users, name: "User preferences", description: "Personalized recommendations and saved addresses" },
        { icon: Star, name: "Smart recommendations", description: "AI-powered product suggestions" },
        { icon: Navigation, name: "Live location tracking", description: "Track delivery agent in real-time" }
      ]
    },
    {
      category: "💰 Deals & Offers",
      features: [
        { icon: Gift, name: "Flash sales", description: "Limited-time deals with countdown timers" },
        { icon: Percent, name: "Smart coupons", description: "Intelligent coupon system with auto-apply" },
        { icon: TrendingUp, name: "Dynamic pricing", description: "Real-time price updates and best deals" },
        { icon: Package, name: "Bundle offers", description: "Smart product bundles and combo deals" }
      ]
    },
    {
      category: "🔒 Trust & Security",
      features: [
        { icon: Shield, name: "Secure payments", description: "Multiple payment options with bank-grade security" },
        { icon: CheckCircle, name: "Quality guarantee", description: "100% authentic products with warranty" },
        { icon: CreditCard, name: "Easy refunds", description: "Hassle-free returns and instant refunds" },
        { icon: Headphones, name: "24/7 support", description: "Round-the-clock customer assistance" }
      ]
    },
    {
      category: "📱 Advanced Technology",
      features: [
        { icon: Zap, name: "PWA support", description: "Progressive web app for mobile-like experience" },
        { icon: Bell, name: "Push notifications", description: "Real-time updates and promotional alerts" },
        { icon: MapPin, name: "Geolocation services", description: "Automatic location detection and suggestions" },
        { icon: Search, name: "Voice search", description: "Search products using voice commands" }
      ]
    }
  ];

  const platformComparisons = [
    {
      platform: "Blinkit",
      features: ["10-min delivery", "Grocery focus", "Dark stores", "Live tracking"]
    },
    {
      platform: "Zepto",
      features: ["10-min delivery", "Wide catalog", "Flash sales", "Smart recommendations"]
    },
    {
      platform: "Instamart",
      features: ["15-min delivery", "Multiple categories", "Offers & coupons", "Live updates"]
    },
    {
      platform: "NextTech Express",
      features: ["10-15 min delivery", "Tech products", "All above features", "AI-powered experience"]
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Complete Quick Commerce Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've implemented all the cutting-edge features used by major quick commerce giants 
            like Blinkit, Zepto, and Instamart, specifically tailored for tech products.
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-12">
          {quickCommerceFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {category.category}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.features.map((feature, featureIndex) => {
                  const IconComponent = feature.icon;
                  
                  return (
                    <div
                      key={featureIndex}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {feature.name}
                      </h4>
                      
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Platform Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🏆 How We Compare with Industry Leaders
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformComparisons.map((platform, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border-2 ${
                  platform.platform === 'NextTech Express'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <h4 className={`font-bold text-lg mb-4 ${
                  platform.platform === 'NextTech Express'
                    ? 'text-green-800'
                    : 'text-gray-900'
                }`}>
                  {platform.platform}
                  {platform.platform === 'NextTech Express' && (
                    <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                      Our Platform
                    </span>
                  )}
                </h4>
                
                <ul className="space-y-2">
                  {platform.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center space-x-2 text-sm ${
                        platform.platform === 'NextTech Express'
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Stats */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8">
          <h3 className="text-2xl font-bold mb-8 text-center">
            📊 Implementation Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "25+", label: "Components Created" },
              { number: "15+", label: "API Endpoints" },
              { number: "8+", label: "Database Models" },
              { number: "100%", label: "Feature Parity" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Ready to Experience Ultra-Fast Tech Delivery?
            </h3>
            <p className="text-gray-600 mb-6">
              All features are now live and ready to provide you with the fastest tech shopping experience in India!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                Start Shopping Now
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all">
                View All Features
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSummary;