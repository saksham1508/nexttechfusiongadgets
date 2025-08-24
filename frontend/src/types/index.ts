// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory?: string;
  brand: string;
  images: ProductImage[];
  specifications: Record<string, any>;
  features: string[];
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  rating: number;
  numReviews: number;
  reviews: Review[];
  tags: string[];
  seller: string;
  isActive: boolean;
  isFeatured: boolean;
  deliveryInfo: {
    estimatedTime: string;
    freeDelivery: boolean;
    deliveryCharge: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  estimatedDeliveryTime: string;
  deliveryFee: number;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  deliveryFee: number;
  totalPrice: number;
  couponApplied?: {
    code: string;
    discount: number;
  };
  status: OrderStatus;
  deliveryInfo: DeliveryInfo;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface PaymentResult {
  id: string;
  status: string;
  updateTime: string;
  emailAddress: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface DeliveryInfo {
  estimatedTime: string;
  actualTime?: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    photo?: string;
    rating: number;
  };
  trackingId: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  message: string;
  location?: string;
}

// Flash Sale Types
export interface FlashSale {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  products: FlashSaleProduct[];
  isActive: boolean;
  priority: number;
  bannerImage?: string;
  terms: string[];
}

export interface FlashSaleProduct {
  _id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  type: 'welcome' | 'flash' | 'bank' | 'loyalty' | 'referral' | 'seasonal';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit: number;
  isActive: boolean;
  terms?: string[];
}

// Location Types
export interface Location {
  _id: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  deliveryAvailable: boolean;
  estimatedTime: string;
}

export interface DeliveryZone {
  _id: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
  deliveryTime: {
    min: number;
    max: number;
  };
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
  };
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Chat Types
export interface ChatMessage {
  _id: string;
  sessionId: string;
  user?: string;
  message: string;
  response: string;
  intent: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  requiresHuman: boolean;
  createdAt: string;
}

// Payment Types
export type PaymentProvider = 'stripe' | 'paypal' | 'razorpay' | 'googlepay' | 'phonepe' | 'paytm' | 'upi' | 'square' | 'bitcoin' | 'ethereum' | 'cod';

export interface PaymentMethod {
  _id: string;
  provider: PaymentProvider;
  nickname: string;
  type: 'card' | 'bank' | 'wallet' | 'upi' | 'digital_wallet' | 'bank_account' | 'crypto' | 'cash';
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    bankName?: string;
    accountType?: string;
    upiId?: string;
    walletProvider?: string;
  };
  // Additional properties for PaymentMethodCard compatibility
  card?: {
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
  digitalWallet?: {
    walletType?: string;
    email?: string;
  };
  bankAccount?: {
    bankName?: string;
    last4?: string;
    accountType?: string;
  };
  cryptoWallet?: {
    currency?: string;
    address?: string;
  };
  upi?: {
    vpa: string;
    name: string;
    verified: boolean;
  };
  billingAddress?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfig {
  provider: PaymentProvider;
  enabled: boolean;
  testMode: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  apiKeys?: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  settings?: Record<string, any>;
}

export interface GooglePayPayment {
  paymentData: {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: Array<{
      type: string;
      parameters: {
        allowedAuthMethods: string[];
        allowedCardNetworks: string[];
      };
      tokenizationSpecification: {
        type: string;
        parameters: {
          gateway: string;
          gatewayMerchantId: string;
        };
      };
    }>;
    merchantInfo: {
      merchantId: string;
      merchantName: string;
    };
    transactionInfo: {
      totalPriceStatus: string;
      totalPrice: string;
      currencyCode: string;
      countryCode: string;
    };
  };
  orderId: string;
  amount: number;
  currency: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PayPalOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface UPIPayment {
  transactionId: string;
  amount: number;
  currency: string;
  upiId: string;
  deepLink: string;
  qrCode: string;
  status: 'pending' | 'success' | 'failed';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Search Types
export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  text: string;
  count?: number;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  showQuickCommerce?: boolean;
  onQuickAdd?: (productId: string, quantity: number) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface CheckoutFormData {
  shippingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
  deliverySlot?: string;
  specialInstructions?: string;
}

// Enhanced Ecommerce Types

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: {
    url: string;
    alt: string;
  };
  parent?: Category;
  children: Category[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  featuredProducts: Product[];
  productCount?: number;
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
  priceWhenAdded: number;
  notifyOnPriceChange: boolean;
  notifyOnStock: boolean;
  alerts?: WishlistAlert[];
}

export interface WishlistAlert {
  type: 'price_drop' | 'back_in_stock';
  message: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  isPublic: boolean;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy Payment Method Types (kept for backward compatibility)
export interface LegacyPaymentMethod {
  _id: string;
  user: string;
  type: 'card' | 'bank_account' | 'digital_wallet' | 'upi' | 'crypto';
  provider: 'stripe' | 'paypal' | 'razorpay' | 'googlepay' | 'phonepe' | 'paytm' | 'upi' | 'square' | 'bitcoin' | 'ethereum';
  card?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    funding: string;
    country: string;
  };
  bankAccount?: {
    last4: string;
    bankName: string;
    accountType: string;
    routingNumber: string;
  };
  digitalWallet?: {
    email: string;
    walletType: string;
  };
  upi?: {
    vpa: string;
    name: string;
    verified: boolean;
  };
  cryptoWallet?: {
    address: string;
    currency: string;
  };
  isDefault: boolean;
  isActive: boolean;
  nickname?: string;
  billingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Product Types
export interface ProductVariant {
  name: string;
  value: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface DigitalProduct {
  isDigital: boolean;
  downloadUrl?: string;
  downloadLimit: number;
  downloadExpiry: number;
}

export interface ProductSubscription {
  isSubscription: boolean;
  interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;
}

export interface ProductAnalytics {
  views: number;
  purchases: number;
  wishlistAdds: number;
  cartAdds: number;
}

// Inventory Types
export interface InventoryTransaction {
  _id: string;
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'damage' | 'expired';
  quantity: number;
  reason?: string;
  reference?: string;
  performedBy: User;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface Inventory {
  _id: string;
  product: Product;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  maxStock: number;
  location: {
    warehouse?: string;
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
  supplier?: User;
  costPrice: number;
  averageCost: number;
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  lastSaleDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  serialNumbers: string[];
  isPerishable: boolean;
  isTracked: boolean;
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  transactions: InventoryTransaction[];
  alerts: InventoryAlert[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiry_warning' | 'expired';
  message: string;
  isActive: boolean;
  createdAt: string;
}

// Enhanced Order Types
export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: User;
}

// Payment Intent Types
export interface PaymentIntent {
  clientSecret: string;
  status: string;
  paymentIntentId: string;
  requiresAction?: boolean;
  nextAction?: any;
}

// Razorpay Types
export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPayment {
  paymentId: string;
  orderId: string;
  signature: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
}

// PayPal Types
export interface PayPalOrder {
  orderId: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

// UPI Types
export interface UPIPayment {
  paymentId: string;
  amount: number;
  currency: string;
  upiId: string;
  merchantId: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  qrCode: string;
  deepLink: string;
}

// Additional Google Pay Types (extending the main one)
export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'TEST' | 'PRODUCTION';
  gateway: string;
  gatewayMerchantId: string;
}

// Search and Filter Types
export interface ProductFilters {
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
}

// Component Props for New Features
export interface CategoryTreeProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  showProductCount?: boolean;
}

export interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  onToggle: (productId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onSelect?: (paymentMethodId: string) => void;
  onEdit?: (paymentMethodId: string) => void;
  onDelete?: (paymentMethodId: string) => void;
  showActions?: boolean;
}

export interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onVariantSelect: (variant: ProductVariant) => void;
}

// Form Types for New Features
export interface CategoryFormData {
  name: string;
  description: string;
  parent?: string;
  image?: {
    url: string;
    alt: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  attributes: CategoryAttribute[];
}

export interface PaymentMethodFormData {
  type: 'card' | 'bank_account' | 'digital_wallet';
  provider: string;
  nickname?: string;
  billingAddress: Address;
  isDefault: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  images: ProductImage[];
  specifications: Record<string, any>;
  tags: string[];
  sku: string;
  weight?: {
    value: number;
    unit: string;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  variants: ProductVariant[];
  digitalProduct: DigitalProduct;
  subscription: ProductSubscription;
  lowStockThreshold: number;
}

// Window Type Declarations
declare global {
  interface Window {
    Razorpay: any;
    google: any;
  }
}

// API Service Types
export interface CategoryService {
  getCategories: (params?: any) => Promise<ApiResponse<Category[]>>;
  getCategoryTree: () => Promise<ApiResponse<Category[]>>;
  getCategory: (id: string) => Promise<ApiResponse<Category>>;
  getCategoryBySlug: (slug: string) => Promise<ApiResponse<Category>>;
  createCategory: (data: CategoryFormData) => Promise<ApiResponse<Category>>;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<ApiResponse<Category>>;
  deleteCategory: (id: string) => Promise<ApiResponse<void>>;
}

export interface WishlistService {
  getWishlist: () => Promise<ApiResponse<Wishlist>>;
  addToWishlist: (productId: string, options?: any) => Promise<ApiResponse<Wishlist>>;
  removeFromWishlist: (productId: string) => Promise<ApiResponse<void>>;
  clearWishlist: () => Promise<ApiResponse<void>>;
  moveToCart: (productId: string, quantity?: number) => Promise<ApiResponse<void>>;
  updateSettings: (settings: any) => Promise<ApiResponse<Wishlist>>;
}

export interface PaymentService {
  getPaymentMethods: () => Promise<ApiResponse<PaymentMethod[]>>;
  addPaymentMethod: (data: PaymentMethodFormData) => Promise<ApiResponse<PaymentMethod>>;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethodFormData>) => Promise<ApiResponse<PaymentMethod>>;
  deletePaymentMethod: (id: string) => Promise<ApiResponse<void>>;
  setDefaultPaymentMethod: (id: string) => Promise<ApiResponse<PaymentMethod>>;
  createPaymentIntent: (data: any) => Promise<ApiResponse<PaymentIntent>>;
  confirmPaymentIntent: (paymentIntentId: string) => Promise<ApiResponse<any>>;
}