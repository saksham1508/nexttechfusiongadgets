import React, { useState } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Camera, 
  Gamepad2,
  Tablet,
  Speaker,
  ChevronRight,
  Zap,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  image: string;
  itemCount: number;
  deliveryTime: string;
  trending?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  items: CategoryItem[];
}

const CategoryQuickBrowse: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('smartphones');

  const categories: Category[] = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        { id: '1', name: 'iPhone', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 25, deliveryTime: '10 min', trending: true },
        { id: '2', name: 'Samsung Galaxy', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 30, deliveryTime: '12 min' },
        { id: '3', name: 'OnePlus', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 18, deliveryTime: '15 min' },
        { id: '4', name: 'Xiaomi', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 22, deliveryTime: '10 min' },
        { id: '5', name: 'Google Pixel', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 12, deliveryTime: '15 min' },
        { id: '6', name: 'Realme', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 20, deliveryTime: '12 min' }
      ]
    },
    {
      id: 'laptops',
      name: 'Laptops',
      icon: Laptop,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { id: '7', name: 'MacBook', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 15, deliveryTime: '20 min', trending: true },
        { id: '8', name: 'Dell XPS', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 12, deliveryTime: '25 min' },
        { id: '9', name: 'HP Pavilion', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 18, deliveryTime: '20 min' },
        { id: '10', name: 'Lenovo ThinkPad', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 10, deliveryTime: '30 min' },
        { id: '11', name: 'ASUS ROG', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 8, deliveryTime: '25 min' },
        { id: '12', name: 'Acer Aspire', icon: Laptop, image: '/api/placeholder/60/60', itemCount: 14, deliveryTime: '20 min' }
      ]
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: Headphones,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: [
        { id: '13', name: 'AirPods', icon: Headphones, image: '/api/placeholder/60/60', itemCount: 20, deliveryTime: '8 min', trending: true },
        { id: '14', name: 'Sony WH-1000XM', icon: Headphones, image: '/api/placeholder/60/60', itemCount: 15, deliveryTime: '10 min' },
        { id: '15', name: 'Bose QuietComfort', icon: Headphones, image: '/api/placeholder/60/60', itemCount: 12, deliveryTime: '12 min' },
        { id: '16', name: 'JBL', icon: Speaker, image: '/api/placeholder/60/60', itemCount: 25, deliveryTime: '8 min' },
        { id: '17', name: 'Sennheiser', icon: Headphones, image: '/api/placeholder/60/60', itemCount: 8, deliveryTime: '15 min' },
        { id: '18', name: 'Boat', icon: Headphones, image: '/api/placeholder/60/60', itemCount: 30, deliveryTime: '8 min' }
      ]
    },
    {
      id: 'wearables',
      name: 'Wearables',
      icon: Watch,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      items: [
        { id: '19', name: 'Apple Watch', icon: Watch, image: '/api/placeholder/60/60', itemCount: 18, deliveryTime: '12 min', trending: true },
        { id: '20', name: 'Samsung Galaxy Watch', icon: Watch, image: '/api/placeholder/60/60', itemCount: 15, deliveryTime: '15 min' },
        { id: '21', name: 'Fitbit', icon: Watch, image: '/api/placeholder/60/60', itemCount: 12, deliveryTime: '10 min' },
        { id: '22', name: 'Garmin', icon: Watch, image: '/api/placeholder/60/60', itemCount: 8, deliveryTime: '20 min' },
        { id: '23', name: 'Amazfit', icon: Watch, image: '/api/placeholder/60/60', itemCount: 20, deliveryTime: '12 min' },
        { id: '24', name: 'Noise', icon: Watch, image: '/api/placeholder/60/60', itemCount: 25, deliveryTime: '8 min' }
      ]
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: Gamepad2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      items: [
        { id: '25', name: 'PlayStation 5', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 5, deliveryTime: '30 min', trending: true },
        { id: '26', name: 'Xbox Series X', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 4, deliveryTime: '30 min' },
        { id: '27', name: 'Nintendo Switch', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 8, deliveryTime: '25 min' },
        { id: '28', name: 'Gaming Keyboards', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 15, deliveryTime: '15 min' },
        { id: '29', name: 'Gaming Mouse', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 20, deliveryTime: '12 min' },
        { id: '30', name: 'VR Headsets', icon: Gamepad2, image: '/api/placeholder/60/60', itemCount: 6, deliveryTime: '25 min' }
      ]
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: Camera,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      items: [
        { id: '31', name: 'Phone Cases', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 50, deliveryTime: '8 min' },
        { id: '32', name: 'Chargers', icon: Zap, image: '/api/placeholder/60/60', itemCount: 40, deliveryTime: '8 min', trending: true },
        { id: '33', name: 'Power Banks', icon: Zap, image: '/api/placeholder/60/60', itemCount: 30, deliveryTime: '10 min' },
        { id: '34', name: 'Cables', icon: Zap, image: '/api/placeholder/60/60', itemCount: 35, deliveryTime: '8 min' },
        { id: '35', name: 'Screen Guards', icon: Smartphone, image: '/api/placeholder/60/60', itemCount: 45, deliveryTime: '8 min' },
        { id: '36', name: 'Stands & Mounts', icon: Tablet, image: '/api/placeholder/60/60', itemCount: 25, deliveryTime: '12 min' }
      ]
    }
  ];

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-modern">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              🛍️ Browse by Category
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Find exactly what you're looking for
            </p>
          </div>
          <Link
            to="/categories"
            className="flex btn-outline hover-glow"
          >
            <span>View All Categories</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <span>Categories</span>
              </h3>
              <div className="space-y-3">
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 hover-lift ${
                        isSelected
                          ? `${category.bgColor} ${category.color} border-2 border-current shadow-lg`
                          : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/80 shadow-md' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-lg">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Items Grid */}
          <div className="lg:col-span-3">
            {selectedCategoryData && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <div className={`w-16 h-16 ${selectedCategoryData.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <selectedCategoryData.icon className={`h-8 w-8 ${selectedCategoryData.color}`} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {selectedCategoryData.name}
                    </h3>
                    <span className="text-lg text-gray-600 font-medium">
                      {selectedCategoryData.items.reduce((sum, item) => sum + item.itemCount, 0)} products available
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedCategoryData.items.map((item) => {
                    const IconComponent = item.icon;
                    
                    return (
                      <Link
                        key={item.id}
                        to={`/products?category=${selectedCategory}&brand=${item.name.toLowerCase()}`}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.itemCount} items
                            </p>
                          </div>
                          {item.trending && (
                            <div className="flex items-center space-x-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                              <Zap className="h-3 w-3" />
                              <span className="text-xs font-medium">Hot</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-green-600">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">{item.deliveryTime}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryQuickBrowse;