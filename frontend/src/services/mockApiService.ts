// Simple localStorage-backed mock cart service for unauthenticated or fallback flows
// Matches the response shape expected by cartSlice: { items, totalAmount }

export interface MockCartProduct {
  _id: string;
  name: string;
  price: number;
  images: { url: string; alt: string }[];
  stock: number;
}

export interface MockCartItem {
  product: MockCartProduct;
  quantity: number;
}

const STORAGE_KEY = 'mock_cart_v1';

function loadCart(): MockCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockCartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: MockCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function calcTotal(items: MockCartItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function placeholderProduct(productId: string): MockCartProduct {
  // Minimal product info for UI compatibility
  return {
    _id: productId,
    name: `Product ${productId.substring(0, 6)}`,
    price: 999,
    images: [{ url: '/placeholder.png', alt: 'placeholder' }],
    stock: 100,
  };
}

export const mockApiService = {
  async getCart() {
    const items = loadCart();
    return { items, totalAmount: calcTotal(items) };
  },

  async addToCart(productId: string, quantity: number) {
    const items = loadCart();
    const idx = items.findIndex((i) => i.product._id === productId);
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ product: placeholderProduct(productId), quantity });
    }
    saveCart(items);
    return { items, totalAmount: calcTotal(items) };
  },

  async updateCartItem(productId: string, quantity: number) {
    const items = loadCart();
    const idx = items.findIndex((i) => i.product._id === productId);
    if (idx >= 0) {
      items[idx].quantity = Math.max(1, quantity);
    } else {
      items.push({ product: placeholderProduct(productId), quantity: Math.max(1, quantity) });
    }
    saveCart(items);
    return { items, totalAmount: calcTotal(items) };
  },

  async removeFromCart(productId: string) {
    let items = loadCart();
    items = items.filter((i) => i.product._id !== productId);
    saveCart(items);
    return { items, totalAmount: calcTotal(items) };
  },

  async clearCart() {
    const items: MockCartItem[] = [];
    saveCart(items);
    return { items, totalAmount: 0 };
  },
};