import { useState, useEffect } from 'react';

export function useScrollHeader(threshold: number = 50) {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const mountTime = Date.now();

    const handleScroll = () => {
      // Ignore programmatic scrolling on initial load
      if (Date.now() - mountTime < 1500) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowHeader(true);
        setLastScrollY(0);
        return;
      }
      if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return showHeader;
}
