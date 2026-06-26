import React from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import { getLocalizedField } from "@/hooks/useTranslation";
import { useStickyBanner } from "@/hooks/useStickyBanner";
import { Typography } from '../ui/Typography';

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
  const showMiniBanner = useStickyBanner({ mounted, scrollThreshold, direction: 'down' });

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[60] transition-transform duration-300 ${unit.colorClass} shadow-md flex items-center justify-between p-3 px-4 md:hidden ${showMiniBanner ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="flex items-center gap-2">
        <Typography variant="h2" className="text-white font-extrabold text-[15px] truncate max-w-[200px] drop-shadow-sm">
          {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
        </Typography>
      </div>
      <BannerUnitsButton 
        onClick={onOpenUnitsList} 
        language={language}
        className="shadow-none border-none py-1.5"
      />
    </div>
  );
}
