import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plus, 
  Home, 
  Briefcase, 
  MoreHorizontal,
  Navigation,
  Clock,
  Edit,
  Trash2,
  Check
} from 'lucide-react';
import locationService, { Location } from '../services/locationService';
import toast from 'react-hot-toast';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  selectedLocation
}) => {
  const [addresses, setAddresses] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Location | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false
  });

  // Ref for scrollable container
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  // Auto-scroll to form when it opens
  useEffect(() => {
    if (showAddForm && scrollableRef.current) {
      setTimeout(() => {
        scrollableRef.current?.scrollTo({
          top: scrollableRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [showAddForm]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const userAddresses = await locationService.getSavedAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      // Quick permission pre-check to avoid hanging UI on denied/blocked
      if (navigator.permissions && (navigator as any).permissions?.query) {
        try {
          const perm = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
          if (perm.state === 'denied') {
            toast.error('Location permission denied. Enable location in browser settings.');
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      // Race geolocation with a timeout to prevent indefinite loading
      const withTimeout = <T,>(p: Promise<T>, ms: number) => new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Location request timed out')), ms);
        p.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
      });

      const position = await withTimeout(locationService.getCurrentLocation(), 12000);
      const { address, components } = await locationService.getAddressDetailsFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );

      // Try to get PIN/ZIP code from components; fallback to extracting from address text
      const componentPinRaw =
        (components?.postcode as string | undefined) ||
        (components?.postal_code as string | undefined) ||
        (components?.postCode as string | undefined) ||
        (components?.zip as string | undefined) ||
        (components?.zip_code as string | undefined) || '';

      // Normalize potential component value (e.g., "123 456" -> "123456")
      const componentPin = String(componentPinRaw).replace(/[-\s]/g, '');

      // Extract Indian PIN or generic postal code; allow space/hyphen in 3-3 pattern
      const pinFromTextRaw =
        address.match(/\b\d{3}[-\s]?\d{3}\b/)?.[0] ||
        address.match(/\b\d{5,6}\b/)?.[0] ||
        '';
      const normalizedPin = pinFromTextRaw.replace(/[-\s]/g, '');

      // Prefer component value; otherwise normalized text match. Ensure 5-6 digits only.
      let pin = (componentPin || normalizedPin).match(/^\d{5,6}$/)?.[0] as string | undefined;

      // Fallback: try Google Maps JS API reverse geocoding if available and pin still missing
      if (!pin && (window as any)?.google?.maps?.Geocoder) {
        try {
          pin = await new Promise<string | undefined>((resolve) => {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
              (results: any[], status: string) => {
                if (status === 'OK' && results?.length) {
                  const r0 = results[0];
                  const comp = r0.address_components || [];
                  const postal = comp.find((c: any) => c.types?.includes('postal_code'))?.long_name || '';
                  const normalized = String(postal).replace(/[-\s]/g, '');
                  resolve(normalized.match(/^\d{5,6}$/)?.[0]);
                } else {
                  resolve(undefined);
                }
              }
            );
          });
        } catch {}
      }

      const currentLocation: Location = {
        id: 'current',
        name: pin ? `PIN ${pin}` : 'Current Location',
        address: pin ? `${pin}, ${address}` : address,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        type: 'other',
        isDefault: false
      };

      onLocationSelect(currentLocation);
      onClose();
      toast.success(pin ? `PIN ${pin} selected` : 'Current location selected');
    } catch (error) {
      toast.error('Unable to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!newAddress.name || !newAddress.address) {
        toast.error('Please fill all required fields');
        return;
      }

      setIsLoading(true);
      
      if (editingAddress) {
        const updated = await locationService.updateAddress(editingAddress.id, {
          ...newAddress,
          coordinates: editingAddress.coordinates
        });
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? updated : addr
        ));
        toast.success('Address updated successfully');
      } else {
        // For demo, using default coordinates
        const saved = await locationService.saveAddress({
          ...newAddress,
          coordinates: { lat: 28.6139, lng: 77.2090 } // Default to Delhi
        });
        setAddresses(prev => [...prev, saved]);
        toast.success('Address saved successfully');
      }

      setShowAddForm(false);
      setEditingAddress(null);
      setNewAddress({
        name: '',
        address: '',
        type: 'home',
        isDefault: false
      });
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await locationService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return MoreHorizontal;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Delivery Location
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close location selector"
              title="Close location selector"
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={scrollableRef} className="overflow-y-auto max-h-[65vh]">
          {/* Current Location Option */}
          <div className="p-4 border-b border-gray-100">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">Use Current Location</div>
                <div className="text-sm text-gray-500">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Fastest delivery option
                </div>
              </div>
            </button>
          </div>

          {/* Saved Addresses */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Saved Addresses</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add New</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No saved addresses yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => {
                  const IconComponent = getAddressIcon(address.type);
                  const isSelected = selectedLocation?.id === address.id;
                  
                  return (
                    <div
                      key={address.id}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 capitalize">
                              {address.name}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {address.address}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                onLocationSelect(address);
                                onClose();
                              }}
                              className={`text-sm font-medium ${
                                isSelected 
                                  ? 'text-blue-600' 
                                  : 'text-gray-600 hover:text-blue-600'
                              }`}
                            >
                              {isSelected ? (
                                <span className="flex items-center space-x-1">
                                  <Check className="h-3 w-3" />
                                  <span>Selected</span>
                                </span>
                              ) : (
                                'Select'
                              )}
                            </button>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAddress(address);
                                  setNewAddress({
                                    name: address.name,
                                    address: address.address,
                                    type: address.type,
                                    isDefault: address.isDefault
                                  });
                                  setShowAddForm(true);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label={`Edit ${address.name} address`}
                                title={`Edit ${address.name} address`}
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-gray-400 hover:text-red-600"
                                aria-label={`Delete ${address.name} address`}
                                title={`Delete ${address.name} address`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add/Edit Address Form - Now inside scrollable area */}
          {showAddForm && (
            <div className="border-t border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h4>
            
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Address name (e.g., Home, Office)"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Complete address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2">
                {(['home', 'work', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAddress(prev => ({ ...prev, type }))}
                    className={`px-3 py-1 rounded-full text-sm capitalize ${
                      newAddress.type === type
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-600">
                  Set as default address
                </label>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingAddress ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    setNewAddress({
                      name: '',
                      address: '',
                      type: 'home',
                      isDefault: false
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;