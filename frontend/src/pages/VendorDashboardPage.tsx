import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, CheckCircle2, Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosConfig';
import { PaymentProvider } from '../types';
import vendorService from '../services/vendorService';
import vendorOrdersService, { VendorOrder } from '../services/vendorOrdersService';

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
                  <div className="flex items-center gap-2">
                    <span className="text-red-900 font-semibold">Large customer base</span>
                    <span className="text-[10px] uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-full">Important</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-900 font-semibold">Easy product management</span>
                    <span className="text-[10px] uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-full">Important</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-900 font-semibold">Secure payments</span>
                    <span className="text-[10px] uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-full">Important</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-900 font-semibold">24/7 support</span>
                    <span className="text-[10px] uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-full">Important</span>
                  </div>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'products' | 'orders' | 'inventory' | 'pricing'>('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const BusinessDashboardLazy = React.useMemo(() => React.lazy(() => import('../components/VendorBusinessDashboard')) as any, []);

  // Vendor overview dynamic data
  const [vendorTotals, setVendorTotals] = useState({ totalOrders: 0, fulfillmentRate: 0, revenue30d: 0 });
  const [recentVendorOrders, setRecentVendorOrders] = useState<VendorOrder[]>([]);

  // Refresh analytics when switching to Business tab or when product list changes
  useEffect(() => {
    if (activeTab === 'business') {
      setAnalyticsRefreshKey(k => k + 1);
    }
  }, [activeTab, products.length]);

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
  // High-value payment acceptance state (used when price >= 30k)
  const [highValuePaymentAcceptance, setHighValuePaymentAcceptance] = useState<{ acceptAll: boolean; highValueThreshold: number; acceptedMethodsAboveThreshold: PaymentProvider[] }>(() => {
    const saved = localStorage.getItem('vendorPaymentAcceptance');
    return saved ? JSON.parse(saved) : { acceptAll: false, highValueThreshold: 30000, acceptedMethodsAboveThreshold: ['upi','cod','stripe'] };
  });
  useEffect(() => {
    localStorage.setItem('vendorPaymentAcceptance', JSON.stringify(highValuePaymentAcceptance));
  }, [highValuePaymentAcceptance]);
  // New: capture discount percentage for MRP-based pricing
  const [newDiscount, setNewDiscount] = useState<string>('');
  // Detailed description fields
  const [newHighlights, setNewHighlights] = useState<string>('');
  const [newSellerInfo, setNewSellerInfo] = useState<string>(user?.name || '');
  const [newSpecs, setNewSpecs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [newDetails, setNewDetails] = useState<string>('');
  // Sales channels selection
  const [channelQuick, setChannelQuick] = useState<boolean>(false);
  const [channelEcommerce, setChannelEcommerce] = useState<boolean>(false);
  
  // Guards to prevent repeated toasts and infinite sync loops
  const isSyncingRef = useRef(false);
  const offlineToastShownRef = useRef(false);
  const lastSyncAtRef = useRef<number>(0);

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
  // Edit: sales channels selection
  const [editChannelQuick, setEditChannelQuick] = useState<boolean>(false);
  const [editChannelEcommerce, setEditChannelEcommerce] = useState<boolean>(false);

  // Fetch vendor's products on component mount.
  // IMPORTANT: Do not seed mock vendor tokens here; it forces mock analytics on the backend.
  // If you need mock mode, set REACT_APP_USE_MOCK_VENDOR=true in .env and handle it elsewhere explicitly.
  useEffect(() => {
    if (user && user.role === 'seller') {
      try {
        // Persist user so API clients can extract role/token if needed
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch {}
      fetchProducts();
      fetchVendorOverview();
    }
  }, [user]);

  const syncOfflineProducts = async () => {
    if (isSyncingRef.current) return; // prevent concurrent syncs
    // debounce: avoid syncing too often
    const now = Date.now();
    if (now - lastSyncAtRef.current < 5000) return;
    isSyncingRef.current = true;
    try {
      const localKey = `vendorProducts:${user?._id}`;
      const saved = localStorage.getItem(localKey);
      if (!saved) return;
      const cached: any[] = JSON.parse(saved);
      const offlineItems = cached.filter(p => String(p._id).startsWith('offline_'));
      if (offlineItems.length === 0) return;
      toast.loading(`Syncing ${offlineItems.length} offline product(s)...`, { id: 'sync-offline' });
      for (const p of offlineItems) {
        try {
          const payload = {
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            sku: p.sku,
            category: p.category,
            brand: p.brand,
            countInStock: p.countInStock ?? 0,
            images: Array.isArray(p.images) && p.images.length ? p.images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
            variants: Array.isArray(p.variants) ? p.variants : [],
            description: p.description || 'No description provided',
          };
          const res = await axiosInstance.post('/products', payload);
          if (res.data?.success && res.data.data?.product) {
            // Replace offline item with server product
            const next = cached
              .filter(x => x._id !== p._id)
              .concat(res.data.data.product);
            localStorage.setItem(localKey, JSON.stringify(next));
          }
        } catch (e: any) {
          console.warn('Failed to sync offline product', p?._id, e?.message || e);
        }
      }
      toast.success('Offline products synced', { id: 'sync-offline' });
    } catch {} finally {
      isSyncingRef.current = false;
      lastSyncAtRef.current = Date.now();
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products?seller=${user?._id}`);
      // Normalize API shapes from both full server (data.products) and simple server (products)
      const list =
        (response.data && response.data.data && Array.isArray(response.data.data.products)
          ? response.data.data.products
          : null) ||
        (response.data && Array.isArray(response.data.products)
          ? response.data.products
          : []) as any[];
      // Guard: only keep products that belong to this vendor (defense in depth)
      const vendorProducts = list.filter((p: any) => {
        const sellerId = (p.seller?._id || p.seller || '').toString();
        const uid = (user?._id || '').toString();
        return sellerId && uid && sellerId === uid;
      });

      // If API returns empty (e.g., simple server without seller match), fall back to cached vendor list
      if (vendorProducts.length === 0) {
        try {
          const localKey = `vendorProducts:${user?._id}`;
          const saved = localStorage.getItem(localKey);
          if (saved) {
            const cached = JSON.parse(saved);
            setProducts(cached);
            // Background sync once without recursive fetch
            syncOfflineProducts();
            return;
          }
        } catch {}
      }

      setProducts(vendorProducts);
      try {
        const localKey = `vendorProducts:${user?._id}`;
        localStorage.setItem(localKey, JSON.stringify(vendorProducts));
        // After saving latest from API, try to sync any remaining offline items once
        syncOfflineProducts();
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
          if (!offlineToastShownRef.current) {
            toast.success('Loaded offline vendor products', { id: 'vendor-offline-loaded' });
            offlineToastShownRef.current = true;
          }
          // Background sync once; do not recursively fetch
          syncOfflineProducts();
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

  // Pull vendor analytics + orders to power Overview tiles and Recent Orders
  const fetchVendorOverview = async () => {
    try {
      // 1) Analytics summary
      const analytics = await vendorService.getAnalytics();
      const totalOrdersFromAnalytics = analytics?.data?.summary?.totalOrders || 0;
      const revenue30d = analytics?.data?.summary?.totalSales || 0; // using totalSales as 30d until historical is added

      // 2) Recent vendor orders (limit 5)
      const ordersRes = await vendorOrdersService.list({ page: 1, limit: 5 });
      const recent = Array.isArray(ordersRes.orders) ? ordersRes.orders.slice(0, 5) : [];

      // Compute fulfillment rate based on item-level vendorStatus
      const allItems = recent.flatMap(o => o.orderItems || []);
      const delivered = allItems.filter(i => i.vendorStatus === 'delivered').length;
      const fulfillmentRate = allItems.length ? Math.round((delivered / allItems.length) * 100) : 0;

      setVendorTotals({
        totalOrders: totalOrdersFromAnalytics,
        fulfillmentRate,
        revenue30d,
      });
      setRecentVendorOrders(recent);
    } catch (e) {
      console.warn('fetchVendorOverview failed', e);
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
      if (process.env.NODE_ENV !== 'production' && !token && user && user.role === 'seller') {
        const fallbackToken = `mock_vendor_token_${user._id || 'vendor_1'}`;
        localStorage.setItem('token', fallbackToken);
        console.log('🔧 Added fallback vendor token before product create (dev only)');
      }
      const selectedChannels: string[] = [];
      if (channelQuick) selectedChannels.push('quick-commerce');
      if (channelEcommerce) selectedChannels.push('e-commerce');
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
        description: newProduct.description || 'No description provided',
        // Store channels in tags for backend compatibility
        tags: selectedChannels
      } as any;

      // Attach vendor payment acceptance for high-value items
      const HIGH_VALUE = 30000;
      const acceptance = (sellingPrice >= HIGH_VALUE)
        ? highValuePaymentAcceptance
        : { acceptAll: true };
      // Build rich description and specifications
      const highlightsBlock = newHighlights
        ? `\n\nHighlights:\n- ${newHighlights.split('\n').filter(Boolean).join('\n- ')}`
        : '';
      const sellerBlock = newSellerInfo ? `\n\nSeller: ${newSellerInfo}` : '';
      const detailsBlock = newDetails ? `\n\nProduct Details:\n${newDetails}` : '';
      const composedDescription = `${productData.description || ''}${highlightsBlock}${sellerBlock}${detailsBlock}`.trim();
      const specsMap: Record<string,string> = {};
      (newSpecs || []).forEach(row => {
        const k = (row.key || '').trim();
        const v = (row.value || '').trim();
        if (k && v) specsMap[k] = v;
      });
      const response = await axiosInstance.post('/products', { 
        ...productData, 
        description: composedDescription,
        specifications: Object.keys(specsMap).length ? specsMap : undefined,
        paymentAcceptance: acceptance 
      });
      
      if (response.data.success) {
        await fetchProducts(); // Refresh the products list
        setAnalyticsRefreshKey(k => k + 1); // refresh analytics view
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
        setNewHighlights('');
        setNewSellerInfo(user?.name || '');
        setNewSpecs([{ key: '', value: '' }]);
        setNewDetails('');
        setChannelQuick(false);
        setChannelEcommerce(false);
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
        const highlightsBlock = newHighlights
          ? `\n\nHighlights:\n- ${newHighlights.split('\n').filter(Boolean).join('\n- ')}`
          : '';
        const sellerBlock = newSellerInfo ? `\n\nSeller: ${newSellerInfo}` : '';
        const detailsBlock = newDetails ? `\n\nProduct Details:\n${newDetails}` : '';
        const composedOfflineDescription = `${newProduct.description || 'No description provided'}${highlightsBlock}${sellerBlock}${detailsBlock}`.trim();
        const specsMap: Record<string,string> = {};
        (newSpecs || []).forEach(row => { const k=(row.key||'').trim(); const v=(row.value||'').trim(); if(k && v) specsMap[k]=v; });
        const selectedChannels: string[] = [];
        if (channelQuick) selectedChannels.push('quick-commerce');
        if (channelEcommerce) selectedChannels.push('e-commerce');
        const offlineProduct = {
          _id: `offline_${Date.now()}`,
          name: newProduct.name,
          price: sellingPrice,
          originalPrice: isFinite(mrp) ? mrp : undefined,
          category: newProduct.category,
          brand: newProduct.brand,
          countInStock: parseInt(newProduct.countInStock) || 0,
          images: productImages.filter(img => img).length > 0 ? productImages.filter(img => img) : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'],
          description: composedOfflineDescription,
          specifications: Object.keys(specsMap).length ? specsMap : undefined,
          tags: selectedChannels,
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
        setNewHighlights('');
        setNewSellerInfo(user?.name || '');
        setNewSpecs([{ key: '', value: '' }]);
        setNewDetails('');
        setChannelQuick(false);
        setChannelEcommerce(false);
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
      const selectedChannelsEdit: string[] = [];
      if (editChannelQuick) selectedChannelsEdit.push('quick-commerce');
      if (editChannelEcommerce) selectedChannelsEdit.push('e-commerce');
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
        description: editProduct.description || '',
        tags: selectedChannelsEdit
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
          <div className="sticky top-0 h-screen overflow-y-auto p-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-gray-100">
            <h1 className="text-2xl font-bold mb-1">Vendor Dashboard</h1>
            <p className="text-white/90 mb-6">{user ? `Welcome, ${user.name}!` : 'Manage your products, orders, and performance.'}</p>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-white/90">Manage Business</h3>
            <nav className="space-y-1">
              {([
                { key: 'overview', label: 'Overview', icon: '🏠' },
                { key: 'business', label: 'Business', icon: '📈' },
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
                {(['overview','business','products','orders','inventory','pricing'] as typeof activeTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-gray-900 text-gray-900'
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

      {/* Business Tab */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Business Dashboard</h2>
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-2">Your order and sales insights</p>
            <div className="mt-4">
              {/* Inline dynamic import fallback for SSR safety */}
              <React.Suspense fallback={<div className="h-64 flex items-center justify-center text-gray-500">Loading analytics...</div>}>
                <BusinessDashboardLazy key={analyticsRefreshKey} />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-5">
            <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading orders...</div>}>
              {React.createElement(React.lazy(() => import('../components/VendorOrders')))}
            </React.Suspense>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{vendorTotals.totalOrders}</p>
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
                  <p className="text-2xl font-bold">{vendorTotals.fulfillmentRate}%</p>
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
                  <p className="text-2xl font-bold">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(vendorTotals.revenue30d))}</p>
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
                {recentVendorOrders.length === 0 && (
                  <div className="p-4 text-gray-500 bg-gray-50 rounded-lg text-center">No recent orders.</div>
                )}
                {recentVendorOrders.map(o => {
                  const first = o.orderItems?.[0];
                  const itemText = first ? `${first.product?.name || 'Item'} × ${first.quantity}` : `${o.orderItems?.length || 0} item(s)`;
                  const badge = o.status === 'delivered'
                    ? { cls: 'bg-green-100 text-green-800', text: 'Delivered' }
                    : o.status === 'processing'
                      ? { cls: 'bg-blue-100 text-blue-800', text: 'Processing' }
                      : o.status === 'shipped'
                        ? { cls: 'bg-purple-100 text-purple-800', text: 'Shipped' }
                        : o.status === 'out_for_delivery'
                          ? { cls: 'bg-amber-100 text-amber-800', text: 'Out for delivery' }
                          : { cls: 'bg-gray-100 text-gray-800', text: o.status.replace(/_/g,' ') };
                  return (
                    <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{o.orderNumber}</p>
                        <p className="text-sm text-gray-500">{itemText}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${badge.cls}`}>{badge.text}</span>
                    </div>
                  );
                })}
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
                            originalPrice: String((product as any).originalPrice ?? ''),
                            sku: String((product as any).sku ?? ''),
                            category: (product as any).category,
                            countInStock: String((product as any).countInStock ?? 0),
                            description: (product as any).description || '',
                            brand: (product as any).brand || '',
                            images: ((product as any).images || []).map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean),
                            variants: ((product as any).variants || []).map((v: any) => ({
                              name: v.name,
                              value: v.value,
                              price: v.price != null ? String(v.price) : undefined,
                              stock: v.stock != null ? String(v.stock) : undefined,
                              sku: v.sku
                            }))
                          });
                          // Initialize channel toggles from tags
                          try {
                            const rawTags = (product as any)?.tags ?? [];
                            const tags = Array.isArray(rawTags) ? rawTags.map((t: any) => String(t).toLowerCase()) : [];
                            setEditChannelQuick(tags.includes('quick-commerce'));
                            setEditChannelEcommerce(tags.includes('e-commerce'));
                          } catch {}
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
          <div className="bg-white rounded-xl w-full max-w-3xl mx-auto flex flex-col max-h-[90vh] overflow-hidden">
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
            <div className="p-4 overflow-y-auto overflow-x-hidden flex-grow">
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

                {/* High-value payment acceptance (threshold 30,000) */}
                {(() => {
                  const priceNum = parseFloat(newProduct.price || newProduct.originalPrice || '0');
                  const isHighValue = !isNaN(priceNum) && priceNum >= 30000;
                  if (!isHighValue) return null;
                  const allMethods: PaymentProvider[] = ['cod','upi','stripe','razorpay','paypal','googlepay','phonepe','paytm'];
                  const toggle = (m: PaymentProvider) => {
                    setHighValuePaymentAcceptance((prev) => {
                      const set = new Set(prev.acceptedMethodsAboveThreshold || []);
                      set.has(m) ? set.delete(m) : set.add(m);
                      return { ...prev, acceptAll: false, acceptedMethodsAboveThreshold: Array.from(set) };
                    });
                  };
                  return (
                    <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
                      <div className="font-medium text-amber-900 mb-2">Select accepted payment modes for high-value items (≥ ₹30,000)</div>
                      <div className="grid grid-cols-2 gap-2">
                        {allMethods.map((m) => (
                          <label key={m} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={(highValuePaymentAcceptance.acceptedMethodsAboveThreshold || []).includes(m)}
                              onChange={() => toggle(m)}
                            />
                            <span className="capitalize">{m}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-amber-800 mt-2">These modes will be enforced at checkout for buyers of this product.</p>
                    </div>
                  );
                })()}
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
                          const platformFee = Math.round(calc * 0.05 * 100) / 100;
                          const netToYou = Math.max(0, Math.round((calc - platformFee) * 100) / 100);
                          return `Auto price: ₹${calc.toLocaleString()} — Platform fee (5%): ₹${platformFee.toLocaleString()} — You receive: ₹${netToYou.toLocaleString()} — You save ${Math.round(d)}% (₹${(mrp - calc).toLocaleString()})`;
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
                  <textarea
                    value={newHighlights}
                    onChange={(e) => setNewHighlights(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Key features, bullet points (one per line)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                  <input
                    type="text"
                    value={newSellerInfo}
                    onChange={(e) => setNewSellerInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Seller or brand info"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                  <div className="space-y-2">
                    {newSpecs.map((row, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-start">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e)=>{
                            const next=[...newSpecs]; next[idx] = { ...next[idx], key: e.target.value }; setNewSpecs(next);
                          }}
                          className="min-w-[160px] flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Key (e.g., RAM)"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e)=>{
                            const next=[...newSpecs]; next[idx] = { ...next[idx], value: e.target.value }; setNewSpecs(next);
                          }}
                          className="min-w-[200px] flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Value (e.g., 8GB)"
                        />
                        <button type="button" className="shrink-0 px-3 py-2 bg-gray-100 rounded" onClick={()=>{
                          const next=[...newSpecs]; next.splice(idx,1); setNewSpecs(next.length?next:[{key:'',value:''}]);
                        }}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={()=> setNewSpecs([...newSpecs, { key: '', value: '' }])}>+ Add Spec</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Details</label>
                  <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Detailed description, materials, care, package contents, etc."
                    rows={4}
                  />
                </div>

                {/* Sales Channels */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-sm font-medium text-gray-800 mb-2">Sales Channels</div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="w-5 h-5 accent-red-600 scale-110" checked={channelQuick} onChange={(e)=> setChannelQuick(e.target.checked)} />
                      <span className="text-base">Quick Commerce</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="w-5 h-5 accent-red-600 scale-110" checked={channelEcommerce} onChange={(e)=> setChannelEcommerce(e.target.checked)} />
                      <span className="text-base">E-commerce</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Choose where this product should be available.</p>
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
                {/* Channels (Edit) */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Channels</label>
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="w-5 h-5 accent-red-600 scale-110" checked={editChannelQuick} onChange={(e)=> setEditChannelQuick(e.target.checked)} />
                      <span className="text-base">Quick Commerce</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="w-5 h-5 accent-red-600 scale-110" checked={editChannelEcommerce} onChange={(e)=> setEditChannelEcommerce(e.target.checked)} />
                      <span className="text-base">E-commerce</span>
                    </label>
                  </div>
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
                          const platformFee = Math.round(calc * 0.05 * 100) / 100;
                          const netToYou = Math.max(0, Math.round((calc - platformFee) * 100) / 100);
                          return `Auto price: ₹${calc.toLocaleString()} — Platform fee (5%): ₹${platformFee.toLocaleString()} — You receive: ₹${netToYou.toLocaleString()} — You save ${Math.round(d)}% (₹${(mrp - calc).toLocaleString()})`;
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