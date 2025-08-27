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

// Try to load a previously stored snapshot for accurate name/price/images
function productFromSnapshot(productId: string): MockCartProduct | null {
  try {
    const raw = localStorage.getItem(`productSnapshot:${productId}`);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    const images = Array.isArray(snap.images) && snap.images.length
      ? snap.images.map((img: any) => (
          typeof img === 'string'
            ? { url: img, alt: snap.name || 'product' }
            : { url: img.url, alt: img.alt || snap.name || 'product' }
        ))
      : [{ url: '/placeholder.png', alt: snap.name || 'product' }];

    return {
      _id: snap._id || productId,
      name: snap.name || `Product ${productId.substring(0, 6)}`,
      price: typeof snap.price === 'number' ? snap.price : Number(snap.price) || 999,
      images,
      stock: typeof snap.stock === 'number' ? snap.stock : 100,
    };
  } catch {
    return null;
  }
}

function resolveProduct(productId: string): MockCartProduct {
  const fromSnap = productFromSnapshot(productId);
  return fromSnap || placeholderProduct(productId);
}

export const mockApiService = {
  async getCart() {
    // Rehydrate products from snapshots if available
    const rawItems = loadCart();
    const items = rawItems.map((item) => {
      const pid = typeof (item as any).product === 'string' ? (item as any).product : (item as any).product?._id;
      const snap = pid ? productFromSnapshot(pid) : null;
      return snap ? { ...item, product: snap } : item;
    });
    return { items, totalAmount: calcTotal(items) };
  },

  async addToCart(productId: string, quantity: number) {
    const items = loadCart();
    const idx = items.findIndex((i) => i.product._id === productId);
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ product: resolveProduct(productId), quantity });
    }
    saveCart(items);
    return { items, totalAmount: calcTotal(items) };
  },

  async updateCartItem(productId: string, quantity: number) {
    const items = loadCart();
    const idx = items.findIndex((i) => i.product._id === productId);
    if (idx >= 0) {
      items[idx].quantity = Math.max(1, quantity);
      // also refresh product info from snapshot if available
      const snap = productFromSnapshot(productId);
      if (snap) items[idx].product = snap;
    } else {
      items.push({ product: resolveProduct(productId), quantity: Math.max(1, quantity) });
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