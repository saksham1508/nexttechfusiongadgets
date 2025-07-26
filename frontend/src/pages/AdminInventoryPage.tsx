// Admin Inventory Management Page with AI Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Settings,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import AIInventoryDashboard from '../components/AIInventoryDashboard';
import InventoryForecastChart from '../components/InventoryForecastChart';
import VirtualizedList from '../components/VirtualizedList';
import { useOptimizedState } from '../hooks/useOptimizedState';
import performanceOptimizer from '../utils/performanceOptimizer';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  countInStock: number;
  autoReorder: boolean;
  minStock: number;
  maxStock: number;
  leadTime: number;
  supplier: string;
  lastReorderDate?: string;
  reorderCount: number;
}

const AdminInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'forecasts' | 'settings'>('dashboard');
  
  const { state: products, setState: setProducts } = useOptimizedState<Product[]>({
    initialValue: []
  });
  
  const { state: selectedProducts, setState: setSelectedProducts } = useOptimizedState<string[]>({
    initialValue: []
  });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // O(1) - Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // O(n log n) - Load products with optimization
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/products?admin=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // O(n) - Filter products based on search and filters
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const matchesStock = stockFilter === 'all' ||
                          (stockFilter === 'low' && product.countInStock <= product.minStock) ||
                          (stockFilter === 'out' && product.countInStock === 0) ||
                          (stockFilter === 'normal' && product.countInStock > product.minStock);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // O(1) - Toggle product auto-reorder
  const toggleAutoReorder = async (productId: string, autoReorder: boolean) => {
    try {
      const response = await fetch(`/api/ai-inventory/products/${productId}/auto-reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autoReorder })
      });

      if (response.ok) {
        setProducts(prev => prev.map(product => 
          product._id === productId ? { ...product, autoReorder } : product
        ));
      }
    } catch (error) {
      console.error('Error updating auto-reorder:', error);
    }
  };

  // O(1) - Update product inventory settings
  const updateInventorySettings = async (productId: string, settings: Partial<Product>) => {
    try {
      const response = await fetch(`/api/ai-inventory/products/${productId}/auto-reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setProducts(prev => prev.map(product => 
          product._id === productId ? { ...product, ...settings } : product
        ));
      }
    } catch (error) {
      console.error('Error updating inventory settings:', error);
    }
  };

  // O(1) - Generate automated orders
  const generateAutomatedOrders = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/ai-inventory/generate-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Generated ${data.data.ordersGenerated} automated purchase orders`);
      }
    } catch (error) {
      console.error('Error generating orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // O(1) - Export inventory data
  const exportInventoryData = async () => {
    try {
      const response = await fetch('/api/ai-inventory/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // O(1) - Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // O(1) - Render product item for virtualized list
  const renderProductItem = (product: Product, index: number) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProducts(prev => [...prev, product._id]);
                } else {
                  setSelectedProducts(prev => prev.filter(id => id !== product._id));
                }
              }}
              className="rounded border-gray-300"
            />
            
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Stock:</span>
              <span className={`ml-1 ${
                product.countInStock === 0 ? 'text-red-600' :
                product.countInStock <= product.minStock ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {product.countInStock}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Min:</span>
              <span className="ml-1 text-gray-900">{product.minStock}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Max:</span>
              <span className="ml-1 text-gray-900">{product.maxStock}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Lead Time:</span>
              <span className="ml-1 text-gray-900">{product.leadTime}d</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Supplier:</span>
              <span className="ml-1 text-gray-900">{product.supplier}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Reorders:</span>
              <span className="ml-1 text-gray-900">{product.reorderCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={product.autoReorder}
              onChange={(e) => toggleAutoReorder(product._id, e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Auto Reorder</span>
          </label>
          
          <button
            onClick={() => {
              // Open forecast modal or navigate to forecast page
              setActiveTab('forecasts');
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Forecast"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => {
              // Open settings modal
            }}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={generateAutomatedOrders}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                <span>Generate AI Orders</span>
              </button>
              
              <button
                onClick={exportInventoryData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={loadProducts}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'AI Dashboard', icon: Brain },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <AIInventoryDashboard />}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="normal">Normal Stock</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} of {products.length} products
                  </span>
                </div>
              </div>
            </div>

            {/* Products List */}
            {filteredProducts.length > 0 ? (
              <VirtualizedList
                items={filteredProducts}
                itemHeight={120}
                containerHeight={600}
                renderItem={renderProductItem}
                className="bg-gray-50 rounded-lg p-4"
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Demand Forecasts</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.slice(0, 6).map(product => (
                <InventoryForecastChart
                  key={product._id}
                  productId={product._id}
                  productName={product.name}
                  currentStock={product.countInStock}
                  days={30}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">AI Inventory Settings</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Global Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable AI Auto-Reordering</label>
                    <p className="text-sm text-gray-600">Automatically generate purchase orders based on AI predictions</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Forecast Confidence Threshold</label>
                    <p className="text-sm text-gray-600">Minimum confidence level for automated actions</p>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1" 
                    step="0.05" 
                    defaultValue="0.8"
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reorder Check Frequency</label>
                    <p className="text-sm text-gray-600">How often to check for reorder needs</p>
                  </div>
                  <select className="px-3 py-1 border border-gray-300 rounded-md">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryPage;