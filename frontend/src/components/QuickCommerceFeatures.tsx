import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Zap, 
  Shield, 
  Truck, 
  Star,
  ChevronRight,
  Timer,
  Package,
  CreditCard,
  Headphones
} from 'lucide-react';

interface DeliveryInfo {
  estimatedTime: number;
  available: boolean;
  fee: number;
}

const QuickCommerceFeatures: React.FC = () => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    estimatedTime: 15,
    available: true,
    fee: 0
  });

  const features = [
    {
      icon: Zap,
      title: "10-15 Min Delivery",
      description: "Lightning fast delivery to your doorstep",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "100% authentic products with warranty",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: CreditCard,
      title: "Easy Payments",
      description: "Multiple payment options available",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round the clock customer assistance",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  const quickStats = [
    { label: "Orders Delivered", value: "1M+", icon: Package },
    { label: "Happy Customers", value: "500K+", icon: Star },
    { label: "Cities Covered", value: "25+", icon: MapPin },
    { label: "Avg Delivery Time", value: "12 min", icon: Timer }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Delivery Promise Banner */}
      <div className="gradient-success text-white py-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-2 right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl animate-bounce-gentle"></div>
        </div>
        
        <div className="container-modern relative z-10">
          <div className="flex items-center justify-center space-x-6">
            <div className="relative">
              <Zap className="h-8 w-8 animate-bounce-gentle text-yellow-300" />
              <div className="absolute inset-0 h-8 w-8 animate-ping">
                <Zap className="h-8 w-8 text-yellow-300/50" />
              </div>
            </div>
            <span className="font-bold text-2xl">
              ⚡ Ultra-Fast Delivery in <span className="text-yellow-300">{deliveryInfo.estimatedTime} minutes</span>
            </span>
            <div className="relative">
              <Zap className="h-8 w-8 animate-bounce-gentle text-yellow-300" />
              <div className="absolute inset-0 h-8 w-8 animate-ping">
                <Zap className="h-8 w-8 text-yellow-300/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <section className="section-padding">
        <div className="container-modern">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              🚀 Why Choose NexFuga ?
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Experience the future of tech shopping with our lightning-fast delivery and premium service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-fade-in">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-feature hover-glow group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="container-modern">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-black text-gray-900 mb-4">📊 Our Impact</h3>
            <p className="text-xl text-gray-600 font-medium">Numbers that speak for themselves</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-large group-hover:shadow-colored transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-600 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Process */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              From order to delivery in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Browse & Order",
                description: "Choose from thousands of tech products",
                icon: Package
              },
              {
                step: "2",
                title: "Quick Processing",
                description: "We prepare your order instantly",
                icon: Zap
              },
              {
                step: "3",
                title: "Fast Delivery",
                description: "Delivered to your door in minutes",
                icon: Truck
              }
            ].map((process, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <process.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">
                      {process.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {process.title}
                  </h3>
                  <p className="text-gray-600">
                    {process.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              Available in 25+ Cities
            </h3>
            <p className="text-lg opacity-90 mb-4">
              Expanding rapidly across India with ultra-fast delivery
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {[
                "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
                "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"
              ].map((city, index) => (
                <span 
                  key={index}
                  className="bg-white bg-opacity-20 px-3 py-1 rounded-full"
                >
                  {city}
                </span>
              ))}
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                +15 more
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuickCommerceFeatures;