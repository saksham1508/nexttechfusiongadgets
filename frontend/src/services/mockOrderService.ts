// LocalStorage-backed mock order service for development/testing
// Keeps structure compatible with frontend expectations

export interface MockOrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: { url: string; alt?: string }[];
  };
  quantity: number;
  price: number;
}

export interface MockOrder {
  _id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  orderItems: MockOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  paymentMethod?: string;
  paymentResult?: any;
}

const STORAGE_KEY = 'mock_orders_v1';

function loadOrders(): MockOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockOrder[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: MockOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function genId() {
  // Generate a 24-char hex-like id to mimic Mongo ObjectId
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const mockOrderService = {
  async create(orderData: Omit<MockOrder, '_id' | 'createdAt' | 'status'> & { status?: string }) {
    const orders = loadOrders();
    const order: MockOrder = {
      _id: genId(),
      createdAt: new Date().toISOString(),
      status: orderData.status || 'pending',
      totalPrice: orderData.totalPrice,
      orderItems: orderData.orderItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentResult: orderData.paymentResult,
    };
    orders.unshift(order);
    saveOrders(orders);
    return order;
  },

  async listMy() {
    return loadOrders();
  },

  async getById(id: string) {
    return loadOrders().find((o) => o._id === id) || null;
  }
};