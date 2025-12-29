export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function lazyLoadImages() {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.src = img.dataset.src || img.src;
      }
    });
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}

export function optimizeImage(url: string, width?: number, quality?: number): string {
  if (!url) return url;
  
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (quality) params.append('q', quality.toString());
  params.append('auto', 'format');
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}

export function measurePerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    return {
      start: () => performance.mark(`${name}-start`),
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      }
    };
  }
  return {
    start: () => {},
    end: () => 0
  };
}

export function prefetchRoute(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

export function enableServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful:', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed:', err);
        }
      );
    });
  }
}

export const coreWebVitalsThresholds = {
  LCP: {
    good: 2500,
    needsImprovement: 4000
  },
  FID: {
    good: 100,
    needsImprovement: 300
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800
  }
};

export function getCoreWebVitalsStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = coreWebVitalsThresholds[metric as keyof typeof coreWebVitalsThresholds];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}
