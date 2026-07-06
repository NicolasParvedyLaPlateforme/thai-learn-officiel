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
    
    const handleScroll = () => {
      if (!mounted) return;
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > scrollThreshold) {
        if (direction === 'up' ? currentScrollY < lastScrollY : currentScrollY > lastScrollY) {
          setShowMiniBanner(true);
        } else {
          setShowMiniBanner(false);
        }
      } else {
        setShowMiniBanner(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted, scrollThreshold, direction]);

  return showMiniBanner;
}
