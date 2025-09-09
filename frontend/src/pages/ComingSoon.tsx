import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LocationSelector from '../components/LocationSelector';
import { Location } from '../services/locationService';
import { MapPin, Zap } from 'lucide-react';

const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Session-only selection; no persistence across reloads

  const backToQuickHome = () => {
    // Preserve channel=quick when returning home
    navigate('/?channel=quick');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-large rounded-2xl p-8 max-w-lg w-full text-center border border-gray-100">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <Zap className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">We are coming soon</h1>
        <p className="text-gray-600 mb-6">
          Quick Commerce needs your delivery location to show instant-delivery products.
          Please set your location to continue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => setShowLocationSelector(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black"
          >
            <MapPin className="h-5 w-5" />
            Set delivery location
          </button>
          <Link
            to="/"
            className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Go to Home
          </Link>
        </div>

        {selectedLocation && (
          <div className="mt-6 text-sm text-gray-600">
            Selected: <span className="font-semibold">{selectedLocation.name}</span>
            <button
              type="button"
              onClick={backToQuickHome}
              className="ml-2 text-blue-600 hover:underline"
            >
              Continue to Quick Commerce
            </button>
          </div>
        )}
      </div>

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={(loc) => {
          // Session-only: do not persist to localStorage
          setSelectedLocation(loc);
          setShowLocationSelector(false);
          // Go back to quick channel home right away
          backToQuickHome();
        }}
        selectedLocation={selectedLocation || undefined}
      />
    </div>
  );
};

export default ComingSoon;