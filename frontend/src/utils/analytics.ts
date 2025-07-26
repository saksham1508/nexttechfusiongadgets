// Analytics Integration with Cookie Consent
import { canUseAnalyticsCookies, canUseMarketingCookies } from '../hooks/useCookieConsent';

// Google Analytics Integration
export const initializeGoogleAnalytics = (measurementId: string) => {
  if (!canUseAnalyticsCookies()) {
    console.log('Analytics cookies not consented - skipping Google Analytics initialization');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  // Make gtag globally available
  window.gtag = gtag;
  
  console.log('Google Analytics initialized');
};

// Facebook Pixel Integration
export const initializeFacebookPixel = (pixelId: string) => {
  if (!canUseMarketingCookies()) {
    console.log('Marketing cookies not consented - skipping Facebook Pixel initialization');
    return;
  }

  // Facebook Pixel code
  (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element) {
    if (f.fbq) return;
    n = f.fbq = function(...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    }
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');

  console.log('Facebook Pixel initialized');
};

// Track page views
export const trackPageView = (page: string, title?: string) => {
  if (!canUseAnalyticsCookies()) return;

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: page,
      page_title: title
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (!canUseAnalyticsCookies()) return;

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track ecommerce events
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD', items?: any[]) => {
  if (!canUseAnalyticsCookies()) return;

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }

  // Facebook Pixel purchase event
  if (canUseMarketingCookies() && typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency
    });
  }
};

// Track add to cart events
export const trackAddToCart = (itemId: string, itemName: string, value: number, currency: string = 'USD') => {
  if (!canUseAnalyticsCookies()) return;

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: currency,
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        quantity: 1,
        price: value
      }]
    });
  }

  // Facebook Pixel add to cart event
  if (canUseMarketingCookies() && typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [itemId],
      content_name: itemName,
      value: value,
      currency: currency
    });
  }
};

// Track search events
export const trackSearch = (searchTerm: string) => {
  if (!canUseAnalyticsCookies()) return;

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm
    });
  }

  // Facebook Pixel search event
  if (canUseMarketingCookies() && typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm
    });
  }
};

// Initialize all analytics services
export const initializeAnalytics = () => {
  // Replace with your actual measurement IDs
  const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
  const FB_PIXEL_ID = process.env.REACT_APP_FB_PIXEL_ID;

  if (GA_MEASUREMENT_ID) {
    initializeGoogleAnalytics(GA_MEASUREMENT_ID);
  }

  if (FB_PIXEL_ID) {
    initializeFacebookPixel(FB_PIXEL_ID);
  }
};

// Update consent for existing analytics
export const updateAnalyticsConsent = () => {
  const analyticsConsent = canUseAnalyticsCookies();
  const marketingConsent = canUseMarketingCookies();

  // Update Google Analytics consent
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': analyticsConsent ? 'granted' : 'denied',
      'ad_storage': marketingConsent ? 'granted' : 'denied'
    });
  }

  // Update Facebook Pixel consent
  if (typeof window !== 'undefined' && window.fbq) {
    if (marketingConsent) {
      window.fbq('consent', 'grant');
    } else {
      window.fbq('consent', 'revoke');
    }
  }

  console.log('Analytics consent updated:', { analyticsConsent, marketingConsent });
};

// Global types are declared in react-app-env.d.ts

export default {
  initializeAnalytics,
  updateAnalyticsConsent,
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackSearch
};