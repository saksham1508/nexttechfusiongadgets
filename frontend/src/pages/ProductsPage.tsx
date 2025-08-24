import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { Filter, Grid, List, ShoppingBag } from '../components/Icons';
import axiosInstance from '../utils/axiosConfig';
import toast from 'react-hot-toast';

interface ProductImage {
  url: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  numReviews: number;
  countInStock: number;
  brand: string;
  seller: string;
  isActive: boolean;
  specifications?: Record<string, string>;
  features?: string[];
}

const ProductsPage: React.FC = () => {
  const [urlSearchParams, setUrlSearchParams] = useState<URLSearchParams>(new URLSearchParams(window.location.search));

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pages, setPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    keyword: urlSearchParams.get('search') || '',
    category: urlSearchParams.get('category') || '',
    minPrice: urlSearchParams.get('minPrice') || '',
    maxPrice: urlSearchParams.get('maxPrice') || '',
    pageNumber: parseInt(urlSearchParams.get('page') || '1'),
  });

  // Fallback: local dummy products shown if API fails or returns empty
  const allMockProducts: Product[] = [
    {
      _id: 'mock-1',
      name: 'NexPhone X1',
      description: 'Powerful smartphone with edge-to-edge display',
      price: 49999,
      originalPrice: 54999,
      category: 'smartphones',
      images: ['/Icon.png'],
      rating: 4.5,
      numReviews: 128,
      countInStock: 25,
      brand: 'NexTech',
      seller: 'vendor_1',
      isActive: true,
    },
    {
      _id: 'mock-2',
      name: 'UltraBook Pro 14',
      description: 'Lightweight laptop with long battery life',
      price: 89999,
      originalPrice: 99999,
      category: 'laptops',
      images: ['/Icon.png'],
      rating: 4.7,
      numReviews: 85,
      countInStock: 14,
      brand: 'NexTech',
      seller: 'vendor_1',
      isActive: true,
    },
    {
      _id: 'mock-3',
      name: 'AudioWave Buds',
      description: 'True wireless earbuds with ANC',
      price: 6999,
      originalPrice: 7999,
      category: 'audio',
      images: ['/Icon.png'],
      rating: 4.2,
      numReviews: 342,
      countInStock: 80,
      brand: 'AudioWave',
      seller: 'vendor_2',
      isActive: true,
    },
    {
      _id: 'mock-4',
      name: 'GameBox One',
      description: 'Next-gen gaming console with 4K HDR',
      price: 49999,
      originalPrice: 54999,
      category: 'gaming',
      images: ['/Icon.png'],
      rating: 4.6,
      numReviews: 210,
      countInStock: 10,
      brand: 'GameBox',
      seller: 'vendor_3',
      isActive: true,
    },
    {
      _id: 'mock-5',
      name: 'Tab Plus 11',
      description: 'Sleek tablet for entertainment and productivity',
      price: 29999,
      originalPrice: 34999,
      category: 'tablets',
      images: ['/Icon.png'],
      rating: 4.1,
      numReviews: 64,
      countInStock: 33,
      brand: 'NexTech',
      seller: 'vendor_4',
      isActive: true,
    },
    {
      _id: 'mock-6',
      name: 'FitBand 3',
      description: 'Smart wearable with health monitoring',
      price: 4999,
      originalPrice: 5999,
      category: 'wearables',
      images: ['/Icon.png'],
      rating: 4.0,
      numReviews: 420,
      countInStock: 120,
      brand: 'Healthify',
      seller: 'vendor_2',
      isActive: true,
    },
    {
      _id: 'mock-7',
      name: 'ProHeadset 7.1',
      description: 'Surround sound gaming headset',
      price: 8999,
      originalPrice: 10999,
      category: 'audio',
      images: ['/Icon.png'],
      rating: 4.3,
      numReviews: 97,
      countInStock: 45,
      brand: 'ProAudio',
      seller: 'vendor_3',
      isActive: true,
    },
    {
      _id: 'mock-8',
      name: 'NexCharger 65W',
      description: 'Fast charger for laptops and phones',
      price: 2999,
      originalPrice: 3499,
      category: 'accessories',
      images: ['/Icon.png'],
      rating: 4.4,
      numReviews: 56,
      countInStock: 200,
      brand: 'NexTech',
      seller: 'vendor_1',
      isActive: true,
    },
    {
      _id: 'mock-9',
      name: '4K Action Cam',
      description: 'Rugged action camera with stabilization',
      price: 24999,
      originalPrice: 27999,
      category: 'accessories',
      images: ['/Icon.png'],
      rating: 4.1,
      numReviews: 34,
      countInStock: 18,
      brand: 'ActionPro',
      seller: 'vendor_4',
      isActive: true,
    },
    {
      _id: 'mock-10',
      name: 'NexPhone X1 Case',
      description: 'Protective case with sleek design',
      price: 999,
      originalPrice: 1299,
      category: 'accessories',
      images: ['/Icon.png'],
      rating: 4.5,
      numReviews: 18,
      countInStock: 300,
      brand: 'NexTech',
      seller: 'vendor_1',
      isActive: true,
    },
    {
      _id: 'mock-11',
      name: 'Studio Mic USB',
      description: 'USB condenser microphone for creators',
      price: 12999,
      originalPrice: 14999,
      category: 'accessories',
      images: ['/Icon.png'],
      rating: 4.6,
      numReviews: 75,
      countInStock: 22,
      brand: 'SoundLab',
      seller: 'vendor_5',
      isActive: true,
    },
    {
      _id: 'mock-12',
      name: 'Gaming Mouse RGB',
      description: 'High precision gaming mouse with RGB',
      price: 3499,
      originalPrice: 3999,
      category: 'gaming',
      images: ['/Icon.png'],
      rating: 4.3,
      numReviews: 142,
      countInStock: 90,
      brand: 'GamePro',
      seller: 'vendor_3',
      isActive: true,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.category) params.set('category', filters.category);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        params.set('page', String(filters.pageNumber));
        params.set('limit', '12');

        const res = await axiosInstance.get(`/products?${params.toString()}`);
        // Backend returns { success, data: { products, pagination } } in fallback and real modes
        let apiProducts = res.data.data?.products || res.data.products || [];
        let pagination = res.data.data?.pagination || res.data.pagination || { currentPage: 1, totalPages: 1, totalProducts: apiProducts.length };

        // If API returned empty, use local mock products as graceful fallback
        if ((!apiProducts || apiProducts.length === 0) && allMockProducts.length > 0) {
          apiProducts = allMockProducts;
          pagination = { currentPage: 1, totalPages: 1, totalProducts: allMockProducts.length };
        }

        // Normalize to local type if needed
        const normalized: Product[] = apiProducts.map((p: any) => ({
          _id: p._id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          originalPrice: p.originalPrice,
          category: typeof p.category === 'object' ? (p.category?.name || p.category?._id || 'General') : (p.category || 'General'),
          // Force placeholder image for products list
          images: ['/Icon.png'],
          rating: p.rating || 0,
          numReviews: p.numReviews || 0,
          countInStock: p.countInStock ?? p.stockQuantity ?? 0,
          brand: p.brand || 'Unknown',
          seller: typeof p.seller === 'object' ? p.seller?._id : p.seller,
          isActive: p.isActive !== false,
          specifications: p.specifications || {},
          features: p.features || [],
        }));

        setProducts(normalized);
        setTotal(pagination.totalProducts || normalized.length);
        setPages(pagination.totalPages || 1);
        setPage(pagination.currentPage || 1);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // On network/API error, fallback to mock products
        if (allMockProducts.length > 0) {
          setProducts(allMockProducts);
          setTotal(allMockProducts.length);
          setPages(1);
          setPage(1);
          toast('Showing demo products (API unavailable)', { icon: '🧪' });
        } else {
          toast.error('Failed to load products');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 400);
    return () => clearTimeout(debounce);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, pageNumber: 1 };
    setFilters(newFilters);

    const newParams = new URLSearchParams(urlSearchParams.toString());
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        newParams.set(k, v.toString());
      } else {
        newParams.delete(k);
      }
    });
    setUrlSearchParams(newParams);
  };

  const handlePageChange = (pageNumber: number) => {
    handleFilterChange('pageNumber', pageNumber.toString());
  };

  const categories = [
    'smartphones',
    'laptops',
    'tablets',
    'audio',
    'wearables',
    'gaming',
    'accessories'
  ];

  // Track selected for comparison (in compareSelectMode)
  const [selectedForCompare, setSelectedForCompare] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // If in selection mode, prefill selected from comparePending
    try {
      if (localStorage.getItem('compareSelectMode') === '1') {
        const existing = JSON.parse(localStorage.getItem('comparePending') || '[]');
        const seeded: Record<string, boolean> = {};
        existing.forEach((p: any) => (seeded[p._id] = true));
        setSelectedForCompare(seeded);
      }
    } catch {}
  }, []);

  const inSelectMode = (() => {
    try { return localStorage.getItem('compareSelectMode') === '1'; } catch { return false; }
  })();

  const toggleSelect = (p: Product) => {
    if (!inSelectMode) return;
    setSelectedForCompare((prev) => {
      const next = { ...prev, [p._id]: !prev[p._id] };
      try {
        // sync to comparePending
        const existing = JSON.parse(localStorage.getItem('comparePending') || '[]');
        let list: any[] = Array.isArray(existing) ? existing : [];
        const normalized = {
          ...p,
          description: p.description || 'No description provided',
          images: Array.isArray(p.images)
            ? p.images.map((img, i) => ({ url: typeof img === 'string' ? img : (img as any)?.url || '', alt: p.name, isPrimary: i === 0 }))
            : [{ url: '/placeholder-image.jpg', alt: p.name, isPrimary: true }],
          stockQuantity: p.countInStock ?? 0,
          inStock: (p.countInStock ?? 0) > 0,
          specifications: (p as any).specifications || {},
          features: (p as any).features || [],
          reviews: [],
          tags: [],
          lowStockThreshold: 5,
          deliveryInfo: { estimatedTime: '2-3 days', freeDelivery: true, deliveryCharge: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: p.isActive,
          isFeatured: false,
        };
        if (next[p._id]) {
          if (!list.find((x: any) => x._id === p._id)) list.push(normalized);
        } else {
          list = list.filter((x: any) => x._id !== p._id);
        }
        localStorage.setItem('comparePending', JSON.stringify(list));
      } catch {}
      return next;
    });
  };

  const finalizeSelection = () => {
    try {
      localStorage.setItem('compareReopen', '1');
      localStorage.removeItem('compareSelectMode');
    } catch {}
    // Use client-side navigation to avoid full page reload
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Our Products</h1>
        <div className="flex items-center space-x-4">
          {inSelectMode && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Select products to compare
              </span>
              <button
                type="button"
                onClick={finalizeSelection}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          )}
          <button
           type="button" // Added type="button"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
          <button
           type="button" // Added type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'} transition-all duration-300 ease-in-out`}>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Filter Products</h3>

            <div className="mb-6">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                Search Keyword
              </label>
              <input
                type="text"
                id="keyword"
                placeholder="e.g., laptop, headphones"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-700 text-lg">
                  Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{total}</span> products
                </p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md border border-gray-200">
                  <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">No Products Found</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={() => setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', pageNumber: 1 })}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="relative" onClick={() => toggleSelect(product)}>
                      {/* selection overlay */}
                      {inSelectMode && (
                        <div className="absolute top-2 left-2 z-20">
                          <input
                            type="checkbox"
                            checked={!!selectedForCompare[product._id]}
                            onChange={() => toggleSelect(product)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 accent-indigo-600 cursor-pointer"
                            aria-label="Select for comparison"
                          />
                        </div>
                      )}
                      <ProductCard
                        product={product as any}
                        onAddToComparison={(p: any) => {
                          try {
                            const existing = localStorage.getItem('comparePending');
                            const list = existing ? JSON.parse(existing) : [];
                            if (!list.find((x: any) => x._id === p._id)) list.push(p);
                            localStorage.setItem('comparePending', JSON.stringify(list));
                            if (!inSelectMode) {
                              // immediate compare via modal when not in selection mode
                              localStorage.setItem('compareReopen', '1');
                              window.location.href = '/';
                            } else {
                              // toggle selected in selection mode
                              toggleSelect(product);
                            }
                          } catch {}
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}


              {pages > 1 && (
                <div className="flex justify-center mt-10">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                     type="button" // Added type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L9.56 10l3.21 3.71a.75.75 0 11-1.08 1.04l-3.75-4.33a.75.75 0 010-1.04l3.75-4.33a.75.75 0 011.08 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {[...Array(pages)].map((_, i) => (
                      <button
                       type="button" // Added type="button"
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          page === i + 1
                            ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                     type="button" // Added type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === pages ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L10.44 10 7.21 6.29a.75.75 0 111.08-1.04l3.75 4.33a.75.75 0 010 1.04l-3.75 4.33a.75.75 0 01-1.08 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
