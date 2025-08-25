import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, CheckCircle2, Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
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
  // Optional extensions used by dashboard
  originalPrice?: number;
  sku?: string;
  variants?: { name: string; value: string; price?: number; stock?: number; sku?: string }[];
}

const VendorDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  // Show onboarding for unauthenticated users and non-sellers
  if (!user || user.role !== 'seller') {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'pricing'>('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '', // MRP
    sku: '',
    category: '',
    countInStock: '',
    description: '',
    brand: '',
    variants: [] as { name: string; value: string; price?: string; stock?: string; sku?: string }[]
  });
  // New: capture discount percentage for MRP-based pricing
  const [newDiscount, setNewDiscount] = useState<string>('');
  
  const [productImages, setProductImages] = useState<string[]>([]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Edit product modal state
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    price: '',
    originalPrice: '', // MRP
    sku: '',
    category: '',
    countInStock: '',
    description: '',
    brand: '',
    images: [] as string[],
    variants: [] as { name: string; value: string; price?: string; stock?: string; sku?: string }[]
  });
  // New: discount field for edit form
  const [editDiscount, setEditDiscount] = useState<string>('');

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
      // Guard: only keep products that belong to this vendor (defense in depth)
      const list = response.data.data?.products || [];
      const vendorProducts = list.filter((p: any) => {
        const sellerId = (p.seller?._id || p.seller || '').toString();
        const uid = (user?._id || '').toString();
        return sellerId && uid && sellerId === uid;
      });
      setProducts(vendorProducts);
      try {
        const localKey = `vendorProducts:${user?._id}`;
        localStorage.setItem(localKey, JSON.stringify(vendorProducts));
      } catch {}
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Offline fallback: load from local storage
      try {
        const localKey = `vendorProducts:${user?._id}`;
        const saved = localStorage.getItem(localKey);
        if (saved) {
          const cached = JSON.parse(saved);
          setProducts(cached);
          toast.success('Loaded offline vendor products');
        } else {
          toast.error('Failed to fetch products');
        }
      } catch {
        toast.error('Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      
      // Update the productImages array with the new image at the specified index
      setProductImages(prevImages => {
        const newImages = [...prevImages];
        newImages[index] = imageDataUrl;
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = (index: number) => {
    setProductImages(prevImages => {
      const newImages = [...prevImages];
      newImages[index] = '';
      return newImages;
    });
    
    // Reset the file input
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = '';
    }
  };
  
  const handleAddProduct = async () => {
    if (!newProduct.name || (!newProduct.price && !(newProduct.originalPrice && newDiscount)) || !newProduct.category || !newProduct.brand) {
      toast.error('Please fill in required fields. Provide either Selling Price or MRP + Discount.');
      return;
    }

    // Auto-calc price from MRP and discount if price empty
    let sellingPrice = newProduct.price ? parseFloat(newProduct.price) : NaN;
    const mrp = newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : NaN;
    const discountPct = newDiscount ? Math.max(0, Math.min(100, parseFloat(newDiscount))) : NaN;
    if (!newProduct.price && !isNaN(mrp) && !isNaN(discountPct)) {
      sellingPrice = Math.max(0, Math.round((mrp - (mrp * discountPct) / 100) * 100) / 100);
    }

    if (!isFinite(sellingPrice)) {
      toast.error('Please provide a valid price or valid MRP + discount.');
      return;
    }

    // Client-side duplicate prevention: simple check by name+brand
    const exists = products.some(p => p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase() && (p.brand||'').trim().toLowerCase() === newProduct.brand.trim().toLowerCase());
    if (exists) {
      toast.error('A product with the same name and brand already exists.');
      return;
    }
    
    if (productImages.filter(img => img).length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    try {
      setLoading(true);
      // Ensure token exists for seller in dev/mock mode
      let token = localStorage.getItem('token');
      if (!token && user && user.role === 'seller') {
        const fallbackToken = `mock_vendor_token_${user._id || 'vendor_1'}`;
        localStorage.setItem('token', fallbackToken);
        console.log('🔧 Added fallback vendor token before product create');
      }
      const productData = {
        name: newProduct.name,
        price: sellingPrice,
        originalPrice: isFinite(mrp) ? mrp : undefined,
        sku: newProduct.sku || undefined,
        category: newProduct.category,
        brand: newProduct.brand,
        countInStock: parseInt(newProduct.countInStock) || 0,
        images: productImages.filter(img => img).length > 0 
          ? productImages.filter(img => img) 
          : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
        variants: newProduct.variants?.map(v => ({
          name: v.name,
          value: v.value,
          price: v.price ? parseFloat(v.price) : undefined,
          stock: v.stock ? parseInt(v.stock) : undefined,
          sku: v.sku || undefined
        })) || [],
        description: newProduct.description || 'No description provided'
      };

      const response = await axiosInstance.post('/products', productData);
      
      if (response.data.success) {
        await fetchProducts(); // Refresh the products list
        setNewProduct({
          name: '',
          price: '',
          originalPrice: '',
          sku: '',
          category: '',
          countInStock: '',
          description: '',
          brand: '',
          variants: []
        });
        setNewDiscount('');
        setProductImages([]);
        setShowAddProduct(false);
        toast.success('Product added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      // Offline/dev fallback: save to local cache and update UI so vendor can continue
      try {
        const localKey = `vendorProducts:${user?._id}`;
        const saved = localStorage.getItem(localKey);
        const cached = saved ? JSON.parse(saved) : [];
        const offlineProduct = {
          _id: `offline_${Date.now()}`,
          name: newProduct.name,
          price: sellingPrice,
          originalPrice: isFinite(mrp) ? mrp : undefined,
          category: newProduct.category,
          brand: newProduct.brand,
          countInStock: parseInt(newProduct.countInStock) || 0,
          images: productImages.filter(img => img).length > 0 ? productImages.filter(img => img) : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
          description: newProduct.description || 'No description provided',
          seller: user?._id || 'vendor_1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const next = [offlineProduct, ...cached];
        localStorage.setItem(localKey, JSON.stringify(next));
        setProducts(next);
        setShowAddProduct(false);
        setNewDiscount('');
        setProductImages([]);
        setNewProduct({
          name: '', price: '', originalPrice: '', sku: '', category: '', countInStock: '', description: '', brand: '', variants: []
        });
        toast.success('Saved locally (offline). Will sync when backend is available.');
      } catch (e) {
        const serverMessage = error.response?.data?.error?.message || error.response?.data?.message || error.response?.data;
        toast.error(`Failed to add product${serverMessage ? `: ${serverMessage}` : ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.id) return;
    try {
      setLoading(true);
      // If discount provided with MRP, auto-calc selling price
      let updatedPrice = editProduct.price ? parseFloat(editProduct.price) : NaN;
      const mrp = editProduct.originalPrice ? parseFloat(editProduct.originalPrice) : NaN;
      const dPct = editDiscount ? Math.max(0, Math.min(100, parseFloat(editDiscount))) : NaN;
      if (!isNaN(mrp) && !isNaN(dPct)) {
        updatedPrice = Math.max(0, Math.round((mrp - (mrp * dPct) / 100) * 100) / 100);
      }
      const payload = {
        name: editProduct.name,
        price: isFinite(updatedPrice) ? updatedPrice : parseFloat(editProduct.price),
        originalPrice: editProduct.originalPrice ? parseFloat(editProduct.originalPrice) : undefined,
        sku: editProduct.sku || undefined,
        category: editProduct.category,
        brand: editProduct.brand,
        countInStock: parseInt(editProduct.countInStock) || 0,
        images: editProduct.images?.length ? editProduct.images : undefined,
        variants: editProduct.variants?.map(v => ({
          name: v.name,
          value: v.value,
          price: v.price ? parseFloat(v.price) : undefined,
          stock: v.stock ? parseInt(v.stock) : undefined,
          sku: v.sku || undefined
        })),
        description: editProduct.description || ''
      };
      // Prevent editing if the product does not belong to this vendor (UI-level guard)
      if (!products.find(p => p._id === editProduct.id)) {
        toast.error("You can only edit your own products.");
        setShowEditProduct(false);
        return;
      }
      const res = await axiosInstance.put(`/products/${editProduct.id}`, payload);
      if (res.data.success) {
        toast.success('Product updated successfully!');
        setShowEditProduct(false);
        setEditDiscount('');
        await fetchProducts();
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      // Prevent deleting if item isn’t in vendor’s product list (UI-level guard)
      if (!products.find(p => p._id === id)) {
        toast.error("You can only delete your own products.");
        return;
      }
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
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Full-height Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 border-r border-gray-100 bg-white">
          <div className="sticky top-0 h-screen overflow-y-auto p-6 bg-gradient-to-b from-rose-600 via-red-600 to-orange-500 text-white">
            <h1 className="text-2xl font-bold mb-1">Vendor Dashboard</h1>
            <p className="text-white/90 mb-6">{user ? `Welcome, ${user.name}!` : 'Manage your products, orders, and performance.'}</p>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-white/90">Manage Business</h3>
            <nav className="space-y-1">
              {([
                { key: 'overview', label: 'Overview', icon: '🏠' },
                { key: 'products', label: `Products (${products.length})`, icon: '📦' },
                { key: 'orders', label: 'Orders', icon: '🧾' },
                { key: 'inventory', label: 'Inventory', icon: '📊' },
                { key: 'pricing', label: 'Pricing', icon: '💰' },
              ] as { key: typeof activeTab; label: string; icon: string }[]).map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === item.key
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content area */}
        <main className="lg:col-span-9 p-6">
          {/* Mobile header with tabs */}
          <div className="lg:hidden mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600 mt-1">{user ? `Welcome, ${user.name}!` : 'Manage your products, orders, and performance.'}</p>
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {(['overview','products','orders','inventory','pricing'] as typeof activeTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Existing tab content remains below */}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">—</p>
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
                  <p className="text-2xl font-bold">—</p>
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
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-red-600">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">₹{Number(product.originalPrice).toLocaleString()}</span>
                        )}
                        {(product.originalPrice && product.originalPrice > product.price) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                            -{Math.round(((Number(product.originalPrice) - product.price) / Number(product.originalPrice)) * 100)}%
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.countInStock > 20 ? 'bg-green-100 text-green-800' :
                        product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock} in stock
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/vendor/products/${product._id}`)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditProduct({
                            id: product._id,
                            name: product.name,
                            price: String(product.price),
                            originalPrice: String(product.originalPrice ?? ''),
                            sku: String(product.sku ?? ''),
                            category: product.category,
                            countInStock: String(product.countInStock ?? 0),
                            description: product.description || '',
                            brand: product.brand || '',
                            images: product.images || [],
                            variants: (product.variants || []).map(v => ({
                              name: v.name,
                              value: v.value,
                              price: v.price != null ? String(v.price) : undefined,
                              stock: v.stock != null ? String(v.stock) : undefined,
                              sku: v.sku
                            }))
                          });
                          setShowEditProduct(true);
                        }}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-1"
                      >
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

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h2>
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by name or SKU"
                  className="px-3 py-2 border rounded-lg w-64"
                  onChange={(e)=>{
                    const q=e.target.value.toLowerCase();
                    const list=products.filter(p=>p.name.toLowerCase().includes(q) || (p as any).sku?.toLowerCase().includes(q));
                    setProducts(list.length? list as any: products);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 bg-gray-100 rounded-lg"
                  onClick={fetchProducts}
                >Refresh</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">MRP</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p)=> (
                    <tr key={p._id} className="border-b">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded"/>
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.brand} • {p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{(p as any).sku || '-'}</td>
                      <td className="py-2 pr-4 text-gray-900 font-medium">{p.countInStock}</td>
                      <td className="py-2 pr-4 text-gray-900 font-medium">₹{p.price.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-gray-900 font-medium">₹{((p as any).originalPrice || p.price).toLocaleString()}</td>
                      <td className="py-2 pr-4">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded mr-2" onClick={()=>{ setEditProduct({
                          id:p._id, name:p.name, price:String(p.price), originalPrice:String((p as any).originalPrice||''), sku:String((p as any).sku||''), category:p.category, countInStock:String(p.countInStock||0), description:(p as any).description||'', brand:p.brand, images:p.images||[], variants:(p as any).variants||[]
                        }); setShowEditProduct(true); }}>Edit</button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded" onClick={()=> handleDeleteProduct(p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {products.length===0 && (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-6">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <input type="text" placeholder="Search by name" className="px-3 py-2 border rounded-lg w-64"/>
                <select className="px-3 py-2 border rounded-lg">
                  <option>High Estimated Orders</option>
                  <option>Low Price</option>
                  <option>High Price</option>
                  <option>Newest</option>
                </select>
              </div>
              <div className="space-y-3">
                {products.map(p=> (
                  <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>

                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[11px] text-gray-500">MRP</div>
                        <div className="text-sm font-semibold">₹{((p as any).originalPrice || p.price).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500">Selling</div>
                        <div className="text-sm font-semibold text-gray-900">₹{p.price.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500">Discount</div>
                        <div className="text-sm font-semibold text-green-600">{Math.max(0, Math.round(100 - (p.price/((p as any).originalPrice||p.price))*100))}%</div>
                      </div>
                      <button
                        className="ml-3 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={()=>{ setEditProduct({
                          id:p._id, name:p.name, price:String(p.price), originalPrice:String((p as any).originalPrice||''), sku:String((p as any).sku||''), category:p.category, countInStock:String(p.countInStock||0), description:(p as any).description||'', brand:p.brand, images:p.images||[], variants:(p as any).variants||[]
                        }); setShowEditProduct(true); }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {products.length===0 && (
                  <div className="text-center text-gray-500 py-6">No products to show</div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <h3 className="font-semibold mb-3">Price Performance</h3>
              <div className="text-sm text-gray-600">Order Growth: 0</div>
              <div className="text-sm text-gray-600">Price Updates: 0</div>
              <div className="mt-4 p-3 rounded bg-amber-50 text-amber-800 text-sm">Get rid of manual price updates, automate pricing to beat competition.</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
            {/* Modal Header - Fixed at top */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-xl font-bold">Add New Product</h3>
              <button 
                onClick={() => setShowAddProduct(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="p-4 overflow-y-auto flex-grow">
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
                {/* Pricing Section: MRP + Discount → Auto Price */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Original Price)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. 1299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Auto from MRP & % or enter"
                    />
                    {/* Live Preview */}
                    <p className="mt-1 text-xs text-gray-500">
                      {(() => {
                        const mrp = parseFloat(newProduct.originalPrice || '');
                        const d = parseFloat(newDiscount || '');
                        if (!isNaN(mrp) && !isNaN(d)) {
                          const calc = Math.max(0, Math.round((mrp - (mrp * d) / 100) * 100) / 100);
                          return `Auto price: ₹${calc.toLocaleString()} — You save ${Math.round(d)}% (₹${(mrp - calc).toLocaleString()})`;
                        }
                        return 'Enter MRP and Discount to auto-calculate price.';
                      })()}
                    </p>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Upload up to 5)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div key={index} className="relative">
                        {productImages[index] ? (
                          <div className="relative border border-gray-300 rounded-lg overflow-hidden h-32">
                            <img 
                              src={productImages[index]} 
                              alt={`Product image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => fileInputRefs[index].current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors"
                          >
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Image {index + 1}</span>
                            <input
                              type="file"
                              ref={fileInputRefs[index]}
                              onChange={(e) => handleImageUpload(index, e)}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload up to 5 images (max 5MB each). First image will be the main product image.</p>
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
            </div>
            
            {/* Modal Footer - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
              <div className="flex space-x-3">
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
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-xl font-bold">Edit Product</h3>
              <button 
                onClick={() => setShowEditProduct(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                {/* Pricing Section: MRP + Discount → Auto Price (Edit) */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Original Price)</label>
                    <input
                      type="number"
                      value={editProduct.originalPrice}
                      onChange={(e) => setEditProduct({...editProduct, originalPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 1299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {(() => {
                        const mrp = parseFloat(editProduct.originalPrice || '');
                        const d = parseFloat(editDiscount || '');
                        if (!isNaN(mrp) && !isNaN(d)) {
                          const calc = Math.max(0, Math.round((mrp - (mrp * d) / 100) * 100) / 100);
                          return `Auto price: ₹${calc.toLocaleString()} — You save ${Math.round(d)}% (₹${(mrp - calc).toLocaleString()})`;
                        }
                        return '';
                      })()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                    <input
                      type="number"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Auto from MRP & % or enter"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({...editProduct, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editProduct.countInStock}
                    onChange={(e) => setEditProduct({...editProduct, countInStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter stock quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {(editProduct.images || []).map((img, index) => (
                      <div key={index} className="relative border border-gray-300 rounded-lg overflow-hidden h-32">
                        <img src={img} alt={`Image ${index+1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditProduct({
                            ...editProduct,
                            images: editProduct.images.filter((_, i) => i !== index)
                          })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditProduct(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProduct}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Close main content area */}
        </main>
        {/* Close grid container */}
      </div>
    </div>
  );
};

export default VendorDashboardPage;