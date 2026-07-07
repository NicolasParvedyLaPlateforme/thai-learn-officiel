import { useState, useEffect } from 'react';

interface UseStickyBannerOptions {
  mounted: boolean;
  scrollThreshold: number;
  direction: 'up' | 'down';
}

export function useStickyBanner({ mounted, scrollThreshold, direction }: UseStickyBannerOptions) {
  const [showMiniBanner, setShowMiniBanner] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    
    const handleScroll = () => {
      if (!mounted) return;
      const currentScrollY = window.scrollY;
      
      // Ignore if a programmatic scroll was fired within the last 1.5 seconds
      if ((window as any)._isProgrammaticScroll && Date.now() - (window as any)._isProgrammaticScroll < 1500) {
        lastScrollY = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY;
      if (Math.sign(delta) !== Math.sign(accumulatedDelta)) {
        accumulatedDelta = 0;
      }
      accumulatedDelta += delta;

      if (Math.abs(accumulatedDelta) < 20) {
        lastScrollY = currentScrollY;
        return;
      }
      
      if (currentScrollY > scrollThreshold) {
        if (direction === 'up' ? accumulatedDelta < 0 : accumulatedDelta > 0) {
          setShowMiniBanner(true);
        } else {
          setShowMiniBanner(false);
        }
      } else {
        setShowMiniBanner(false);
      }
      
      accumulatedDelta = 0;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted, scrollThreshold, direction]);

  return showMiniBanner;
}
