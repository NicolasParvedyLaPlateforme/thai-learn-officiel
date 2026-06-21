import { BookOpen, Star, Clock } from 'lucide-react';

interface LessonDetailsStatsProps {
  stepsCount: number;
  expectedXp: number;
  maxXp: number;
  isFirstTime: boolean;
  estimatedMins: number;
  title?: string;
}

export function LessonDetailsStats({
  stepsCount,
  expectedXp,
  maxXp,
  isFirstTime,
  estimatedMins,
  title = "DÉTAILS"
}: LessonDetailsStatsProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
        {title}
      </h4>
      
      <div className="flex items-center justify-center gap-4 w-full">
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-100 rounded-2xl flex-1">
          <BookOpen size={20} className="text-slate-400 mb-2" />
          <span className="text-xl font-black text-slate-700">{stepsCount}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">étapes</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4 bg-amber-50 border border-amber-100 rounded-2xl flex-1">
          <Star size={20} className="text-amber-500 mb-2" />
          <span className="text-xl font-black text-amber-600">
            {!isFirstTime && maxXp > expectedXp && (
              <span className="line-through text-amber-400/60 mr-1 opacity-80 text-sm">+{maxXp}</span>
            )}
            +{expectedXp}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold mt-1">XP</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4 bg-blue-50 border border-blue-100 rounded-2xl flex-1">
          <Clock size={20} className="text-blue-500 mb-2" />
          <span className="text-xl font-black text-slate-700">{Math.max(1, estimatedMins)}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">min</span>
        </div>
      </div>
    </div>
  );
}
