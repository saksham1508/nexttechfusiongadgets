import axios from 'axios';

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

class LocationService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  private localKey = 'localAddresses';

  // Local storage fallback helpers
  private getLocalAddresses(): Location[] {
    try {
      const raw = localStorage.getItem(this.localKey);
      return raw ? JSON.parse(raw) as Location[] : [];
    } catch {
      return [];
    }
  }

  private setLocalAddresses(addresses: Location[]): void {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }

  // Get user's current location
  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding - get address from coordinates (via backend proxy to avoid CSP and API key issues)
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL.replace(/\/$/, '')}/user/geocode/reverse`, {
        params: { lat, lng },
        timeout: 10000,
      });
      if (response.data && response.data.address) {
        return response.data.address;
      }
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address (proxy):', error);
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  // Reverse geocoding with components (returns address and parsed components)
  async getAddressDetailsFromCoordinates(lat: number, lng: number): Promise<{ address: string; components: any }> {
    const tryFetch = async (base: string) => {
      const url = `${base.replace(/\/$/, '')}/user/geocode/reverse`;
      return axios.get(url, { params: { lat, lng }, timeout: 10000 });
    };

    try {
      // Primary attempt using configured baseURL
      let response = await tryFetch(this.baseURL);
      // If network fails (e.g., backend on different port), retry with common alternate localhost ports
      if (!response?.data) throw new Error('Empty response');
      const address = response.data?.address || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const components = response.data?.components || {};
      return { address, components };
    } catch (primaryError: any) {
      // Only retry on network-level issues (connection refused, CORS blocked, etc.)
      const errMsg = String(primaryError?.message || primaryError);
      const isNetwork = primaryError?.code === 'ERR_NETWORK' || /Network Error|ECONNREFUSED|CORS/i.test(errMsg);
      if (isNetwork) {
        const alternates = ['http://localhost:5000/api', 'http://127.0.0.1:5000/api'];
        for (const alt of alternates) {
          try {
            const resp = await axios.get(`${alt}/user/geocode/reverse`, { params: { lat, lng }, timeout: 8000 });
            const address = resp.data?.address || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            const components = resp.data?.components || {};
            return { address, components };
          } catch {}
        }
      }
      console.error('Error getting address details (proxy):', primaryError);
      return {
        address: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        components: {}
      };
    }
  }

  // Get saved addresses (returns [] if not authenticated)
  async getSavedAddresses(): Promise<Location[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Not logged in; no saved addresses
        return [];
      }
      const response = await axios.get(`${this.baseURL}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      // Gracefully handle auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return [];
      }
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  // Save new address (with local fallback if unauthenticated or API fails)
  async saveAddress(address: Omit<Location, 'id'>): Promise<Location> {
    const token = localStorage.getItem('token');
    // Try API when authenticated
    if (token) {
      try {
        const response = await axios.post(`${this.baseURL}/user/addresses`, address, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        // If auth fails, fall through to local
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Error saving address:', error);
        }
      }
    }

    // Local fallback
    const id = `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const toSave: Location = { id, ...address } as Location;
    const list = this.getLocalAddresses();
    // If new default, unset others
    if (toSave.isDefault) list.forEach(a => (a.isDefault = false));
    this.setLocalAddresses([...list, toSave]);
    return toSave;
  }

  // Update address (with local fallback)
  async updateAddress(id: string, address: Partial<Location>): Promise<Location> {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.put(`${this.baseURL}/user/addresses/${id}`, address, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Error updating address:', error);
        }
      }
    }

    // Local fallback
    const list = this.getLocalAddresses();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Address not found');
    const updated = { ...list[idx], ...address } as Location;
    if (updated.isDefault) list.forEach((a, i) => (list[i].isDefault = a.id === id));
    list[idx] = updated;
    this.setLocalAddresses(list);
    return updated;
  }

  // Delete address (with local fallback)
  async deleteAddress(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.delete(`${this.baseURL}/user/addresses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return;
      } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Error deleting address:', error);
        }
      }
    }

    // Local fallback
    const list = this.getLocalAddresses().filter(a => a.id !== id);
    this.setLocalAddresses(list);
  }

  // Get available delivery slots
  async getDeliverySlots(addressId: string): Promise<DeliverySlot[]> {
    try {
      const response = await axios.get(`${this.baseURL}/delivery/slots`, {
        params: { addressId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      throw error;
    }
  }

  // Check delivery availability
  async checkDeliveryAvailability(coordinates: { lat: number; lng: number }): Promise<{
    available: boolean;
    estimatedTime: number; // in minutes
    deliveryFee: number;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/delivery/check`, {
        coordinates,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      throw error;
    }
  }
}

export default new LocationService();