'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={isMobile ? { opacity: 0, y: 20 } : { opacity: 0 }}
        animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1 }}
        exit={isMobile ? { opacity: 0, y: -20, transition: { duration: 0.2 } } : { opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
