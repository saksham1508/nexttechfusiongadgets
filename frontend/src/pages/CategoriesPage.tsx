import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, List, Filter, SortAsc, ChevronRight } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchCategoryTree, fetchCategoryBySlug } from '../store/slices/categorySlice';
import { fetchProducts } from '../store/slices/productSlice';
import CategoryTree from '../components/CategoryTree';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Category, ProductFilters } from '../types';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { categoryTree, selectedCategory, loading: categoryLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { products, isLoading: productsLoading, page, pages, total } = useSelector(
    (state: RootState) => state.products
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'popularity',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  // Load category tree on mount
  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, categoryTree.length]);

  // Load category by slug
  useEffect(() => {
    if (slug) {
      dispatch(fetchCategoryBySlug(slug));
    }
  }, [dispatch, slug]);

  // Load products when category or filters change
  useEffect(() => {
    const productFilters: ProductFilters = {
      ...filters,
      category: selectedCategory?._id
    };
    
    dispatch(fetchProducts(productFilters));
  }, [dispatch, selectedCategory, filters]);

  const handleCategorySelect = (categoryId: string, category: Category) => {
    navigate(`/categories/${category.slug}`);
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev: ProductFilters) => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: ProductFilters) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBreadcrumbs = () => {
    if (!selectedCategory) return [];
    
    const breadcrumbs = [];
    let current: Category | undefined = selectedCategory;
    
    while (current) {
      breadcrumbs.unshift(current);
      // Find parent category by ID from categoryTree
      if (current.parent) {
        const parentId = typeof current.parent === 'string' ? current.parent : (current.parent as any)?._id;
        current = findCategoryById(categoryTree, parentId);
      } else {
        current = undefined;
      }
    }
    
    return breadcrumbs;
  };

  const findCategoryById = (categories: Category[], id: string): Category | undefined => {
    for (const category of categories) {
      if (category._id === id) {
        return category;
      }
      if (category.children) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button
              onClick={() => navigate('/categories')}
              className="hover:text-blue-600 transition-colors"
            >
              Categories
            </button>
            {breadcrumbs.map((category, index) => (
              <React.Fragment key={category._id}>
                <ChevronRight className="w-4 h-4" />
                <button
                  onClick={() => navigate(`/categories/${category.slug}`)}
                  className={`hover:text-blue-600 transition-colors ${
                    index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''
                  }`}
                >
                  {category.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              {categoryLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <CategoryTree
                  selectedCategory={selectedCategory?._id}
                  onCategorySelect={handleCategorySelect}
                  showProductCount={true}
                />
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Sort By */}
                <div>
                  <label htmlFor="sort-by-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort-by-select"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="popularity-desc">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="newest-desc">Newest First</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      aria-label="Minimum price"
                      value={filters.priceRange?.min || ''}
                      onChange={(e) => {
                        const newPriceRange = { ...filters.priceRange };
                        if (e.target.value) {
                          newPriceRange.min = Number(e.target.value);
                        } else {
                          delete newPriceRange.min;
                        }
                        // If both min and max are undefined, set priceRange to undefined
                        const finalPriceRange = (newPriceRange.min === undefined && newPriceRange.max === undefined) 
                          ? undefined 
                          : newPriceRange;
                        handleFilterChange({ priceRange: finalPriceRange });
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      aria-label="Maximum price"
                      value={filters.priceRange?.max || ''}
                      onChange={(e) => {
                        const newPriceRange = { ...filters.priceRange };
                        if (e.target.value) {
                          newPriceRange.max = Number(e.target.value);
                        } else {
                          delete newPriceRange.max;
                        }
                        // If both min and max are undefined, set priceRange to undefined
                        const finalPriceRange = (newPriceRange.min === undefined && newPriceRange.max === undefined) 
                          ? undefined 
                          : newPriceRange;
                        handleFilterChange({ priceRange: finalPriceRange });
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="rating-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    id="rating-select"
                    value={filters.rating || ''}
                    onChange={(e) => handleFilterChange({
                      rating: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock || false}
                      onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>

                {/* On Sale */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.onSale || false}
                      onChange={(e) => handleFilterChange({ onSale: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>

                {/* Free Shipping */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.freeShipping || false}
                      onChange={(e) => handleFilterChange({ freeShipping: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    sortBy: 'popularity',
                    sortOrder: 'desc',
                    page: 1,
                    limit: 20
                  })}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory ? selectedCategory.name : 'All Categories'}
                </h1>
                {selectedCategory?.description && (
                  <p className="text-gray-600 mt-1">{selectedCategory.description}</p>
                )}
                {total > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {((page - 1) * (filters.limit || 20)) + 1} - {Math.min(page * (filters.limit || 20), total)} of {total} products
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Switch to grid view"
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Switch to list view"
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                  }
                `}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      showQuickCommerce={true}
                      forceQuickBadge={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNum === page
                                ? 'text-blue-600 bg-blue-50 border border-blue-300'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;