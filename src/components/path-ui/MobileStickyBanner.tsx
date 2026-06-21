import React, { useState, useEffect } from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import { getLocalizedField } from "@/hooks/useTranslation";

interface MobileStickyBannerProps {
  unit: any;
  language: string;
  mounted: boolean;
  onOpenUnitsList: () => void;
  scrollThreshold?: number;
}

export default function MobileStickyBanner({
  unit,
  language,
  mounted,
  onOpenUnitsList,
  scrollThreshold = 250
}: MobileStickyBannerProps) {
  const [showMiniBanner, setShowMiniBanner] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!mounted) return;
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > scrollThreshold) {
        if (currentScrollY > lastScrollY) {
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
  }, [mounted, scrollThreshold]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[60] transition-transform duration-300 ${unit.colorClass} shadow-md flex items-center justify-between p-3 px-4 md:hidden ${showMiniBanner ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-white font-extrabold text-[15px] truncate max-w-[200px] drop-shadow-sm">
          {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
        </h2>
      </div>
      <BannerUnitsButton 
        onClick={onOpenUnitsList} 
        language={language}
        className="shadow-none border-none py-1.5"
      />
    </div>
  );
}
