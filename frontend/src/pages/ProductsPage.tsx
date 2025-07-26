import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  images: { url: string; alt: string }[];
  rating: number;
  numReviews: number;
  stock: number;
  brand: string;
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

  const allMockProducts: Product[] = [
    { _id: 'prod1', name: 'Smartphone X', description: 'Latest model with advanced camera.', price: 799.99, category: 'smartphones', images: [{ url: 'https://placehold.co/400x300/1E40AF/FFFFFF?text=Smartphone+X', alt: 'Smartphone X' }], rating: 4.5, numReviews: 120, stock: 25, brand: 'TechCorp' },
    { _id: 'prod2', name: 'UltraBook Pro', description: 'Thin and powerful laptop for professionals.', price: 1299.00, category: 'laptops', images: [{ url: 'https://placehold.co/400x300/3B82F6/FFFFFF?text=UltraBook+Pro', alt: 'UltraBook Pro' }], rating: 4.8, numReviews: 85, stock: 15, brand: 'ProTech' },
    { _id: 'prod3', name: 'Tablet Air 5', description: 'Lightweight tablet with stunning display.', price: 499.50, category: 'tablets', images: [{ url: 'https://placehold.co/400x300/60A5FA/FFFFFF?text=Tablet+Air+5', alt: 'Tablet Air 5' }], rating: 4.2, numReviews: 200, stock: 30, brand: 'AirTech' },
    { _id: 'prod4', name: 'Noise Cancelling Headphones', description: 'Immersive audio experience.', price: 199.99, category: 'audio', images: [{ url: 'https://placehold.co/400x300/93C5FD/FFFFFF?text=Headphones', alt: 'Noise Cancelling Headphones' }], rating: 4.7, numReviews: 310, stock: 50, brand: 'AudioMax' },
    { _id: 'prod5', name: 'Smartwatch Sport', description: 'Track your fitness and stay connected.', price: 249.00, category: 'wearables', images: [{ url: 'https://placehold.co/400x300/BFDBFE/000000?text=Smartwatch+Sport', alt: 'Smartwatch Sport' }], rating: 4.1, numReviews: 150, stock: 40, brand: 'FitTech' },
    { _id: 'prod6', name: 'Gaming Console Z', description: 'Next-gen gaming with stunning graphics.', price: 499.00, category: 'gaming', images: [{ url: 'https://placehold.co/400x300/A78BFA/FFFFFF?text=Gaming+Console', alt: 'Gaming Console Z' }], rating: 4.9, numReviews: 450, stock: 10, brand: 'GameTech' },
    { _id: 'prod7', name: 'Wireless Keyboard', description: 'Ergonomic and responsive keyboard.', price: 75.00, category: 'accessories', images: [{ url: 'https://placehold.co/400x300/C4B5FD/FFFFFF?text=Wireless+Keyboard', alt: 'Wireless Keyboard' }], rating: 4.0, numReviews: 90, stock: 60, brand: 'KeyTech' },
    { _id: 'prod8', name: 'Portable Bluetooth Speaker', description: 'Powerful sound on the go.', price: 89.99, category: 'audio', images: [{ url: 'https://placehold.co/400x300/818CF8/FFFFFF?text=Bluetooth+Speaker', alt: 'Portable Bluetooth Speaker' }], rating: 4.3, numReviews: 180, stock: 35, brand: 'SoundWave' },
    { _id: 'prod9', name: 'Curved Gaming Monitor', description: 'Immersive visuals for gaming.', price: 349.00, category: 'gaming', images: [{ url: 'https://placehold.co/400x300/6366F1/FFFFFF?text=Gaming+Monitor', alt: 'Curved Gaming Monitor' }], rating: 4.6, numReviews: 220, stock: 20, brand: 'ViewTech' },
    { _id: 'prod10', name: 'External SSD 1TB', description: 'Fast and reliable external storage.', price: 120.00, category: 'accessories', images: [{ url: 'https://placehold.co/400x300/4F46E5/FFFFFF?text=External+SSD', alt: 'External SSD 1TB' }], rating: 4.4, numReviews: 100, stock: 45, brand: 'StoragePro' },
    { _id: 'prod11', name: 'Budget Smartphone', description: 'Affordable smartphone with good features.', price: 299.00, category: 'smartphones', images: [{ url: 'https://placehold.co/400x300/4338CA/FFFFFF?text=Budget+Phone', alt: 'Budget Smartphone' }], rating: 3.9, numReviews: 70, stock: 55, brand: 'ValueTech' },
    { _id: 'prod12', name: 'Convertible Laptop', description: 'Laptop that converts to a tablet.', price: 999.00, category: 'laptops', images: [{ url: 'https://placehold.co/400x300/3730A3/FFFFFF?text=Convertible+Laptop', alt: 'Convertible Laptop' }], rating: 4.5, numReviews: 110, stock: 18, brand: 'FlexTech' },
  ];

  useEffect(() => {
    setIsLoading(true);
    const applyFilters = () => {
      let filtered = [...allMockProducts];

      if (filters.keyword) {
        const lowerKeyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerKeyword) ||
            p.description.toLowerCase().includes(lowerKeyword)
        );
      }

      if (filters.category) {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filters.minPrice) {
        filtered = filtered.filter((p) => p.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((p) => p.price <= parseFloat(filters.maxPrice));
      }

      const productsPerPage = 6;
      const totalFiltered = filtered.length;
      const totalPages = Math.ceil(totalFiltered / productsPerPage);
      const currentPage = Math.max(1, Math.min(filters.pageNumber, totalPages || 1));

      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = filtered.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setTotal(totalFiltered);
      setPages(totalPages);
      setPage(currentPage);
      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      applyFilters();
    }, 800);

    return () => clearTimeout(timer);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Our Products</h1>
        <div className="flex items-center space-x-4">
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
                    <ProductCard key={product._id} product={product} />
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
