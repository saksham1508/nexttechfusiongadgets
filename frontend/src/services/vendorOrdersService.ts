import apiService from './apiService';

export type VendorItemStatus = 'packaging' | 'dispatched' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface VendorOrderItem {
  _id: string;
  product: { _id: string; name: string };
  quantity: number;
  price: number;
  image?: string;
  vendorStatus?: VendorItemStatus;
}

export interface VendorOrder {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string };
  status: string;
  isPaid: boolean;
  totalPrice: number;
  createdAt: string;
  shippingAddress: { street: string; city: string; state: string; zipCode: string; country: string };
  orderItems: VendorOrderItem[];
}

const vendorOrdersService = {
  async list(params?: { status?: string; page?: number; limit?: number }): Promise<{ orders: VendorOrder[]; total: number; page: number; pages: number }> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await apiService.request<any>(`/vendor/orders${q.toString() ? `?${q}` : ''}`, { method: 'GET' });
    if (!res.success) throw new Error(res.error || 'Failed to load vendor orders');
    return res.data;
  },
  async updateItemStatus(orderId: string, itemId: string, status: VendorItemStatus, note?: string) {
    const res = await apiService.request<any>(`/vendor/orders/${orderId}/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
    if (!res.success) throw new Error(res.error || 'Failed to update status');
    return res.data;
  }
};

export default vendorOrdersService;