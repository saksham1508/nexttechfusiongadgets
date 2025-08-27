import apiService from './apiService';

export interface VendorAnalyticsResponse {
  success: boolean;
  data?: {
    summary: {
      totalClicks: number;
      totalViews: number;
      totalOrders: number;
      conversionRate: number; // percentage
      totalSales: number; // currency
      returnPercentage: number; // percentage
    };
    productOrders: Array<{ productId: string; name: string; views: number; orders: number }>;
    productMonthly: Array<{ productId: string; name: string; months: string[]; series: number[] }>;
  };
  message?: string;
}

const vendorService = {
  async getAnalytics(): Promise<VendorAnalyticsResponse> {
    // Let apiService handle headers and token logic centrally
    const res = await apiService.request<VendorAnalyticsResponse>('/vendor/analytics', {
      method: 'GET'
    });

    if (!res.success) {
      // As a fallback, force-set mock vendor token if missing and retry once
      let token = localStorage.getItem('token');
      if (!token) {
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const parsed = JSON.parse(raw);
            const userObj = (parsed as any).user || parsed;
            if (userObj && userObj.role === 'seller') {
              const vendorId = userObj._id || 'vendor_1';
              token = `mock_vendor_token_${vendorId}`;
              localStorage.setItem('token', token);
            }
          } else {
            // Seed minimal seller for dev if missing
            const seed = { _id: 'vendor_1', role: 'seller', name: 'Acme Supplies' } as any;
            localStorage.setItem('user', JSON.stringify(seed));
            token = `mock_vendor_token_${seed._id}`;
            localStorage.setItem('token', token);
          }
        } catch {}
      }

      if (!res.success) {
        // retry once after potential seeding
        const retry = await apiService.request<VendorAnalyticsResponse>('/vendor/analytics', { method: 'GET' });
        if (!retry.success) {
          throw new Error(retry.error || res.error || 'Failed to fetch vendor analytics');
        }
        return retry.data as any;
      }
    }

    return res.data as any;
  }
};

export default vendorService;