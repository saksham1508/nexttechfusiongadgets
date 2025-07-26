// Cookie Consent Hook
import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentHook {
  preferences: CookiePreferences;
  hasConsent: boolean;
  consentDate: string | null;
  updatePreferences: (newPreferences: CookiePreferences) => void;
  clearConsent: () => void;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  canUseFunctional: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
};

export const useCookieConsent = (): CookieConsentHook => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsent, setHasConsent] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    const savedDate = localStorage.getItem('cookieConsentDate');
    
    if (savedConsent) {
      try {
        const parsedPreferences = JSON.parse(savedConsent);
        setPreferences(parsedPreferences);
        setHasConsent(true);
        setConsentDate(savedDate);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
        // Reset to defaults if parsing fails
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('cookieConsentDate');
      }
    }
  }, []);

  // Update preferences
  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setHasConsent(true);
    const now = new Date().toISOString();
    setConsentDate(now);
    
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences));
    localStorage.setItem('cookieConsentDate', now);
  };

  // Clear consent (for testing or user request)
  const clearConsent = () => {
    setPreferences(defaultPreferences);
    setHasConsent(false);
    setConsentDate(null);
    
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
  };

  return {
    preferences,
    hasConsent,
    consentDate,
    updatePreferences,
    clearConsent,
    canUseAnalytics: hasConsent && preferences.analytics,
    canUseMarketing: hasConsent && preferences.marketing,
    canUseFunctional: hasConsent && preferences.functional
  };
};

// Utility functions for checking cookie permissions
export const canUseAnalyticsCookies = (): boolean => {
  const savedConsent = localStorage.getItem('cookieConsent');
  if (!savedConsent) return false;
  
  try {
    const preferences = JSON.parse(savedConsent);
    return preferences.analytics === true;
  } catch {
    return false;
  }
};

export const canUseMarketingCookies = (): boolean => {
  const savedConsent = localStorage.getItem('cookieConsent');
  if (!savedConsent) return false;
  
  try {
    const preferences = JSON.parse(savedConsent);
    return preferences.marketing === true;
  } catch {
    return false;
  }
};

export const canUseFunctionalCookies = (): boolean => {
  const savedConsent = localStorage.getItem('cookieConsent');
  if (!savedConsent) return false;
  
  try {
    const preferences = JSON.parse(savedConsent);
    return preferences.functional === true;
  } catch {
    return false;
  }
};

// Analytics integration helper
export const initializeAnalytics = () => {
  if (canUseAnalyticsCookies()) {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
    
    // Initialize other analytics tools
    console.log('Analytics initialized');
  }
};

// Marketing integration helper
export const initializeMarketing = () => {
  if (canUseMarketingCookies()) {
    // Initialize Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('consent', 'grant');
    }
    
    // Initialize Google Ads
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted'
      });
    }
    
    console.log('Marketing tools initialized');
  }
};

export default useCookieConsent;