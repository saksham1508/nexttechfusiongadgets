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

  // Reverse geocoding - get address from coordinates
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      // Using a free geocoding service (you can replace with Google Maps API)
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
      );
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted;
      }
      
      return 'Address not found';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unable to get address';
    }
  }

  // Get saved addresses
  async getSavedAddresses(): Promise<Location[]> {
    try {
      const response = await axios.get(`${this.baseURL}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  // Save new address
  async saveAddress(address: Omit<Location, 'id'>): Promise<Location> {
    try {
      const response = await axios.post(`${this.baseURL}/user/addresses`, address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  // Update address
  async updateAddress(id: string, address: Partial<Location>): Promise<Location> {
    try {
      const response = await axios.put(`${this.baseURL}/user/addresses/${id}`, address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/user/addresses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
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