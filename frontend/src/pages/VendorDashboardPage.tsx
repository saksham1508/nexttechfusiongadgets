import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ShoppingCart, Package, BarChart3, CheckCircle2, Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosConfig';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  countInStock: number;
  images: string[];
  description: string;
  brand: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const VendorDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Show onboarding for non-sellers
  if (user && user.role !== 'seller') {
    return (
      <div className="container-modern py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Vendor</h1>
            <p className="text-gray-600 mb-8">
              Start selling your products on NextTechFusion and reach thousands of customers. 
              Join our marketplace and grow your business with us.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-3">Why Sell With Us?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700">Large customer base</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700">Easy product management</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700">Secure payments</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700">24/7 support</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                To become a vendor, please contact our support team or apply through our vendor application process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                  Apply as Vendor
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    countInStock: '',
    images: '',
    description: '',
    brand: ''
  });

  // Fetch vendor's products on component mount
  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products?seller=${user?._id}`);
      const vendorProducts = response.data.data?.products || [];
      setProducts(vendorProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.brand) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        brand: newProduct.brand,
        countInStock: parseInt(newProduct.countInStock) || 0,
        images: newProduct.images ? [newProduct.images] : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
        description: newProduct.description || 'No description provided'
      };

      const response = await axiosInstance.post('/products', productData);
      
      if (response.data.success) {
        await fetchProducts(); // Refresh the products list
        setNewProduct({ name: '', price: '', category: '', countInStock: '', images: '', description: '', brand: '' });
        setShowAddProduct(false);
        toast.success('Product added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/products/${id}`);
      
      if (response.data.success) {
        await fetchProducts(); // Refresh the products list
        toast.success('Product deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-modern py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {user ? `Welcome, ${user.name}!` : 'Manage your products, orders, and performance.'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">128</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fulfillment Rate</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue (30d)</p>
                  <p className="text-2xl font-bold">₹2.4L</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #1234</p>
                    <p className="text-sm text-gray-500">iPhone 15 Pro × 1</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Delivered</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #1235</p>
                    <p className="text-sm text-gray-500">MacBook Air M2 × 1</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Processing</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
              <div className="space-y-3">
                {products.filter(p => p.countInStock < 20).map(product => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-red-600">{product.countInStock} units left</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Low Stock</span>
                  </div>
                ))}
                {products.filter(p => p.countInStock < 20).length === 0 && (
                  <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">{product.brand}</p>
                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-red-600">₹{product.price.toLocaleString()}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.countInStock > 20 ? 'bg-green-100 text-green-800' :
                        product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock} in stock
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-1">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-1"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first product to the marketplace</p>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                  >
                    Add Your First Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <p className="text-gray-500 text-center py-8">Order management functionality coming soon...</p>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select category</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Audio">Audio</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={newProduct.countInStock}
                  onChange={(e) => setNewProduct({...newProduct, countInStock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter stock quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({...newProduct, images: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboardPage;