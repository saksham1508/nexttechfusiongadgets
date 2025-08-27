import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { Filter, Grid, List, ShoppingBag } from '../components/Icons';

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

  // Default fallback products if API fails (ensures UI still shows items)
  const allMockProducts: Product[] = [
    {
      _id: 'fp_1',
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with A17 Pro chip',
      price: 99999,
      originalPrice: 109999,
      category: 'smartphones',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],
      rating: 4.8,
      numReviews: 1250,
      countInStock: 25,
      brand: 'Apple',
      seller: 'vendor_1',
      isActive: true,
    },
    {
      _id: 'fp_2',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen',
      price: 899,
      originalPrice: 999,
      category: 'smartphones',
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
      rating: 4.7,
      numReviews: 980,
      countInStock: 18,
      brand: 'Samsung',
      seller: 'vendor_2',
      isActive: true,
    },
    {
      _id: 'fp_3',
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling headphones',
      price: 349,
      originalPrice: 399,
      category: 'audio',
      images: ['https://images.unsplash.com/photo-1518443895914-3c7b99bc3a3b?w=600'],
      rating: 4.8,
      numReviews: 1500,
      countInStock: 40,
      brand: 'Sony',
      seller: 'vendor_3',
      isActive: true,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    const pageSize = 12;

    // Client-side filtering over mock data only
    const filtered = allMockProducts.filter((p) => {
      const keyword = (filters.keyword || '').toLowerCase();
      const matchesKeyword =
        !keyword ||
        p.name.toLowerCase().includes(keyword) ||
        (p.description || '').toLowerCase().includes(keyword);
      const matchesCategory = !filters.category || p.category === filters.category;
      const price = Number(p.price) || 0;
      const minOk = !filters.minPrice || price >= Number(filters.minPrice);
      const maxOk = !filters.maxPrice || price <= Number(filters.maxPrice);
      return matchesKeyword && matchesCategory && minOk && maxOk;
    });

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(Math.max(1, filters.pageNumber || 1), totalPages);
    const start = (currentPage - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    setProducts(paged);
    setTotal(totalCount);
    setPages(totalPages);
    setPage(currentPage);
    setIsLoading(false);
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
