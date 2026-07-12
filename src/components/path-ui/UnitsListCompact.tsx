import React from 'react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { BookOpen, CheckCircle } from 'lucide-react';

interface UnitsListCompactProps {
  units: any[];
  activeUnitIndex: number;
  language: string;
  onUnitSelect: (index: number) => void;
}

export function UnitsListCompact({ units, activeUnitIndex, language, onUnitSelect }: UnitsListCompactProps) {
  return (
    <div className="w-full mt-8">
      <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider px-4">
        {getTranslation('auto.course_units', language) || 'Toutes les unités'}
      </h3>
      
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 no-scrollbar">
        {units.map((u, i) => {
          const isActive = i === activeUnitIndex;
          return (
            <button
              key={u.id}
              onClick={() => onUnitSelect(i)}
              className={`flex-none snap-start w-64 flex items-center p-3 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-white border-emerald-500 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                {u.imageUrl ? (
                  <div className={`w-12 h-12 rounded-[10px] overflow-hidden relative shrink-0 border-2 ${isActive ? 'border-emerald-500 shadow-sm' : 'border-slate-200'}`}>
                    <img src={u.imageUrl} alt={getLocalizedField(u, 'title', language)} className={`object-cover w-full h-full ${isActive ? '' : 'opacity-80 grayscale-[30%]'}`} />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <BookOpen size={20} />
                  </div>
                )}
                
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`font-black uppercase text-[10px] ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {getTranslation('auto.unit', language)} {i + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm truncate w-full">
                    {getLocalizedField(u, 'title', language)}
                  </span>
                </div>
                
                {isActive && <CheckCircle className="text-emerald-500 shrink-0 ml-1" size={18} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
