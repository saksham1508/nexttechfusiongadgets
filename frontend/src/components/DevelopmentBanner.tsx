import React, { useState } from 'react';
import { X, Info, ExternalLink } from 'lucide-react';

const DevelopmentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Development Mode:</span> 
              <span className="ml-1">
                Running with mock data. All features work normally for testing. 
              </span>
              <a 
                href="/BACKEND_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Setup Guide
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-400 hover:text-blue-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBanner;