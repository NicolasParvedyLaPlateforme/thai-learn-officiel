import React, { useRef, useState } from 'react';
import { Play, PlayCircle, Star, Target, CheckCircle2, Lock, Clock, GraduationCap, Medal, Pencil, RotateCcw, BookOpen, X, Users, ChevronLeft, Flag, Crown, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import IconImage from './IconImage';
import { playThaiTTS } from '../lib/tts';
import { formatCombiningChar } from '../lib/alphabet-utils';
import { m as motion , AnimatePresence } from "motion/react";
import { DailyQuestsWidget } from './DailyQuestsWidget';
import { ConversationObjectiveWidget } from './ConversationObjectiveWidget';
import { LeaderboardWidget } from './LeaderboardWidget';
import { useProgressStore } from '../lib/store';
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';

interface Unit {
  id: string;
  title: string;
  titleEn?: string;
  colorClass: string;
  textClass: string;
  startIndex?: number;
  endIndex?: number;
  lessons?: any[];
}

interface DesktopSidebarRightProps {
  units: Unit[];
  activeUnitIndex: number;
  onUnitSelect: (index: number) => void;
  language: string;
  globalSuggested?: any;
  lessons: any[];
  lessonLevels: Record<string, number>;
  mounted: boolean;
  maxLevelPerLesson?: number;
  suggestionType?: 'learn' | 'alphabet' | string;
  // Modal props
  selectedLesson?: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  onCloseLesson?: () => void;
  modalLevel?: number;
  setModalLevel?: (level: number) => void;
  lessonStars?: Record<string, number[]>;
  resetLessonLevel?: (lessonId: string) => void;
  questsCategory?: 'learn' | 'alphabet' | 'speak';
  showUnitsList?: boolean;
  setShowUnitsList?: (show: boolean) => void;
  reviewStats?: Record<string, Record<number, { bestTime?: number, maxPercentage?: number }>>;
}

export function DesktopSidebarRight({
  units,
  activeUnitIndex,
  onUnitSelect,
  language,
  globalSuggested,
  lessons,
  lessonLevels,
  mounted,
  maxLevelPerLesson = 10,
  suggestionType = 'learn',
  selectedLesson,
  onCloseLesson,
  modalLevel = 0,
  setModalLevel,
  lessonStars,
  resetLessonLevel,
  questsCategory = 'learn',
  showUnitsList: externalShowUnitsList,
  setShowUnitsList: externalSetShowUnitsList,
  reviewStats
}: DesktopSidebarRightProps) {
  const [internalShowUnitsList, setInternalShowUnitsList] = useState(false);
  const showUnitsList = externalShowUnitsList !== undefined ? externalShowUnitsList : internalShowUnitsList;
  const setShowUnitsList = externalSetShowUnitsList || setInternalShowUnitsList;

  const [playFullLevel, setPlayFullLevel] = useState(false);
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const levelsScrollRef = useRef<HTMLDivElement>(null);

  const [isBrave, setIsBrave] = useState(false);
  React.useEffect(() => {
    const checkBrave = async () => {
      if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
        setIsBrave(true);
      }
    };
    checkBrave();
  }, []);

  const renderContent = () => {
    if (selectedLesson && setModalLevel && lessonStars && resetLessonLevel && onCloseLesson) {
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

      const totalParts = suggestionType === 'learn' ? getLevelSplit(modalLevel) : 1;
      const partsKey = `${selectedLesson.lesson.id}_level-${modalLevel}`;
      const completedParts = lessonPartsCompleted[partsKey] || [];
      const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
      const isLevelFullyCompleted = currentProgress > modalLevel || completedParts.length >= totalParts;
      const showSlices = totalParts > 1 && (!playFullLevel || !isLevelFullyCompleted);

      return (
        <motion.div
          key="lesson-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full flex flex-col relative"
        >
          <div className="w-full h-full flex flex-col relative overflow-hidden">
            {/* Removed Close Button */}

            {/* Scrollable Content */}
            <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar p-3">
              {/* Image Header */}
              <div className="w-full shrink-0 z-0">
                <div className={`w-full h-[180px] relative border-b border-slate-100 flex items-center justify-center ${suggestionType === 'alphabet' ? selectedLesson.unitColor : (!selectedLesson.lesson.imageUrl ? 'bg-amber-50' : '')} overflow-hidden`}>
                  {suggestionType === 'alphabet' ? (
                    <>
                      <div className="text-6xl text-white font-thai tracking-widest drop-shadow-sm font-bold flex items-center justify-center h-full pt-2">
                        {selectedLesson.lesson.items?.map((i: any) => formatCombiningChar(i.letter)).join('')}
                      </div>
                      <div className={`absolute -bottom-10 -right-10 opacity-20 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
                        <BookOpen size={160} />
                      </div>
                    </>
                  ) : selectedLesson.lesson.imageUrl ? (
                    <IconImage src={selectedLesson.lesson.imageUrl} alt="" fill className="object-cover" />
                  ) : (
                    <BookOpen size={48} className="text-slate-200" />
                  )}
                </div>
              </div>

              <div className="p-6 pt-5 pb-5 flex flex-col">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
                  {suggestionType === 'alphabet' && (selectedLesson.lesson.type === 'consonant' || selectedLesson.lesson.type === 'vowel')
                    ? `${getTranslation(selectedLesson.lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${selectedLesson.lesson.id.split('-').pop()}`
                    : getLocalizedField(selectedLesson.lesson, 'title', language)}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {getLocalizedField(selectedLesson.lesson, 'description', language)}
                </p>

                {/* Levels Grid */}
                <div className="grid grid-cols-5 gap-y-4 gap-x-2 w-full mb-6 max-w-[17rem] mx-auto">
                  {Array.from({ length: maxLevelPerLesson }).map((_, levelIndex) => {
                    const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
                    const starsArray = lessonStars[selectedLesson.lesson.id] || Array(maxLevelPerLesson).fill(0);
                    const earnedStars = starsArray[levelIndex] || 0;

                    const isAccessible = levelIndex <= currentProgress;
                    const isCompleted = levelIndex < currentProgress;
                    const isSelected = modalLevel === levelIndex;
                    const isCurrent = levelIndex === currentProgress;

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
                        <div className={`
                          w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-b-2 border-[#cbcbcb]
                          ${isSelected ? 'scale-110 ring-[2px] ring-offset-[3px] ring-yellow-500 shadow-lg relative z-10' : ''}
                          ${isCompleted ? 'bg-[oklch(0.96_0.06_88.64)] border border-amber-500 shadow-sm text-amber-900 ' :
                            isCurrent ? `bg-white border-[3px] shadow-sm ${selectedLesson.unitBorder} ${selectedLesson.unitText}` :
                              'bg-slate-50 border border-slate-200 text-slate-300'
                          }
                        `}>
                          {isCompleted ? (
                            <div className="flex flex-col items-center gap-[1px]">
                              <div className="flex gap-[1px]">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Star key={`top-${i}`} className={`stroke-[1.5] ${i < earnedStars ? "fill-yellow-300 stroke-brown-600 drop-shadow-sm" : "fill-amber-500/50 stroke-amber-500/50"}`} size={11} />
                                ))}
                              </div>
                              <div className="flex gap-[1px]">
                                {Array.from({ length: 2 }).map((_, i) => (
                                  <Star key={`bottom-${i}`} className={`stroke-[1.5] ${i + 3 < earnedStars ? "fill-yellow-300 stroke-brown-600 drop-shadow-sm" : "fill-amber-500/50 stroke-amber-500/50"}`} size={11} />
                                ))}
                              </div>
                            </div>
                          ) : isCurrent ? (
                            <span className="font-extrabold text-lg">{levelIndex + 1}</span>
                          ) : (
                            <Lock size={16} className="stroke-[2.5]" />
                          )}
                        </div>
                        <span className={`text-[9px] font-black tracking-widest uppercase
                          ${isCurrent ? selectedLesson.unitText : isCompleted ? 'text-amber-500' : 'text-slate-300'}
                        `}>
                          {isCurrent ? (getTranslation('auto.in_progress', language)) : `${getTranslation('auto.lvl', language)} ${levelIndex + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mastery Level Button */}
                {selectedLesson && suggestionType !== 'speak' && (() => {
                  const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
                  const isUnlocked = currentProgress >= 10;
                  const isSelected = modalLevel === 10;
                  const starsArray = lessonStars[selectedLesson.lesson.id] || Array(11).fill(0);
                  const earnedStars = starsArray[10] || 0;
                  const isCompleted = isUnlocked && earnedStars > 0;

                  return (
                    <div className="flex flex-col items-center gap-2 mb-6 mt-2">
                      <button
                        onClick={() => {
                          if (isUnlocked) setModalLevel(10);
                        }}
                        className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer disabled:opacity-80`}
                        disabled={!isUnlocked}
                      >
                        <div className={`
                          w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                          ${isSelected ? `scale-110 ring-[4px] ring-offset-[3px] shadow-lg relative z-10 ring-amber-400/50` : ''}
                          ${isUnlocked
                            ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 shadow-md text-white'
                            : 'bg-slate-50 border border-slate-200 text-slate-300'
                          }
                        `}>
                          {isUnlocked ? (
                            isCompleted ? (
                              <div className="flex flex-col items-center gap-[1px]">
                                <div className="flex gap-[1px]">
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <Star key={`top-${i}`} className={`stroke-[1.5] ${i < earnedStars ? "fill-yellow-300 stroke-amber-700 drop-shadow-sm" : "fill-white/30 stroke-white/30"}`} size={12} />
                                  ))}
                                </div>
                                <div className="flex gap-[1px]">
                                  {Array.from({ length: 2 }).map((_, i) => (
                                    <Star key={`bottom-${i}`} className={`stroke-[1.5] ${i + 3 < earnedStars ? "fill-yellow-300 stroke-amber-700 drop-shadow-sm" : "fill-white/30 stroke-white/30"}`} size={12} />
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
                        <span className={`text-[10px] font-black tracking-widest uppercase ${isUnlocked ? 'text-amber-500' : 'text-slate-300'}`}>
                          {getTranslation('auto.mastery', language)}
                        </span>
                      </button>
                    </div>
                  );
                })()}

                {(() => {
                  const { getExpectedXp } = useProgressStore.getState();
                  const lessonIdForXp = suggestionType === 'speak' ? `speak_${selectedLesson.lesson.id}` : selectedLesson.lesson.id;
                  const { xp: expectedXp, isFirstTime } = getExpectedXp(lessonIdForXp, modalLevel, selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan'));
                  
                  return (
                    <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-6 w-full flex-wrap">
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold whitespace-nowrap shadow-sm bg-white">
                        <Clock size={16} className="text-slate-500" />
                        {estimatedMins} min
                      </div>
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-bold shadow-sm whitespace-nowrap">
                        <Star size={16} className="fill-amber-500 text-amber-600" />
                        {isFirstTime ? `+${expectedXp} XP` : (
                          <>
                            <span className="line-through text-amber-400/60 mr-1 opacity-80">+{expectedXp === 5 ? 20 : expectedXp === 15 ? 50 : expectedXp === 25 ? 50 : expectedXp === 30 ? 100 : expectedXp === 45 ? 150 : expectedXp === 90 ? 300 : 200}</span>
                            <span>+{expectedXp} XP</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Vocab/Letters preview or Bilan Stats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                      {selectedLesson.lesson.isReview || modalLevel === 10
                        ? (modalLevel === 10
                          ? (getTranslation('auto.stats_mastery', language))
                          : (`${getTranslation('auto.stats', language) || 'Stats'} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`))
                        : suggestionType === 'alphabet'
                          ? (`${getTranslation('auto.letters', language)} (${selectedLesson.lesson.items?.length}) :`)
                          : suggestionType === 'speak'
                            ? (modalLevel === 1 ? getTranslation('auto.conversation_success_50', language) : getTranslation('auto.pronunciation_success_50', language))
                            : (`${getTranslation('auto.vocabulary', language)} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`)
                      }
                    </h4>
                    {!selectedLesson.lesson.isReview && modalLevel !== 10 && suggestionType !== 'speak' && (
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
                      {suggestionType === 'alphabet' ? (
                        selectedLesson.lesson.items?.slice(0, 10).map((i: any) => (
                          <button onClick={() => playThaiTTS(i.letter)} key={i.letter} className={`group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm hover:${selectedLesson.unitBorder} ${selectedLesson.unitHover} transition-colors cursor-pointer active:scale-95`}>
                            <span className={`${selectedLesson.unitText} group-hover:text-white text-[17px] font-thai transition-colors`}>{formatCombiningChar(i.letter)}</span>
                            <span className="text-slate-500 group-hover:text-white/90 text-[13px] font-medium transition-colors">({i.romanization})</span>
                          </button>
                        ))
                      ) : suggestionType === 'speak' ? (
                        <div className="flex flex-col gap-2 w-full">
                          {selectedLesson.lesson.phrases?.map((p: any) => (
                            <button onClick={() => playThaiTTS(p.th)} key={p.id} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col items-start gap-1 shadow-sm hover:${selectedLesson.unitBorder} ${selectedLesson.unitHover} transition-colors cursor-pointer active:scale-95 group`}>
                              <span className={`${selectedLesson.unitText} group-hover:text-white text-[15px] transition-colors font-bold text-left`}>{p.th}</span>
                              <span className="text-slate-500 group-hover:text-white/90 text-[13px] font-medium transition-colors text-left">{getLocalizedField(p, '', language)}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        selectedLesson.lesson.words?.filter((w: any) => w.id !== 'w_dots').map((w: any) => (
                          <button onClick={() => playThaiTTS(w.th)} key={w.id} className={`group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm hover:${selectedLesson.unitBorder} ${selectedLesson.unitHover} transition-colors cursor-pointer active:scale-95`}>
                            <span className={`${selectedLesson.unitText} group-hover:text-white text-[17px] transition-colors`}>{w.th}</span>
                            <span className="text-slate-500 group-hover:text-white/90 text-[13px] font-medium transition-colors">({getLocalizedField(w, '', language)})</span>
                          </button>
                        ))
                      )}
                      {suggestionType === 'alphabet' && selectedLesson.lesson.items && selectedLesson.lesson.items.length > 10 && (
                        <div className="shrink-0 border border-dashed border-slate-300 text-slate-400 rounded-[2rem] px-4 py-2 flex items-center justify-center font-medium text-[13px]">
                          +{selectedLesson.lesson.items.length - 10} {getTranslation('auto.others', language)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              {selectedLesson.isCompleted && suggestionType !== 'speak' && (
                <div className="flex gap-3 mb-1">
                  {suggestionType !== 'alphabet' && (
                    <Link
                      href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                      className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      <Pencil size={16} className="mr-2" />
                      {getTranslation('auto.writing', language)}
                    </Link>
                  )}
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
              {isBrave && suggestionType === 'speak' ? (
                <button
                  disabled
                  className={`w-full py-4 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center opacity-50 cursor-not-allowed bg-slate-400`}
                >
                  {getTranslation('auto.unavailable_on_brave', language)}
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full mt-1 relative">
                  {showSlices ? (
                    <div className="flex-1 flex overflow-hidden rounded-xl shadow-md h-[56px] xl:h-[60px] md:h-[52px]">
                      {Array.from({ length: totalParts }).map((_, i) => {
                        const isPartCompleted = completedParts.includes(i);
                        const isNextToPlay = !isLevelFullyCompleted && i === completedParts.length;
                        const canPlay = isLevelFullyCompleted || i <= completedParts.length;
                        
                        let sliceColor = 'bg-slate-200 text-slate-400';
                        if (isPartCompleted) {
                          sliceColor = selectedLesson.unitColor;
                        } else if (isNextToPlay) {
                          sliceColor = `${selectedLesson.unitColor} opacity-90`;
                        } else if (canPlay) {
                          sliceColor = 'bg-slate-300 text-slate-500';
                        }

                        const href = suggestionType === 'alphabet' 
                          ? `/alphabet/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` 
                          : suggestionType === 'speak' 
                            ? `/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` 
                            : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${i}&totalParts=${totalParts}`;

                        return (
                          <Link
                            key={i}
                            href={canPlay ? href : '#'}
                            className={`flex-1 flex items-center justify-center font-bold text-[15px] border-r border-white/30 last:border-r-0 transition-all ${sliceColor} ${canPlay ? 'hover:opacity-80 active:opacity-70 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                          >
                            {getTranslation('auto.start_lesson', language)}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <Link
                      href={suggestionType === 'alphabet' ? `/alphabet/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` : suggestionType === 'speak' ? `/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
                      className={`flex-1 py-4 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all ${selectedLesson.unitColor}`}
                    >
                      {getTranslation('auto.start_lesson', language)}
                    </Link>
                  )}
                  
                  {isLevelFullyCompleted && totalParts > 1 && (
                    <button 
                      onClick={() => setPlayFullLevel(!playFullLevel)}
                      className={`shrink-0 w-[56px] xl:w-[60px] md:w-[52px] h-[56px] xl:h-[60px] md:h-[52px] rounded-xl flex items-center justify-center border-2 border-slate-200 shadow-sm transition-all hover:bg-slate-50 active:scale-95 text-slate-500`}
                      title="Toggle mode"
                    >
                      {playFullLevel ? <Circle size={24} /> : <PieChart size={24} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (!showUnitsList) {
      return (
        <motion.div
          key="dashboard-view"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16 flex flex-col gap-6"
        >
          <button
            onClick={() => setShowUnitsList(true)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <BookOpen size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-slate-800 tracking-tight">
                  {getTranslation('auto.course_units', language)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {getTranslation('auto.change_or_view_units', language)}
                </span>
              </div>
            </div>
            <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-600 rotate-180 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="w-full flex flex-col gap-6">
            <DailyQuestsWidget category={questsCategory} />
            <ConversationObjectiveWidget />
            <LeaderboardWidget />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="units-view"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16"
      >
        <div className="w-full relative flex flex-col gap-4 group">
          <div className="flex items-center justify-between gap-3 mb-2 px-1 shrink-0">
            <div className="flex items-center gap-3 text-slate-800 font-bold">
              <BookOpen size={20} className="text-slate-400 shrink-0" />
              <h2 className="whitespace-nowrap text-lg text-slate-600">
                {getTranslation('auto.units', language)}
              </h2>
            </div>
            <button
              onClick={() => setShowUnitsList(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3 pb-6 w-full">
            {units.map((u, i) => {
              const isCurrent = i === activeUnitIndex;
              const status = isCurrent ? (getTranslation('auto.in_progress_1', language)) : '';
              const unitLessons = u.lessons ? u.lessons : lessons.slice(u.startIndex || 0, u.endIndex || 0);

              const hasSuggestion = globalSuggested?.type === suggestionType &&
                globalSuggested.id &&
                unitLessons.some((l: any) => l.id === globalSuggested.id);
              const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
              const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + (lessonLevels[l.id] || 0), 0) : 0;
              const progressPercent = mounted && maxLevelsInUnit > 0 ? Math.min(100, (completedLevelsInUnit / maxLevelsInUnit) * 100) : 0;
              const completedLessonsCount = mounted ? unitLessons.filter((l: any) => (lessonLevels[l.id] || 0) >= maxLevelPerLesson).length : 0;
              const totalLessonsCount = unitLessons.length;

              if (isCurrent) {
                return (
                  <div
                    key={u.id}
                    className={`w-full text-left rounded-2xl transition-all relative overflow-hidden flex flex-col p-4 shrink-0 bg-white border-2 cursor-default ${u.colorClass.replace('bg-', 'border-')} shadow-sm`}
                  >
                    {hasSuggestion && (
                      <span className="absolute top-3 right-3 w-3 h-3 bg-amber-400 border-2 border-white rounded-full z-10"></span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[16px] text-white ${u.colorClass} shadow-sm shrink-0`}>
                        {i + 1}
                      </div>
                      <div className="flex flex-col min-w-0 pr-2">
                        <h3 className="font-bold text-[15px] text-slate-800 truncate leading-tight mb-0.5">{getLocalizedField(u, 'title', language)}</h3>
                        <span className={`text-[13px] font-semibold ${u.textClass} tracking-tight`}>{status}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${u.colorClass}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="text-[12px] font-medium text-slate-400 select-none">
                      {completedLessonsCount}/{totalLessonsCount} {getTranslation('auto.lessons', language)}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={u.id}
                  onClick={() => onUnitSelect(i)}
                  className="w-full text-left rounded-2xl transition-all relative flex flex-row items-center p-3 shrink-0 bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 active:scale-[0.98] group/btn cursor-pointer"
                >
                  {hasSuggestion && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full z-10"></span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[15px] bg-white text-slate-400 group-hover/btn:bg-white group-hover/btn:text-slate-500 shrink-0 mr-3 transition-colors shadow-sm">
                    {i + 1}
                  </div>

                  <div className="flex flex-col justify-center min-w-0 overflow-hidden pr-2">
                    <h3 className="font-bold text-[14px] truncate text-slate-400 group-hover/btn:text-slate-500 transition-colors">{getLocalizedField(u, 'title', language)}</h3>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="h-screen sticky top-0 hidden xl:block w-[24rem] flex-shrink-0 relative z-40 bg-white border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

