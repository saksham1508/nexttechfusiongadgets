/// <reference types="react-scripts" />

// Global type declarations for third-party scripts
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    Stripe?: any;
  }

  // Google Analytics gtag function
  function gtag(...args: any[]): void;
  
  // Facebook Pixel fbq function  
  function fbq(...args: any[]): void;
}