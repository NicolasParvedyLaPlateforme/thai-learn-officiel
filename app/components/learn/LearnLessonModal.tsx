import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import { playThaiTTS } from '../../lib/tts';
import IconImage from '../../components/IconImage';
import { useProgressStore } from '../../lib/store';
import { getLevelSplit } from '../../lib/levelSplits';

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
  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean, isPart?: boolean, isFullLongLevel?: boolean, partIndex?: number | null) => { xp: number, isFirstTime: boolean, key: string };
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
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);
  
  useEffect(() => {
    if (selectedLessonProp) {
      setSelectedLesson(selectedLessonProp);
    }
  }, [selectedLessonProp]);

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
  const partIndexToPlay = (isPlayingPart && completedParts.length < totalParts) ? completedParts.length : 0;

  const isReviewOrBilan = selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const { xp: expectedXp, isFirstTime } = getExpectedXp(
    selectedLesson.lesson.id, 
    modalLevel, 
    !!isReviewOrBilan,
    isPlayingPart,
    !isPlayingPart && (modalLevel === 7 || modalLevel === 8),
    partIndexToPlay
  );

  // Mastery Logic
  const isUnlockedMastery = currentProgress >= 10;
  const isSelectedMastery = modalLevel === 10;
  const starsArrayMastery = lessonStars[selectedLesson.lesson.id] || Array(11).fill(0);
  const earnedStarsMastery = starsArrayMastery[10] || 0;
  const isCompletedMastery = isUnlockedMastery && earnedStarsMastery > 0;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
        <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[95vh] outline-none">
          <Drawer.Title className="sr-only">Course Details</Drawer.Title>
          <Drawer.Description className="sr-only">Choose a level or start practice</Drawer.Description>
          <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
            <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
          </div>
          
          <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar pt-6">
            <div className="w-full shrink-0 z-0">
              <div className={`w-full h-[120px] bg-amber-50 flex items-center justify-center relative overflow-hidden`}>
                {selectedLesson.lesson.imageUrl ? (
                  <IconImage src={selectedLesson.lesson.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <BookOpen size={48} className="text-slate-200" />
                )}
              </div>
            </div>

            <div className="p-6 pt-5 pb-2 text-center flex flex-col items-center">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
                {getLocalizedField(selectedLesson.lesson, 'title', language)}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                {getLocalizedField(selectedLesson.lesson, 'description', language)}
              </p>

              <div className="grid grid-cols-5 gap-y-4 gap-x-2 w-full mb-6 max-w-[16rem] mx-auto">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((levelIndex) => {
                  const starsArray = lessonStars[selectedLesson.lesson.id] || Array(10).fill(0);
                  const earnedStars = starsArray[levelIndex] || 0;

                  const isAccessible = levelIndex <= currentProgress;
                  const isCompleted = levelIndex < currentProgress;
                  const isSelected = modalLevel === levelIndex;
                  const isCurrent = levelIndex === currentProgress;

                  const partsTotal = getLevelSplit(levelIndex, selectedLesson.lesson);
                  const partsKey = `${selectedLesson.lesson.id}_level-${levelIndex}`;
                  const completedSlices = lessonPartsCompleted[partsKey]?.length || 0;

                  let circleStyle = {};
                  if (partsTotal > 1) {
                    const angle = 360 / partsTotal;
                    let stops = [];
                    for (let i = 0; i < partsTotal; i++) {
                      // yellow-200 / slate-100
                      const color = i < completedSlices ? '#fef08a' : '#f1f5f9';
                      stops.push(`${color} ${i * angle}deg ${(i + 1) * angle}deg`);
                    }
                    circleStyle = { background: `conic-gradient(${stops.join(', ')})` };
                  }

                  return (
                    <button
                      key={levelIndex}
                      onClick={() => {
                        if (isAccessible) {
                          setModalLevel(levelIndex);
                        }
                      }}
                      className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer disabled:opacity-80`}
                      disabled={!isAccessible}
                    >
                      <div 
                        style={circleStyle}
                        className={`
                        w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-b-2 border-[#cbcbcb] overflow-hidden relative
                        ${isSelected ? 'scale-110 ring-[2px] ring-offset-[3px] ring-yellow-500 shadow-lg z-10' : ''}
                        ${isCompleted ? `${partsTotal > 1 ? '' : 'bg-[oklch(0.96_0.06_88.64)]'} border border-amber-500 shadow-sm text-amber-900 ` :
                            isCurrent ? `${partsTotal > 1 ? '' : 'bg-white'} border-[3px] shadow-sm ${selectedLesson.unitBorder} ${selectedLesson.unitText}` :
                              `${partsTotal > 1 ? '' : 'bg-slate-50'} border border-slate-200 text-slate-300`
                          }
                      `}>
                        {partsTotal > 1 && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                            {Array.from({length: partsTotal}).map((_, i) => {
                              const angle = (i * 360) / partsTotal;
                              return <line key={i} x1="50" y1="50" x2="50" y2="-10" stroke="white" strokeWidth="4" transform={`rotate(${angle} 50 50)`} />
                            })}
                          </svg>
                        )}
                        <div className="z-10 flex items-center justify-center pointer-events-none">
                          {isCompleted ? (
                          <div className="flex flex-col items-center gap-[1px]">
                            <div className="flex gap-[1px]">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star key={`top-${i}`} className={`stroke-[1.5] ${i < earnedStars ? "fill-yellow-300 stroke-amber-600 drop-shadow-sm" : "fill-amber-500/50 stroke-amber-500/50"}`} size={11} />
                              ))}
                            </div>
                            <div className="flex gap-[1px]">
                              {Array.from({ length: 2 }).map((_, i) => (
                                <Star key={`bottom-${i}`} className={`stroke-[1.5] ${i + 3 < earnedStars ? "fill-yellow-300 stroke-amber-600 drop-shadow-sm" : "fill-amber-500/50 stroke-amber-500/50"}`} size={11} />
                              ))}
                            </div>
                          </div>
                        ) : isCurrent ? (
                          <span className="font-extrabold text-lg">{levelIndex + 1}</span>
                        ) : (
                          <Lock size={16} className="stroke-[2.5]" />
                        )}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black tracking-widest uppercase
                          ${isCurrent ? selectedLesson.unitText : isCompleted ? 'text-amber-500' : 'text-slate-300'}
                        `}>
                        {isCurrent ? (getTranslation('auto.in_progress', language)) : `NIV. ${levelIndex + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-2 mb-6 mt-2">
                <button
                  onClick={() => {
                    if (isUnlockedMastery) setModalLevel(10);
                  }}
                  className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer disabled:opacity-80`}
                  disabled={!isUnlockedMastery}
                >
                  <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                      ${isSelectedMastery ? `scale-110 ring-[4px] ring-offset-[3px] shadow-lg relative z-10 ring-amber-400/50` : ''}
                      ${isUnlockedMastery
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 shadow-md text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-300'
                    }
                    `}>
                    {isUnlockedMastery ? (
                      isCompletedMastery ? (
                        <div className="flex flex-col items-center gap-[1px]">
                          <div className="flex gap-[1px]">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Star key={`top-${i}`} className={`stroke-[1.5] ${i < earnedStarsMastery ? "fill-yellow-300 stroke-amber-700 drop-shadow-sm" : "fill-white/30 stroke-white/30"}`} size={12} />
                            ))}
                          </div>
                          <div className="flex gap-[1px]">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <Star key={`bottom-${i}`} className={`stroke-[1.5] ${i + 3 < earnedStarsMastery ? "fill-yellow-300 stroke-amber-700 drop-shadow-sm" : "fill-white/30 stroke-white/30"}`} size={12} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Crown size={24} className="fill-current stroke-[2]" />
                      )
                    ) : (
                      <Lock size={20} className="stroke-[2.5]" />
                    )}
                  </div>
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isUnlockedMastery ? 'text-amber-500' : 'text-slate-300'}`}>
                    {getTranslation('auto.mastery', language)}
                  </span>
                </button>
              </div>
            </div>

            <div className="px-7 pt-2 flex flex-col">
              <div className="flex items-center justify-center gap-3 mb-8 border-b border-slate-100 pb-8 w-full flex-wrap">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold whitespace-nowrap shadow-sm bg-white">
                  <Clock size={16} className="text-slate-500" />
                  {estimatedMins} min
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-bold shadow-sm whitespace-nowrap">
                  <Star size={16} className="fill-amber-500 text-amber-600" />
                  {isFirstTime ? `+${expectedXp} XP` : (
                    <>
                      <span className="line-through text-amber-400/60 mr-1 opacity-80">+{
                        isPlayingPart 
                          ? (modalLevel <= 6 ? 10 : modalLevel === 7 ? 20 : modalLevel === 8 ? 30 : 50)
                          : (modalLevel <= 6 ? 30 : modalLevel === 7 ? 50 : modalLevel === 8 ? 100 : modalLevel === 9 ? 300 : 1000)
                      }</span>
                      <span>+{expectedXp} XP</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                    {selectedLesson.lesson.isReview || modalLevel === 10
                      ? (modalLevel === 10
                        ? (getTranslation('auto.stats_mastery', language))
                        : (`${getTranslation('auto.stats', language) || 'Stats'} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`))
                      : (`${getTranslation('auto.vocabulary', language)} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`)
                    }
                  </h4>
                  {!selectedLesson.lesson.isReview && modalLevel !== 10 && (
                    <div className="bg-blue-50/50 text-blue-700 font-black text-[10px] uppercase px-2 py-0.5 rounded">Chips</div>
                  )}
                </div>

                {selectedLesson.lesson.isReview || modalLevel === 10 ? (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const stats = reviewStats?.[selectedLesson.lesson.id]?.[modalLevel];
                      if (stats?.bestTime !== undefined && stats.bestTime !== null) {
                        const m = Math.floor(stats.bestTime / 60);
                        const s = stats.bestTime % 60;
                        return (
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                              <Clock size={20} className="stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-emerald-800 font-bold text-[15px]">
                                {getTranslation('auto.best_time', language)}
                              </span>
                              <span className="text-emerald-600 font-medium text-sm">
                                {m}min {s}s
                              </span>
                            </div>
                          </div>
                        );
                      } else if (stats?.maxPercentage !== undefined && stats.maxPercentage !== null) {
                        return (
                          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-rose-800 font-bold text-[15px]">
                                {getTranslation('auto.best_survival', language)}
                              </span>
                              <span className="text-rose-600 font-medium text-sm">
                                {stats.maxPercentage}%
                              </span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">
                            {getTranslation('auto.not_completed_yet', language)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 pb-2">
                    {selectedLesson.lesson.words?.filter((w: any) => w.id !== 'w_dots').map((w: any) => (
                      <button onClick={() => playThaiTTS(w.th)} key={w.id} className={`group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer active:scale-95 ${selectedLesson.unitBorder.replace('border-', 'hover:border-')} ${selectedLesson.unitColor.replace('bg-', 'hover:bg-').replace('500', '100')}`}>
                        <span className={`font-bold text-[17px] ${selectedLesson.unitText}`}>{w.th}</span>
                        <span className="text-slate-500 text-[13px] font-medium">({getLocalizedField(w, '', language)})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            {selectedLesson.isCompleted && (
              <div className="flex gap-3">
                <Link
                  href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                  className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Pencil size={16} className="mr-2" />
                  {getTranslation('auto.writing', language)}
                </Link>
                <button
                  onClick={() => {
                    resetLessonLevel(selectedLesson.lesson.id);
                    setModalLevel(0);
                  }}
                  className="flex-1 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} className="mr-2" />
                  {getTranslation('auto.reset', language)}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 w-full mt-1 relative">
              {showSlices ? (
                <div className="flex-1 relative h-[56px] xl:h-[60px] md:h-[52px]">
                  <div className="absolute inset-0 flex gap-1">
                    {Array.from({ length: totalParts }).map((_, i) => {
                      const isPartCompleted = completedParts.includes(i);
                      const isNextToPlay = !isLevelFullyCompleted && i === completedParts.length;
                      const canPlay = isLevelFullyCompleted || i <= completedParts.length;
                      
                      let sliceColor = selectedLesson.unitColor;
                      if (!isPartCompleted && !isNextToPlay) {
                        sliceColor = `${selectedLesson.unitColor} opacity-50`;
                      } else if (!isPartCompleted && isNextToPlay) {
                        sliceColor = `${selectedLesson.unitColor} opacity-90`;
                      }

                      return (
                        <Link
                          key={i}
                          href={canPlay ? `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${i}&totalParts=${totalParts}` : '#'}
                          className={`flex-1 rounded-sm first:rounded-l-xl last:rounded-r-xl transition-all ${sliceColor} ${canPlay ? 'hover:opacity-80 active:opacity-70 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-[17px] text-white pointer-events-none drop-shadow-sm">
                    {getTranslation('auto.start_lesson', language)}
                  </div>
                </div>
              ) : (
                <Link
                  href={(totalParts > 1 && completedParts.length < totalParts && !playFullLevel)
                    ? `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${completedParts.length}&totalParts=${totalParts}` 
                    : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
                  className={`flex-1 py-4 xl:py-4 md:py-3 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all ${selectedLesson.unitColor}`}
                >
                  {getTranslation('auto.start_lesson', language)}
                </Link>
              )}
              
              {isLevelFullyCompleted && totalParts > 1 && (
                <button 
                  onClick={() => setPlayFullLevel(!playFullLevel)}
                  className={`absolute -top-10 right-0 flex items-center justify-center transition-all hover:opacity-70 active:scale-95 text-slate-500`}
                  title="Toggle mode"
                >
                  {playFullLevel ? <Circle size={24} /> : <PieChart size={24} />}
                </button>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
