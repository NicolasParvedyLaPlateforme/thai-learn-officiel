import React from 'react';

interface LessonPartsSelectorProps {
  totalParts: number;
  completedParts: number[];
  selectedPartIndex: number;
  playFullLevel: boolean;
  setPlayFullLevel: (playFull: boolean) => void;
  setManualPartIndex: (index: number) => void;
  selectedLesson: { unitColor: string; unitText: string };
  isLevelFullyCompleted: boolean;
  language: string;
}

export function LessonPartsSelector({
  totalParts,
  completedParts,
  selectedPartIndex,
  playFullLevel,
  setPlayFullLevel,
  setManualPartIndex,
  selectedLesson,
  isLevelFullyCompleted,
  language
}: LessonPartsSelectorProps) {
  if (totalParts <= 1) return null;

  return (
    <div className="flex flex-col items-center w-full mb-8">
      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-6 text-center">
        {language === 'en' ? 'CHOOSE A PART' : 'CHOISISSEZ UNE PARTIE'}
      </h4>

      <div className="relative w-48 h-48 mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
          {Array.from({ length: totalParts }).map((_, i) => {
            const isPartCompleted = completedParts.includes(i);
            const isSelected = selectedPartIndex === i;
            const angle = 360 / totalParts;
            const startAngle = i * angle - 90;
            const endAngle = (i + 1) * angle - 90;
            
            const x1 = 50 + 48 * Math.cos(Math.PI * startAngle / 180);
            const y1 = 50 + 48 * Math.sin(Math.PI * startAngle / 180);
            const x2 = 50 + 48 * Math.cos(Math.PI * endAngle / 180);
            const y2 = 50 + 48 * Math.sin(Math.PI * endAngle / 180);
            const largeArc = angle > 180 ? 1 : 0;
            
            const pathData = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            const midAngle = startAngle + angle / 2;
            const textR = 30;
            const tx = 50 + textR * Math.cos(Math.PI * midAngle / 180);
            const ty = 50 + textR * Math.sin(Math.PI * midAngle / 180);

            const baseColorClass = "fill-slate-100 text-slate-100";
            const colorClass = isSelected ? `${selectedLesson.unitText} fill-current` : baseColorClass;
            const isAccessible = isLevelFullyCompleted || i <= completedParts.length;

            return (
              <g 
                key={i} 
                onClick={() => { if(isAccessible) { setPlayFullLevel(false); setManualPartIndex(i); } }}
                className={`${isAccessible ? 'cursor-pointer hover:opacity-90' : 'opacity-50 cursor-not-allowed'} transition-opacity`}
                style={isSelected ? { transform: `scale(1.05)`, transformOrigin: '50px 50px' } : {}}
              >
                <path d={pathData} className={`${colorClass} stroke-white stroke-[3]`} />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={`text-[9px] font-black ${isSelected ? 'fill-white' : (isPartCompleted ? 'fill-white' : 'fill-slate-400')}`}>
                  {i + 1}
                </text>
              </g>
            );
          })}
          
          <circle cx="50" cy="50" r="18" className={`${playFullLevel ? `${selectedLesson.unitText} fill-current ring-2 ${selectedLesson.unitColor.replace('bg-', 'ring-')}` : 'fill-white'} stroke-white stroke-[3] ${isLevelFullyCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'} transition-colors`} 
            onClick={() => { if(isLevelFullyCompleted) setPlayFullLevel(true); }}
          />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className={`text-[6.5px] font-black ${playFullLevel ? 'fill-white' : (isLevelFullyCompleted ? 'fill-slate-800' : 'fill-slate-400')} pointer-events-none`}>
            {language === 'en' ? 'FULL' : 'ENTIER'}
          </text>
        </svg>

        {(() => {
          let tx = 50;
          let ty = 50;
          let midAngle = -90; // Default for ENTIER
          
          if (!isLevelFullyCompleted) {
            const nextPart = completedParts.length;
            const angle = 360 / totalParts;
            const startAngle = nextPart * angle - 90;
            midAngle = startAngle + angle / 2;
            const tooltipR = 64; // Distance from center (outside the pie)
            tx = 50 + tooltipR * Math.cos(Math.PI * midAngle / 180);
            ty = 50 + tooltipR * Math.sin(Math.PI * midAngle / 180);
          } else {
            const tooltipR = 26; // Above the center circle
            tx = 50 + tooltipR * Math.cos(Math.PI * midAngle / 180);
            ty = 50 + tooltipR * Math.sin(Math.PI * midAngle / 180);
          }

          const theta = (midAngle + 180) * Math.PI / 180;
          const cx = Math.cos(theta);
          const cy = Math.sin(theta);
          const scale = Math.min(28 / Math.max(Math.abs(cx), 0.001), 10 / Math.max(Math.abs(cy), 0.001));
          const ptrX = cx * (scale + 2);
          const ptrY = cy * (scale + 2);

          return (
            <div 
              className="absolute z-20 pointer-events-none drop-shadow-md"
              style={{
                left: `${tx}%`,
                top: `${ty}%`
              }}
            >
              <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                <div className="animate-bounce flex items-center justify-center relative">
                  <div 
                    className="absolute w-2.5 h-2.5 bg-[#10B981] rounded-[1px]"
                    style={{
                      transform: `translate(${ptrX}px, ${ptrY}px) rotate(45deg)`
                    }}
                  />
                  <div className="relative z-10 bg-[#10B981] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap shadow-sm">
                    {language === 'en' ? 'Next' : 'La Suite'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <button
        onClick={() => { if(isLevelFullyCompleted) setPlayFullLevel(true); }}
        disabled={!isLevelFullyCompleted}
        className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition-all flex items-center gap-2 mb-6
          ${playFullLevel ? `${selectedLesson.unitColor} border-transparent text-white shadow-lg` : 
            isLevelFullyCompleted ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 cursor-pointer' : 
            'bg-transparent border-slate-100 text-slate-600 opacity-50 cursor-not-allowed'}
        `}
      >
        <div className={`w-3 h-3 rounded-full ${playFullLevel ? 'bg-white' : 'bg-slate-300'}`}></div>
        {language === 'en' ? 'Full Level' : 'Niveau entier'}
      </button>
      
      <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
        {Array.from({ length: totalParts }).map((_, i) => {
           const isSelected = selectedPartIndex === i;
           return (
             <button 
               key={i} 
               onClick={() => {
                 if (isLevelFullyCompleted || i <= completedParts.length) {
                   setPlayFullLevel(false);
                   setManualPartIndex(i);
                 }
               }}
               className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide cursor-pointer transition-colors
               ${isSelected ? `${selectedLesson.unitColor} text-white` : 
                 (isLevelFullyCompleted || i <= completedParts.length) ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}
             `}>
               {language === 'en' ? 'Part ' : 'Partie '}{i + 1}
             </button>
           )
        })}
      </div>
    </div>
  );
}
