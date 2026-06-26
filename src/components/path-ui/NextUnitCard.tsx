import { m as motion } from "motion/react";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface NextUnitCardProps {
  nextUnit: any;
  nextUnitIndex: number;
  language: string;
  handleUnitSelect: (index: number) => void;
  isMobile?: boolean;
}

import { ChevronsDown } from 'lucide-react';

export function NextUnitCard({ nextUnit, nextUnitIndex, language, handleUnitSelect, isMobile = false }: NextUnitCardProps) {
  if (!nextUnit) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`relative w-full mt-8 mb-16 group cursor-pointer`}
      onClick={() => handleUnitSelect(nextUnitIndex)}
    >
      {/* Premium Anchor Badge */}
      <div className={`absolute ${isMobile ? '-top-6' : '-top-8'} ${isMobile ? 'left-[1.25rem] sm:left-[1.5rem]' : 'left-1/2'} -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full ${nextUnit.colorClass || 'bg-emerald-500'} border-[4px] md:border-[6px] border-white shadow-xl flex items-center justify-center z-30 transition-transform duration-300 group-hover:scale-110 group-active:scale-95`}>
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
        <ChevronsDown size={isMobile ? 24 : 32} className="text-white stroke-[3] relative z-10 animate-bounce" />
      </div>

      <div className={`w-full h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex ${isMobile ? 'flex-col-reverse' : 'flex-row'} items-stretch transition-shadow duration-300 group-hover:shadow-lg`}>
        {/* Content Side */}
      <div className={`flex flex-col justify-center p-8 sm:p-10 ${isMobile ? 'w-full' : 'w-1/2'} gap-4 z-10 bg-white`}>
        <Typography as="span" className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-500">
          {getTranslation('auto.go_to_next_unit', language) || "Aller à l'unité suivante"}
        </Typography>
        <Typography variant="h3" className="text-2xl sm:text-[32px] font-extrabold text-slate-800 leading-tight">
          {getLocalizedField(nextUnit, 'title', language)}
        </Typography>
        <Typography variant="p" className="text-slate-500 text-sm sm:text-base font-medium">
          {getLocalizedField(nextUnit, 'description', language)}
        </Typography>
        <div className="mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleUnitSelect(nextUnitIndex);
            }}
            className={`px-8 py-6 rounded-2xl text-white font-bold text-lg shadow-sm transition-all active:translate-y-[4px] active:border-b-0 ${nextUnit.colorClass || 'bg-emerald-500'} ${nextUnit.borderClass ? `border-b-[4px] ${nextUnit.borderClass}` : 'border-b-[4px] border-emerald-600'} ${nextUnit.hoverClass || 'hover:bg-emerald-400'}`}
          >
            {getTranslation('auto.start_unit', language) || "Commencer l'unité"}
          </Button>
        </div>
      </div>

      {/* Image Side */}
      <div className={`relative ${isMobile ? 'w-full min-h-[220px]' : 'w-1/2 min-h-[300px]'} bg-slate-50 flex items-center justify-center overflow-hidden`}>
         <div className={`absolute inset-0 opacity-10 ${nextUnit.colorClass || 'bg-emerald-500'}`} />
         {nextUnit.imageUrl ? (
           <IconImage src={nextUnit.imageUrl} alt={nextUnit.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
         ) : (
           <div className={`w-32 h-32 rounded-full ${nextUnit.colorClass || 'bg-emerald-500'} opacity-20`} />
         )}
      </div>
      </div>
    </motion.div>
  );
}
