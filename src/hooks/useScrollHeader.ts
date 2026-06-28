import { useState, useEffect, useRef } from 'react';

export function useScrollHeader(threshold: number = 50) {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let mountTime = Date.now();
    
    // Set initial scroll
    if (typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY;
    }

    const handleScroll = () => {
      if (Date.now() - mountTime < 500) return; // Reduced ignore time to 500ms

      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setShowHeader(true);
        lastScrollY.current = 0;
        return;
      }
      
      if (currentScrollY > lastScrollY.current && currentScrollY > threshold) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowHeader(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return showHeader;
}
