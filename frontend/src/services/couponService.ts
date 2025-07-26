import axios from 'axios';
import { API_URL, getAuthHeaders } from '../config/api';

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
  applicableCategories: string[];
  applicableProducts: string[];
  excludedProducts: string[];
  userRestrictions: {
    newUsersOnly: boolean;
    premiumUsersOnly: boolean;
    specificUsers: string[];
  };
  paymentMethods: string[];
  isActive: boolean;
  priority: number;
  isCurrentlyValid?: boolean;
}

export interface CouponValidationResponse {
  valid: boolean;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    title: string;
    discountType: string;
    discountValue: number;
  };
  discountAmount?: number;
  finalAmount?: number;
}

export interface CouponValidationRequest {
  code: string;
  orderValue: number;
  products?: string[];
  paymentMethod?: string;
}

class CouponService {
  private baseURL = `${API_URL}/coupons`;

  // Get all active coupons
  async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  }

  // Get user's available coupons
  async getUserAvailableCoupons(): Promise<Coupon[]> {
    try {
      const response = await axios.get(`${this.baseURL}/user/available`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      throw error;
    }
  }

  // Validate coupon
  async validateCoupon(data: CouponValidationRequest): Promise<CouponValidationResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/validate`, data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      console.error('Error validating coupon:', error);
      throw error;
    }
  }

  // Apply coupon (when order is placed)
  async applyCoupon(code: string, orderValue: number, discountApplied: number): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/apply`, {
        code,
        orderValue,
        discountApplied
      }, {
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // Get coupon by code (for display purposes)
  async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      const coupons = await this.getActiveCoupons();
      return coupons.find(coupon => coupon.code.toLowerCase() === code.toLowerCase()) || null;
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      return null;
    }
  }

  // Format discount display
  formatDiscount(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF${coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : ''}`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  }

  // Check if coupon is valid for current time
  isValidNow(coupon: Coupon): boolean {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    return coupon.isActive && 
           validFrom <= now && 
           validUntil >= now &&
           (coupon.usageLimit == null || coupon.usageCount < coupon.usageLimit);
  }

  // Calculate potential discount
  calculateDiscount(coupon: Coupon, orderValue: number): number {
    if (!this.isValidNow(coupon) || orderValue < coupon.minOrderValue) {
      return 0;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return Math.min(discountAmount, orderValue);
  }
}

export default new CouponService();