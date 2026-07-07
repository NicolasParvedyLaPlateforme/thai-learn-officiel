import { useState, useEffect, useRef } from 'react';

export function useScrollHeader(threshold: number = 50) {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const isProgrammaticRef = useRef(false);

  useEffect(() => {
    let mountTime = Date.now();
    
    // Set initial scroll
    if (typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY;
    }

    const handleHide = () => {
      isProgrammaticRef.current = true;
      setShowHeader(false); // hide immediately
      setTimeout(() => {
        isProgrammaticRef.current = false;
      }, 1500);
    };
    window.addEventListener('hideGlobalHeader', handleHide);

    const handleScroll = () => {
      if (Date.now() - mountTime < 500) return; // Reduced ignore time to 500ms

      // Ignore if a programmatic scroll was fired recently
      if (isProgrammaticRef.current || ((window as any)._isProgrammaticScroll && Date.now() - (window as any)._isProgrammaticScroll < 1500)) {
        lastScrollY.current = window.scrollY;
        return;
      }

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hideGlobalHeader', handleHide);
    };
  }, [threshold]);

  return showHeader;
}
