import { m as motion } from "motion/react";
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import IconImage from './IconImage';

interface NextUnitCardProps {
  nextUnit: any;
  nextUnitIndex: number;
  language: string;
  handleUnitSelect: (index: number) => void;
  isMobile?: boolean;
}

export function NextUnitCard({ nextUnit, nextUnitIndex, language, handleUnitSelect, isMobile = false }: NextUnitCardProps) {
  if (!nextUnit) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8 mb-16 flex ${isMobile ? 'flex-col-reverse' : 'flex-row'} items-stretch`}
    >
      {/* Content Side */}
      <div className={`flex flex-col justify-center p-8 sm:p-10 ${isMobile ? 'w-full' : 'w-1/2'} gap-4 z-10 bg-white`}>
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-500">
          {getTranslation('auto.go_to_next_unit', language) || "Aller à l'unité suivante"}
        </span>
        <h3 className="text-2xl sm:text-[32px] font-extrabold text-slate-800 leading-tight">
          {getLocalizedField(nextUnit, 'title', language)}
        </h3>
        <p className="text-slate-500 text-sm sm:text-base font-medium">
          {getLocalizedField(nextUnit, 'description', language)}
        </p>
        <div className="mt-4">
          <button
            onClick={() => handleUnitSelect(nextUnitIndex)}
            className={`px-8 py-3.5 rounded-2xl text-white font-bold text-lg shadow-sm transition-all active:translate-y-[4px] active:border-b-0 ${nextUnit.colorClass || 'bg-emerald-500'} ${nextUnit.borderClass ? `border-b-[4px] ${nextUnit.borderClass}` : 'border-b-[4px] border-emerald-600'} ${nextUnit.hoverClass || 'hover:bg-emerald-400'}`}
          >
            {getTranslation('auto.start_unit', language) || "Commencer l'unité"}
          </button>
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
    </motion.div>
  );
}
