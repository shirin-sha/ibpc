// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performance.now();
      return () => {
        const end = performance.now();
        const duration = end - start;
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
        
        // Send to analytics if needed
        if (duration > 100) { // Log slow renders
          console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
        }
      };
    }
    return () => {};
  },

  // Measure API call performance
  measureApiCall: async (apiCall, endpoint) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performance.now();
      try {
        const result = await apiCall();
        const end = performance.now();
        const duration = end - start;
        console.log(`${endpoint} API call time: ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        const duration = end - start;
        console.error(`${endpoint} API call failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    }
    return apiCall();
  },

  // Measure page load performance
  measurePageLoad: () => {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          console.log('Page Load Performance:', {
            domContentLoaded: `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
            loadComplete: `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
            totalTime: `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`
          });
        }
      });
    }
  },

  // Measure bundle size impact
  measureBundleSize: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const totalJsSize = jsResources.reduce((total, resource) => total + resource.transferSize, 0);
      
      console.log('Bundle Analysis:', {
        totalJSResources: jsResources.length,
        totalJSSize: `${(totalJsSize / 1024).toFixed(2)}KB`,
        averageResourceSize: `${(totalJsSize / jsResources.length / 1024).toFixed(2)}KB`
      });
    }
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const measureRender = performanceMonitor.measureRender(componentName);
  
  return {
    measureRender,
    measureApiCall: performanceMonitor.measureApiCall
  };
};
