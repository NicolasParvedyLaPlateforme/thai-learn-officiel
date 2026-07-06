import React from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import { getLocalizedField } from "@/hooks/useTranslation";
import { useStickyBanner } from "@/hooks/useStickyBanner";
import { Typography } from '../ui/Typography';

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
  const showMiniBanner = useStickyBanner({ mounted, scrollThreshold, direction: 'up' });

  return (
    <div className="sticky top-[1px] z-[200] w-full h-0">
      <div
        className={`absolute top-0 left-0 right-0 z-[200] transition-all duration-300 ${unit.colorClass} shadow-md flex items-center justify-between p-4 px-8 hidden md:flex rounded-b-3xl ${showMiniBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="flex items-center gap-4">
          <Typography variant="sticky-banner-desktop">
            {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
          </Typography>
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
