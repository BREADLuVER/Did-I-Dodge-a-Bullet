'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const reportMetric = (name: string, value: number) => {
      // Send to analytics service (replace with your preferred service)
      console.log(`Performance Metric - ${name}:`, value);
      
      // Example: Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: value,
        });
      }
    };

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          reportMetric('FCP', fcpEntry.startTime);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportMetric('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Time to First Byte
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigationEntry = entries.find(entry => entry.entryType === 'navigation');
        if (navigationEntry) {
          const ttfb = (navigationEntry as any).responseStart - (navigationEntry as any).requestStart;
          reportMetric('TTFB', ttfb);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    }

    // Report Core Web Vitals after page load
    const reportCoreWebVitals = () => {
      if ('PerformanceObserver' in window) {
        // Report final CLS value
        const observer = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          reportMetric('CLS_FINAL', clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Report after page is fully loaded
    if (document.readyState === 'complete') {
      reportCoreWebVitals();
    } else {
      window.addEventListener('load', reportCoreWebVitals);
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', reportCoreWebVitals);
    };
  }, []);

  return null; // This component doesn't render anything
}; 