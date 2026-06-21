import React, { useState, useEffect } from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import { getLocalizedField } from "@/hooks/useTranslation";

interface DesktopStickyBannerProps {
  unit: any;
  language: string;
  mounted: boolean;
  onOpenUnitsList: () => void;
  scrollThreshold?: number;
}

export default function DesktopStickyBanner({
  unit,
  language,
  mounted,
  onOpenUnitsList,
  scrollThreshold = 350
}: DesktopStickyBannerProps) {
  const [showMiniBanner, setShowMiniBanner] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!mounted) return;
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > scrollThreshold) {
        if (currentScrollY < lastScrollY) {
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
    <div className="sticky top-[1px] z-[60] w-full h-0">
      <div 
        className={`absolute top-0 left-0 right-0 transition-all duration-300 ${unit.colorClass} shadow-md flex items-center justify-between p-4 px-8 hidden md:flex rounded-b-3xl ${showMiniBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-white font-extrabold text-lg drop-shadow-sm">
            {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
          </h2>
        </div>
        <BannerUnitsButton 
          onClick={onOpenUnitsList} 
          language={language}
          className="shadow-none border-none py-2 px-4"
        />
      </div>
    </div>
  );
}
