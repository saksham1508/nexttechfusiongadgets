import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { handleApiError } from '../../utils/errorHandler';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  images: { url: string; alt: string }[];
  specifications: Record<string, string>;
  stock: number;
  seller: { _id: string; name: string };
  reviews: any[];
  rating: number;
  numReviews: number;
  isActive: boolean;
  tags: string[];
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
}

const initialState: ProductState = {
  products: [],
  product: null,
  isLoading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
};

interface ProductFilters {
  category?: string;
  categories?: string[];
  brand?: string;
  brands?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  freeShipping?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  keyword?: string;
}

// Mock data for development when API is not available
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip',
    price: 999,
    originalPrice: 1099,
    category: 'smartphones',
    brand: 'Apple',
    images: [{ url: '/api/placeholder/300/300', alt: 'iPhone 15 Pro' }],
    specifications: { 'Storage': '128GB', 'Color': 'Natural Titanium' },
    stock: 50,
    seller: { _id: 'seller1', name: 'Apple Store' },
    reviews: [],
    rating: 4.8,
    numReviews: 1250,
    isActive: true,
    tags: ['smartphone', 'apple', 'premium'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen',
    price: 899,
    originalPrice: 999,
    category: 'smartphones',
    brand: 'Samsung',
    images: [{ url: '/api/placeholder/300/300', alt: 'Galaxy S24 Ultra' }],
    specifications: { 'Storage': '256GB', 'Color': 'Titanium Black' },
    stock: 30,
    seller: { _id: 'seller2', name: 'Samsung Store' },
    reviews: [],
    rating: 4.7,
    numReviews: 980,
    isActive: true,
    tags: ['smartphone', 'samsung', 'android'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'MacBook Pro 14"',
    description: 'Professional laptop with M3 chip',
    price: 1999,
    originalPrice: 2199,
    category: 'laptops',
    brand: 'Apple',
    images: [{ url: '/api/placeholder/300/300', alt: 'MacBook Pro 14' }],
    specifications: { 'Processor': 'M3', 'RAM': '16GB', 'Storage': '512GB SSD' },
    stock: 20,
    seller: { _id: 'seller1', name: 'Apple Store' },
    reviews: [],
    rating: 4.9,
    numReviews: 750,
    isActive: true,
    tags: ['laptop', 'apple', 'professional'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'AirPods Pro (3rd Gen)',
    description: 'Premium wireless earbuds with ANC',
    price: 249,
    originalPrice: 279,
    category: 'audio',
    brand: 'Apple',
    images: [{ url: '/api/placeholder/300/300', alt: 'AirPods Pro' }],
    specifications: { 'Battery': '6 hours', 'Connectivity': 'Bluetooth 5.3' },
    stock: 100,
    seller: { _id: 'seller1', name: 'Apple Store' },
    reviews: [],
    rating: 4.6,
    numReviews: 2100,
    isActive: true,
    tags: ['earbuds', 'apple', 'wireless'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Apple Watch Series 9',
    description: 'Advanced smartwatch with health monitoring',
    price: 399,
    originalPrice: 429,
    category: 'wearables',
    brand: 'Apple',
    images: [{ url: '/api/placeholder/300/300', alt: 'Apple Watch Series 9' }],
    specifications: { 'Size': '45mm', 'Connectivity': 'GPS + Cellular' },
    stock: 75,
    seller: { _id: 'seller1', name: 'Apple Store' },
    reviews: [],
    rating: 4.7,
    numReviews: 1800,
    isActive: true,
    tags: ['smartwatch', 'apple', 'health'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '6',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones',
    price: 349,
    originalPrice: 399,
    category: 'audio',
    brand: 'Sony',
    images: [{ url: '/api/placeholder/300/300', alt: 'Sony WH-1000XM5' }],
    specifications: { 'Battery': '30 hours', 'Connectivity': 'Bluetooth 5.2' },
    stock: 60,
    seller: { _id: 'seller3', name: 'Sony Store' },
    reviews: [],
    rating: 4.8,
    numReviews: 1500,
    isActive: true,
    tags: ['headphones', 'sony', 'noise-canceling'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '7',
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with InfinityEdge display',
    price: 1299,
    originalPrice: 1399,
    category: 'laptops',
    brand: 'Dell',
    images: [{ url: '/api/placeholder/300/300', alt: 'Dell XPS 13' }],
    specifications: { 'Processor': 'Intel i7', 'RAM': '16GB', 'Storage': '512GB SSD' },
    stock: 25,
    seller: { _id: 'seller4', name: 'Dell Store' },
    reviews: [],
    rating: 4.5,
    numReviews: 890,
    isActive: true,
    tags: ['laptop', 'dell', 'ultrabook'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '8',
    name: 'PlayStation 5',
    description: 'Next-gen gaming console',
    price: 499,
    originalPrice: 549,
    category: 'gaming',
    brand: 'Sony',
    images: [{ url: '/api/placeholder/300/300', alt: 'PlayStation 5' }],
    specifications: { 'Storage': '825GB SSD', 'Resolution': '4K' },
    stock: 15,
    seller: { _id: 'seller3', name: 'Sony Store' },
    reviews: [],
    rating: 4.9,
    numReviews: 3200,
    isActive: true,
    tags: ['gaming', 'console', 'sony'],
    warranty: '1 year',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Map ProductFilters to API parameters
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.priceRange?.min) queryParams.append('minPrice', filters.priceRange.min.toString());
      if (filters.priceRange?.max) queryParams.append('maxPrice', filters.priceRange.max.toString());
      if (filters.rating) queryParams.append('rating', filters.rating.toString());
      if (filters.inStock !== undefined) queryParams.append('inStock', filters.inStock.toString());
      if (filters.onSale !== undefined) queryParams.append('onSale', filters.onSale.toString());
      if (filters.freeShipping !== undefined) queryParams.append('freeShipping', filters.freeShipping.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      // If API is not available, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('API not available, using mock data:', error.message);
      }
      
      // Apply basic filtering to mock data
      let filteredProducts = [...mockProducts];
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.brand) {
        filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(keyword) || 
          p.description.toLowerCase().includes(keyword) ||
          p.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price':
              return filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
            case 'rating':
              return filters.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
            case 'name':
              return filters.sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        page,
        pages: Math.ceil(filteredProducts.length / limit),
        total: filteredProducts.length
      };
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.PRODUCTS.GET_BY_ID}/${id}`);
      return response.data;
    } catch (error: any) {
      // If API is not available, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('API not available, using mock data for product:', id);
      }
      const mockProduct = mockProducts.find(p => p._id === id);
      if (mockProduct) {
        return mockProduct;
      }
      return rejectWithValue('Product not found');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
