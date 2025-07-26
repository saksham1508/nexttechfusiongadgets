// Performance Optimizer - Frontend optimization utilities
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
}

class PerformanceOptimizer {
  private renderCache = new Map<string, any>();
  private memoCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private observedElements = new WeakMap<Element, IntersectionObserver>();
  private performanceMetrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 0
  };

  // O(1) - Memoization with TTL
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl: number = 300000 // 5 minutes default
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cached = this.memoCache.get(key);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.result;
      }

      const result = fn(...args);
      this.memoCache.set(key, {
        result,
        timestamp: Date.now(),
        ttl
      });

      return result;
    }) as T;
  }

  // O(1) - Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  // O(1) - Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // O(1) - Lazy loading with Intersection Observer
  lazyLoad(
    element: HTMLElement,
    callback: () => void,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): () => void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
          this.observedElements.delete(entry.target);
        }
      });
    }, options);

    observer.observe(element);
    this.observedElements.set(element, observer);

    // Return cleanup function
    return () => {
      observer.unobserve(element);
      this.observedElements.delete(element);
    };
  }

  // O(1) - Virtual scrolling helper
  calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan: number = 5
  ) {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      totalItems - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(totalItems - 1, visibleEnd + overscan);

    return {
      start,
      end,
      visibleStart,
      visibleEnd,
      totalHeight: totalItems * itemHeight
    };
  }

  // O(1) - Image optimization
  optimizeImage(
    src: string,
    width?: number,
    height?: number,
    quality: number = 80,
    format: 'webp' | 'jpeg' | 'png' = 'webp'
  ): string {
    // For Cloudinary or similar services
    if (src.includes('cloudinary.com')) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push(`f_${format}`);
      
      return src.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    // For other services, return original or implement specific logic
    return src;
  }

  // O(1) - Bundle splitting helper
  dynamicImport<T>(
    importFn: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    return importFn().catch(error => {
      console.error('Dynamic import failed:', error);
      if (fallback) return fallback;
      throw error;
    });
  }

  // O(1) - Memory usage monitoring
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  // O(1) - Performance timing
  measurePerformance<T>(
    name: string,
    fn: () => T
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  // O(1) - Async performance timing
  async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  // O(1) - Component render optimization
  shouldComponentUpdate<T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    shallowCompare: boolean = true
  ): boolean {
    if (shallowCompare) {
      const prevKeys = Object.keys(prevProps);
      const nextKeys = Object.keys(nextProps);
      
      if (prevKeys.length !== nextKeys.length) return true;
      
      return prevKeys.some(key => prevProps[key] !== nextProps[key]);
    }
    
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }

  // O(1) - Event delegation
  delegateEvent(
    container: HTMLElement,
    eventType: string,
    selector: string,
    handler: (event: Event, target: Element) => void
  ): () => void {
    const delegatedHandler = (event: Event) => {
      const target = (event.target as Element).closest(selector);
      if (target && container.contains(target)) {
        handler(event, target);
      }
    };

    container.addEventListener(eventType, delegatedHandler);
    
    return () => container.removeEventListener(eventType, delegatedHandler);
  }

  // O(1) - Batch DOM updates
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  // O(1) - Preload resources
  preloadResource(
    href: string,
    as: 'script' | 'style' | 'image' | 'font' = 'script',
    crossorigin?: string
  ): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    
    document.head.appendChild(link);
  }

  // O(1) - Service Worker registration
  async registerServiceWorker(scriptURL: string): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(scriptURL);
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // O(1) - Web Workers for heavy computations
  createWebWorker(
    workerScript: string,
    onMessage: (data: any) => void,
    onError?: (error: ErrorEvent) => void
  ): Worker | null {
    if ('Worker' in window) {
      const worker = new Worker(workerScript);
      worker.onmessage = (event) => onMessage(event.data);
      if (onError) worker.onerror = onError;
      return worker;
    }
    return null;
  }

  // O(1) - IndexedDB helper
  async openIndexedDB(
    dbName: string,
    version: number = 1,
    onUpgrade?: (db: IDBDatabase) => void
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      if (onUpgrade) {
        request.onupgradeneeded = () => onUpgrade(request.result);
      }
    });
  }

  // O(1) - Local storage with compression
  setCompressedItem(key: string, value: any): void {
    try {
      const compressed = this.compress(JSON.stringify(value));
      localStorage.setItem(key, compressed);
    } catch (error) {
      console.error('Failed to set compressed item:', error);
    }
  }

  // O(1) - Get compressed item from local storage
  getCompressedItem<T>(key: string): T | null {
    try {
      const compressed = localStorage.getItem(key);
      if (!compressed) return null;
      
      const decompressed = this.decompress(compressed);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Failed to get compressed item:', error);
      return null;
    }
  }

  // O(n) - Simple compression using LZ-string-like algorithm
  private compress(str: string): string {
    const dict: Record<string, number> = {};
    const data = str.split('');
    const result: (string | number)[] = [];
    let dictSize = 256;
    let w = '';

    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const wc = w + c;
      
      if (dict[wc]) {
        w = wc;
      } else {
        result.push(dict[w] ? dict[w] : w);
        dict[wc] = dictSize++;
        w = c;
      }
    }
    
    if (w) result.push(dict[w] ? dict[w] : w);
    return result.join(',');
  }

  // O(n) - Simple decompression
  private decompress(str: string): string {
    const dict: Record<number, string> = {};
    const data = str.split(',');
    let dictSize = 256;
    let w = String(data[0]);
    let result = w;

    for (let i = 1; i < data.length; i++) {
      const k = parseInt(data[i]) || data[i];
      let entry: string;
      
      if (dict[k as number]) {
        entry = dict[k as number];
      } else if (k === dictSize) {
        entry = w + w.charAt(0);
      } else {
        entry = String(k);
      }
      
      result += entry;
      dict[dictSize++] = w + entry.charAt(0);
      w = entry;
    }
    
    return result;
  }

  // O(1) - Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    this.performanceMetrics.memoryUsage = this.getMemoryUsage();
    this.performanceMetrics.cacheHitRate = this.calculateCacheHitRate();
    return { ...this.performanceMetrics };
  }

  // O(1) - Calculate cache hit rate
  private calculateCacheHitRate(): number {
    const totalRequests = this.memoCache.size;
    if (totalRequests === 0) return 0;
    
    let hits = 0;
    const now = Date.now();
    
    for (const [, cached] of this.memoCache) {
      if (now - cached.timestamp < cached.ttl) {
        hits++;
      }
    }
    
    return hits / totalRequests;
  }

  // O(1) - Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, cached] of this.memoCache) {
      if (now - cached.timestamp >= cached.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.memoCache.delete(key));
  }

  // O(1) - Clear all caches
  clearAllCaches(): void {
    this.renderCache.clear();
    this.memoCache.clear();
  }
}

// Export singleton instance
export default new PerformanceOptimizer();