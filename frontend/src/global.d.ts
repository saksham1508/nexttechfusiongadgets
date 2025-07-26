// Global type declarations for window extensions
declare interface Window {
  dataLayer: any[];
  gtag?: (...args: any[]) => void;
  fbq?: (...args: any[]) => void;
}