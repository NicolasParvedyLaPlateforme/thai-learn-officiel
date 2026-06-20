import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import { playThaiTTS } from '../../lib/tts';
import IconImage from '../ui/IconImage';
import { useProgressStore } from '../../lib/store';
import { getLevelSplit } from '../../lib/levelSplits';
import { LessonPathMap } from './LessonPathMap';
import SharedLessonModal from '../ui/SharedLessonModal';

interface LearnLessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  modalLevel: number;
  setModalLevel: (level: number) => void;
  language: string;
  lessonLevels: Record<string, number>;
  lessonStars: Record<string, number[]>;
  resetLessonLevel: (lessonId: string) => void;
  reviewStats: Record<string, Record<number, any>>;
  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean, isPart?: boolean, isFullLongLevel?: boolean, partIndex?: number | null) => { xp: number, maxXp: number, isFirstTime: boolean, key: string };
}

export default function LearnLessonModal({
  isOpen,
  onOpenChange,
  selectedLesson: selectedLessonProp,
  modalLevel,
  setModalLevel,
  language,
  lessonLevels,
  lessonStars,
  resetLessonLevel,
  reviewStats,
  getExpectedXp
}: LearnLessonModalProps) {
  const [selectedLesson, setSelectedLesson] = useState(selectedLessonProp);
  const [playFullLevel, setPlayFullLevel] = useState(false);
  const [manualPartIndex, setManualPartIndex] = useState<number | null>(null);
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);
  
  useEffect(() => {
    if (selectedLessonProp) {
      setSelectedLesson(selectedLessonProp);
    }
  }, [selectedLessonProp]);

  useEffect(() => {
    setPlayFullLevel(false);
    setManualPartIndex(null);
  }, [modalLevel]);

  if (!selectedLesson) return null;

  const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
  const wordCount = selectedLesson.lesson.words?.length || 0;
  const stepsCount = 10 + wordCount + (selectedLesson.lesson.phrases?.length || 0);
  
  let secsPerStep = 5;
  if (modalLevel <= 1) secsPerStep = 5;
  else if (modalLevel <= 3) secsPerStep = 7;
  else if (modalLevel <= 6) secsPerStep = 10;
  else if (modalLevel === 7) secsPerStep = 20;
  else secsPerStep = 40;

  let estimatedSecs = stepsCount * secsPerStep;
  let estimatedMins = Math.ceil(estimatedSecs / 60);
  
  if (selectedLesson.lesson.isReview) {
    estimatedMins = (modalLevel + 1) * 2;
  } else if (modalLevel === 10) {
    estimatedMins = 20;
  } else {
    if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
    else estimatedMins = Math.max(1, estimatedMins);
  }

  const totalParts = getLevelSplit(modalLevel, selectedLesson.lesson);
  const partsKey = `${selectedLesson.lesson.id}_level-${modalLevel}`;
  const completedParts = lessonPartsCompleted[partsKey] || [];
  const isLevelFullyCompleted = currentProgress > modalLevel || completedParts.length >= totalParts;
  const showSlices = totalParts > 1 && isLevelFullyCompleted && !playFullLevel;
  
  const isPlayingPart = totalParts > 1 && !playFullLevel;
  const nextUncompletedPart = completedParts.length < totalParts ? completedParts.length : 0;
  const selectedPartIndex = playFullLevel ? -1 : (manualPartIndex !== null ? manualPartIndex : nextUncompletedPart);

  const isReviewOrBilan = selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const { xp: expectedXp, maxXp, isFirstTime } = getExpectedXp(
    selectedLesson.lesson.id, 
    modalLevel, 
    !!isReviewOrBilan,
    isPlayingPart,
    !isPlayingPart && (modalLevel === 7 || modalLevel === 8),
    selectedPartIndex >= 0 ? selectedPartIndex : 0
  );

  // Mastery Logic
  const isUnlockedMastery = currentProgress >= 10;
  const isSelectedMastery = modalLevel === 10;
  const starsArrayMastery = lessonStars[selectedLesson.lesson.id] || Array(11).fill(0);
  const earnedStarsMastery = starsArrayMastery[10] || 0;
  const isCompletedMastery = isUnlockedMastery && earnedStarsMastery > 0;

  return (
    <SharedLessonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      language={language}
      isReviewOrMastery={selectedLesson.lesson.isReview || modalLevel === 10}
      isMastery={modalLevel === 10}
      modalLevel={modalLevel}
      lessonId={selectedLesson.lesson.id}
      reviewStats={reviewStats}
      footer={
        <>
          {selectedLesson.isCompleted && (
            <div className="flex gap-3">
              <Link
                href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Pencil size={16} className="mr-2" />
                {getTranslation('auto.writing', language)}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2 w-full mt-1 relative">
            <Link
              href={(totalParts > 1 && !playFullLevel)
                ? `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${selectedPartIndex}&totalParts=${totalParts}` 
                : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
              className={`flex-1 py-4 xl:py-4 md:py-3 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all ${selectedLesson.unitColor}`}
            >
              {getTranslation('auto.start_lesson', language)}
            </Link>
          </div>
        </>
      }
    >
      <div className="px-7 pt-2 flex flex-col">
        <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8 w-full">
                {totalParts > 1 && (
                  <div className="flex flex-col items-center w-full mb-8">
                    <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-6 text-center">
                      CHOISISSEZ UNE PARTIE
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
                              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={`text-[8px] font-black ${isSelected ? 'fill-white' : (isPartCompleted ? 'fill-white' : 'fill-slate-400')}`}>
                                P{i + 1}
                              </text>
                            </g>
                          );
                        })}
                        
                        <circle cx="50" cy="50" r="18" className={`${playFullLevel ? `${selectedLesson.unitText} fill-current ring-2 ${selectedLesson.unitColor.replace('bg-', 'ring-')}` : 'fill-white'} stroke-white stroke-[3] ${isLevelFullyCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'} transition-colors`} 
                          onClick={() => { if(isLevelFullyCompleted) setPlayFullLevel(true); }}
                        />
                        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className={`text-[6.5px] font-black ${playFullLevel ? 'fill-white' : (isLevelFullyCompleted ? 'fill-slate-800' : 'fill-slate-400')} pointer-events-none`}>
                          ENTIER
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
                                  La Suite
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
                      Niveau entier
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
                             Partie {i + 1}
                           </button>
                         )
                      })}
                    </div>
                  </div>
                )}

                <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
                  {playFullLevel ? "NIVEAU ENTIER" : totalParts > 1 ? `PARTIE ${selectedPartIndex + 1}` : "DÉTAILS"}
                </h4>
                
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-100 rounded-2xl flex-1">
                    <BookOpen size={20} className="text-slate-400 mb-2" />
                    <span className="text-xl font-black text-slate-700">{playFullLevel ? stepsCount : Math.ceil(stepsCount/totalParts)}</span>
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
                    <span className="text-xl font-black text-slate-700">{playFullLevel ? estimatedMins : Math.max(1, Math.ceil(estimatedMins/totalParts))}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">min</span>
                  </div>
                </div>
        </div>
      </div>
    </SharedLessonModal>
  );
}
