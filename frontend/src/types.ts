// Payment Types
export interface UPIPayment {
  paymentId: string;
  qrCode: string;
  deepLink: string;
  amount: number;
  orderId: string;
  upiId: string;
  status: 'pending' | 'success' | 'failed';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  paymentMethod?: string;
  status?: string;
  error?: string;
}

export interface PhonePePayment {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  payload: string;
  checksum: string;
  apiEndpoint: string;
  paymentUrl: string;
}

export interface RazorpayPayment {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PayPalPayment {
  orderId: string;
  amount: number;
  currency: string;
  approvalUrl: string;
}

export interface PayPalOrder {
  id: string;
  orderId: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface GooglePayPayment {
  orderId: string;
  amount: number;
  currency: string;
  merchantId?: string;
  merchantName?: string;
  paymentData?: any;
}

export type PaymentProvider = 'razorpay' | 'phonepe' | 'paypal' | 'stripe' | 'upi' | 'paytm' | 'googlepay' | 'square' | 'bitcoin' | 'ethereum' | 'cod';

export interface PaymentMethod {
  _id: string;
  id?: string;
  provider: PaymentProvider;
  name?: string;
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

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
}

export interface PaymentConfig {
  provider: string;
  enabled: boolean;
  testMode: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
}

// Product Types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[] | string[];
  category: string;
  brand: string;
  stock: number;
  stockQuantity?: number;
  inStock?: boolean;
  rating: number;
  reviews: number;
  numReviews?: number;
  seller?: string;
  specifications?: Record<string, any>;
  features?: string[];
  tags?: string[];
  lowStockThreshold?: number;
  deliveryInfo?: {
    estimatedTime: string;
    freeDelivery: boolean;
    deliveryCharge: number;
  };
  // Optional per-product payment acceptance rules
  paymentAcceptance?: {
    acceptAll?: boolean;
    highValueThreshold?: number;
    acceptedMethods?: PaymentProvider[];
    acceptedMethodsAboveThreshold?: PaymentProvider[];
  };
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  brand?: string;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  freeShipping?: boolean;
  sortBy?: 'price' | 'rating' | 'name' | 'newest' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  } | string;
  parent?: string;
  children?: Category[];
  level: number;
  isActive: boolean;
  productCount?: number;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
  priceWhenAdded?: number;
  alerts: any[];
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// Delivery Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface DeliveryZone {
  _id: string;
  name: string;
  coordinates: Location[];
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}