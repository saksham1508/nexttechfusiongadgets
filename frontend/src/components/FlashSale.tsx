import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Flame, 
  ArrowRight, 
  Star,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QuickAddToCart from './QuickAddToCart';

interface FlashSaleProduct {
  _id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
}

interface FlashSaleProps {
  endTime: Date;
  products: FlashSaleProduct[];
  title?: string;
}

const FlashSale: React.FC<FlashSaleProps> = ({
  endTime,
  products,
  title = "⚡ Flash Sale"
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const getStockPercentage = (sold: number, stock: number) => {
    const total = sold + stock;
    return total > 0 ? (sold / total) * 100 : 0;
  };

  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-gradient-to-br from-red-500 via-pink-600 to-purple-700 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-lg animate-bounce-gentle"></div>
      </div>
      
      <div className="container-modern relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="relative">
                <Flame className="h-12 w-12 animate-bounce-gentle text-yellow-300" />
                <div className="absolute inset-0 h-12 w-12 animate-ping">
                  <Flame className="h-12 w-12 text-yellow-300/50" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight">{title}</h2>
                <p className="text-white/80 text-lg font-medium">Limited time offers</p>
              </div>
              <Zap className="h-8 w-8 animate-bounce text-yellow-300" />
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-3 text-white/90">
              <Clock className="h-6 w-6" />
              <span className="text-lg font-semibold">Sale ends in:</span>
            </div>
            <div className="flex items-center space-x-2">
              {[
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((time, index) => (
                <React.Fragment key={time.label}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[70px] text-center border border-white/30 shadow-lg">
                    <div className="text-2xl font-black text-white">{formatTime(time.value)}</div>
                    <div className="text-xs text-white/80 font-semibold uppercase tracking-wider">{time.label}</div>
                  </div>
                  {index < 2 && <span className="text-3xl font-bold text-white/60 animate-pulse">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
          {products.slice(0, 8).map((product, index) => {
            const stockPercentage = getStockPercentage(product.sold, product.stock);
            
            return (
              <div
                key={product._id}
                className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-large overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-500 border border-white/20 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    {product.discount}% OFF
                  </div>
                  
                  {/* Flash Sale Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <Zap className="h-3 w-3" />
                    <span>FLASH</span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover-scale"
                    >
                      <Eye className="h-5 w-5 text-gray-700" />
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-700 ml-2 font-semibold">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-black text-red-600">
                      ₹{product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400 line-through ml-3">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-green-600 font-bold ml-2 bg-green-50 px-2 py-1 rounded-full">
                      Save ₹{(product.originalPrice - product.salePrice).toLocaleString()}
                    </span>
                  </div>

                  {/* Stock Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                      <span>🔥 {product.sold} sold</span>
                      <span>📦 {product.stock} left</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 h-3 rounded-full transition-all duration-500 relative"
                        style={{ width: `${stockPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 font-semibold">
                      {stockPercentage.toFixed(0)}% sold - Hurry up!
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <QuickAddToCart
                    product={{
                      _id: product._id,
                      name: product.name,
                      price: product.salePrice,
                      image: product.image,
                      stock: product.stock
                    }}
                    size="sm"
                    showQuickBuy={true}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        {products.length > 8 && (
          <div className="text-center mt-12">
            <Link
              to="/flash-sale"
              className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 border border-white/30 hover-lift shadow-lg"
            >
              <span className="text-lg">View All Flash Sale Items</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSale;