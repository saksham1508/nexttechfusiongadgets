// Six Sigma: Performance monitoring hook for frontend optimization
import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface PerformanceState {
  metrics: PerformanceMetric[];
  isMonitoring: boolean;
  currentPageLoad: number;
  renderTimes: number[];
  apiCallTimes: Map<string, number[]>;
}

interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetric[];
  startTimer: (name: string, tags?: Record<string, string>) => () => void;
  recordMetric: (name: string, value: number, type?: 'timing' | 'counter' | 'gauge', tags?: Record<string, string>) => void;
  getAverageTime: (name: string) => number;
  getMetricsSummary: () => Record<string, any>;
  clearMetrics: () => void;
  isMonitoring: boolean;
}

// Six Sigma: Define - Performance thresholds and targets
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000, // 3 seconds
  API_CALL: 2000,  // 2 seconds
  RENDER_TIME: 16, // 16ms for 60fps
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5 seconds
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
  CUMULATIVE_LAYOUT_SHIFT: 0.1,
  FIRST_INPUT_DELAY: 100 // 100ms
} as const;

export const usePerformanceMonitor = (): UsePerformanceMonitorReturn => {
  const [state, setState] = useState<PerformanceState>({
    metrics: [],
    isMonitoring: true,
    currentPageLoad: 0,
    renderTimes: [],
    apiCallTimes: new Map()
  });

  const timersRef = useRef<Map<string, number>>(new Map());
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Six Sigma: Measure - Initialize performance monitoring
  useEffect(() => {
    if (!state.isMonitoring || typeof window === 'undefined') return;

    // Monitor Web Vitals and other performance metrics
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          let metricName = '';
          let value = 0;
          let type: 'timing' | 'counter' | 'gauge' = 'timing';

          switch (entry.entryType) {
            case 'navigation':
              const navEntry = entry as PerformanceNavigationTiming;
              recordMultipleMetrics([
                { name: 'page_load_time', value: navEntry.loadEventEnd - navEntry.startTime },
                { name: 'dom_content_loaded', value: navEntry.domContentLoadedEventEnd - navEntry.startTime },
                { name: 'first_byte', value: navEntry.responseStart - navEntry.startTime },
                { name: 'dom_interactive', value: navEntry.domInteractive - navEntry.startTime }
              ]);
              break;

            case 'paint':
              metricName = entry.name.replace('-', '_');
              value = entry.startTime;
              break;

            case 'largest-contentful-paint':
              metricName = 'largest_contentful_paint';
              value = entry.startTime;
              break;

            case 'first-input':
              const fiEntry = entry as any;
              metricName = 'first_input_delay';
              value = fiEntry.processingStart - fiEntry.startTime;
              break;

            case 'layout-shift':
              const lsEntry = entry as any;
              if (!lsEntry.hadRecentInput) {
                metricName = 'cumulative_layout_shift';
                value = lsEntry.value;
                type = 'gauge';
              }
              break;

            case 'resource':
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.name.includes('/api/')) {
                const apiEndpoint = extractApiEndpoint(resourceEntry.name);
                recordApiCallTime(apiEndpoint, resourceEntry.duration);
              }
              break;
          }

          if (metricName && value > 0) {
            recordSingleMetric(metricName, value, type);
          }
        });
      });

      // Observe different types of performance entries
      try {
        observerRef.current.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'resource'] });
      } catch (error) {
        console.warn('Some performance entry types not supported:', error);
        // Fallback to basic navigation timing
        observerRef.current.observe({ entryTypes: ['navigation'] });
      }
    }

    // Monitor React render performance
    const renderStartTime = performance.now();
    
    return () => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      recordSingleMetric('react_render_time', renderTime);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state.isMonitoring]);

  // Helper function to extract API endpoint from URL
  const extractApiEndpoint = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const apiIndex = pathParts.indexOf('api');
      if (apiIndex !== -1 && apiIndex + 1 < pathParts.length) {
        return pathParts.slice(apiIndex + 1, apiIndex + 3).join('/'); // e.g., "products/123"
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Record multiple metrics at once
  const recordMultipleMetrics = (metrics: Array<{ name: string; value: number; type?: 'timing' | 'counter' | 'gauge'; tags?: Record<string, string> }>) => {
    const newMetrics = metrics.map(metric => ({
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      type: metric.type || 'timing' as const,
      tags: metric.tags
    }));

    setState(prev => ({
      ...prev,
      metrics: [...prev.metrics, ...newMetrics].slice(-1000) // Keep last 1000 metrics
    }));
  };

  // Record single metric
  const recordSingleMetric = useCallback((name: string, value: number, type: 'timing' | 'counter' | 'gauge' = 'timing', tags?: Record<string, string>) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      tags
    };

    setState(prev => ({
      ...prev,
      metrics: [...prev.metrics, metric].slice(-1000) // Keep last 1000 metrics
    }));

    // Six Sigma: Control - Alert on performance threshold violations
    checkPerformanceThresholds(name, value);
  }, []);

  // Record API call timing
  const recordApiCallTime = useCallback((endpoint: string, duration: number) => {
    setState(prev => {
      const newApiCallTimes = new Map(prev.apiCallTimes);
      const existingTimes = newApiCallTimes.get(endpoint) || [];
      newApiCallTimes.set(endpoint, [...existingTimes, duration].slice(-100)); // Keep last 100 calls per endpoint
      
      return {
        ...prev,
        apiCallTimes: newApiCallTimes
      };
    });

    recordSingleMetric(`api_call_${endpoint}`, duration, 'timing', { endpoint });
  }, [recordSingleMetric]);

  // Check performance thresholds
  const checkPerformanceThresholds = (name: string, value: number) => {
    const thresholdKey = name.toUpperCase() as keyof typeof PERFORMANCE_THRESHOLDS;
    const threshold = PERFORMANCE_THRESHOLDS[thresholdKey];
    
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value}ms > ${threshold}ms`);
      
      // In production, you might want to send this to an analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: analytics.track('performance_threshold_exceeded', { metric: name, value, threshold });
      }
    }
  };

  // Start a timer for measuring custom operations
  const startTimer = useCallback((name: string, tags?: Record<string, string>) => {
    const startTime = performance.now();
    const timerId = `${name}_${Date.now()}`;
    timersRef.current.set(timerId, startTime);

    return () => {
      const endTime = performance.now();
      const startTime = timersRef.current.get(timerId);
      
      if (startTime !== undefined) {
        const duration = endTime - startTime;
        recordSingleMetric(name, duration, 'timing', tags);
        timersRef.current.delete(timerId);
        return duration;
      }
      
      return 0;
    };
  }, [recordSingleMetric]);

  // Get average time for a specific metric
  const getAverageTime = useCallback((name: string): number => {
    const relevantMetrics = state.metrics.filter(m => m.name === name && m.type === 'timing');
    
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / relevantMetrics.length;
  }, [state.metrics]);

  // Get comprehensive metrics summary
  const getMetricsSummary = useCallback(() => {
    const summary: Record<string, any> = {
      totalMetrics: state.metrics.length,
      timeRange: {
        start: state.metrics.length > 0 ? Math.min(...state.metrics.map(m => m.timestamp)) : 0,
        end: state.metrics.length > 0 ? Math.max(...state.metrics.map(m => m.timestamp)) : 0
      },
      averages: {},
      thresholdViolations: {},
      apiPerformance: {}
    };

    // Calculate averages for each metric type
    const metricGroups = state.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric.value);
      return groups;
    }, {} as Record<string, number[]>);

    Object.entries(metricGroups).forEach(([name, values]) => {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      summary.averages[name] = {
        average: Math.round(average * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };

      // Check threshold violations
      const thresholdKey = name.toUpperCase() as keyof typeof PERFORMANCE_THRESHOLDS;
      const threshold = PERFORMANCE_THRESHOLDS[thresholdKey];
      if (threshold) {
        const violations = values.filter(v => v > threshold).length;
        if (violations > 0) {
          summary.thresholdViolations[name] = {
            threshold,
            violations,
            violationRate: (violations / values.length) * 100
          };
        }
      }
    });

    // API performance summary
    state.apiCallTimes.forEach((times, endpoint) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      summary.apiPerformance[endpoint] = {
        average: Math.round(average * 100) / 100,
        min: Math.min(...times),
        max: Math.max(...times),
        callCount: times.length
      };
    });

    return summary;
  }, [state.metrics, state.apiCallTimes]);

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: [],
      apiCallTimes: new Map()
    }));
    timersRef.current.clear();
  }, []);

  return {
    metrics: state.metrics,
    startTimer,
    recordMetric: recordSingleMetric,
    getAverageTime,
    getMetricsSummary,
    clearMetrics,
    isMonitoring: state.isMonitoring
  };
};