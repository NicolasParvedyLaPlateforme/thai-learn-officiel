'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../lib/store';
import { playThaiTTS } from '../lib/tts';
import { BookOpen, CheckCircle, Star, Play, Crown, RotateCcw, Pencil, X, Unlock, Brain, MessageCircle, Lock, ChevronLeft, ChevronRight, Clock, Volume2, Heart, Users, Flame, Target } from 'lucide-react';
import { Lesson } from '../types';
import IconImage from '../components/IconImage';

import { WritingConfigModal } from '../components/WritingConfigModal';
import { DesktopSidebarRight } from '../components/DesktopSidebarRight';
import PWAInstallButton from '../components/PWAInstallButton';
import { DailyQuestsWidget } from '../components/DailyQuestsWidget';
import BASE_UNITS from '../data/units.json';

import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';
import { useIsPWA } from '../../hooks/use-pwa';

export default function LearnClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const data = { lessons: lightweightLessons };
  
  const UNITS = useMemo(() => {
    const computedUnits = [];
    let currentStartIndex = 0;
    
    for (let i = 0; i < BASE_UNITS.length; i++) {
      const baseUnit = BASE_UNITS[i];
      let endIndex = currentStartIndex;
      
      for (let j = currentStartIndex; j < data.lessons.length; j++) {
        const title = data.lessons[j].title || "";
        const titleEn = data.lessons[j].titleEn || "";
        if (title.toLowerCase().includes("bilan") || titleEn.toLowerCase().includes("review")) {
           endIndex = j + 1;
           break;
        }
      }
      
      if (endIndex === currentStartIndex && currentStartIndex < data.lessons.length) {
         endIndex = data.lessons.length;
      }

      computedUnits.push({
        ...baseUnit,
        startIndex: currentStartIndex,
        endIndex: endIndex
      });
      
      currentStartIndex = endIndex;
    }
    return computedUnits;
  }, [lightweightLessons]);

  const router = useRouter();
  const { completedLessons, unlockedLessons, lessonLevels, lessonStars, xp, currentStreak, dailyQuests, resetLessonLevel, language, setLanguage, unlockLessonManual, autoDetectLanguage, lastActiveUnitIndex, setLastActiveUnitIndex } = useProgressStore();
  const learnQuests = dailyQuests?.learn || [];
  const [mounted, setMounted] = useState(false);
  const isPWA = useIsPWA();
  const [isWritingConfigModalOpen, setWritingConfigModalOpen] = useState(false);
  const [isPracticeModalOpen, setPracticeModalOpen] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const levelsScrollRef = useRef<HTMLDivElement>(null);
  const [selectedLesson, setSelectedLesson] = useState<{lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string} | null>(null);
  const [modalLevel, setModalLevel] = useState(0);
  const [cols, setCols] = useState(5);
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);

  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  const suggestedLessonId = globalSuggested?.type === 'learn' ? globalSuggested.id : null;

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
         setShowHeader(true);
         setLastScrollY(0);
         return;
      }
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      autoDetectLanguage();
      useProgressStore.getState().checkAndGenerateQuests();
    }, 0);
    return () => clearTimeout(timer);
  }, [autoDetectLanguage]);
  
  useEffect(() => {
    if (!mounted) return;
    if (lastActiveUnitIndex !== undefined && lastActiveUnitIndex >= 0 && lastActiveUnitIndex < UNITS.length) {
      setActiveUnitIndex(lastActiveUnitIndex);
    } else {
      const lastUnlockedIndex = data.lessons.findIndex(l => !completedLessons.includes(l.id));
      const targetIndex = lastUnlockedIndex === -1 ? data.lessons.length - 1 : lastUnlockedIndex;
      const unitIndex = UNITS.findIndex(u => targetIndex >= u.startIndex && targetIndex < u.endIndex);
      if (unitIndex !== -1) {
        setActiveUnitIndex(unitIndex);
        setLastActiveUnitIndex(unitIndex);
      }
    }
  }, [mounted, lastActiveUnitIndex, setLastActiveUnitIndex]);

  const handleUnitSelect = (index: number) => {
    setActiveUnitIndex(index);
    setLastActiveUnitIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (mounted) {
      const el = document.getElementById(`unit-tab-${activeUnitIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [mounted, activeUnitIndex]);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(5);
      else if (window.innerWidth >= 768) setCols(4);
      else if (window.innerWidth >= 640) setCols(3);
      else setCols(2);
    };
    
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  useEffect(() => {
    if (mounted) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          try {
             // Differentiate mobile and desktop elements
            const baseId = hash.substring(1).replace('lesson-', ''); // just the ID
            const isDesktop = window.innerWidth >= 768; // md breakpoint
            const targetId = isDesktop ? `#desktop-lesson-${baseId}` : `#mobile-lesson-${baseId}`;
            
            let el = document.querySelector(targetId);
            if (!el) {
               el = document.querySelector(hash); // Fallback
            }

            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          } catch (e) {
            console.error(e);
          }
        }, 100);
      }
    }
  }, [mounted]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0">
      
      {/* Header */}
      <header className={`bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden sticky top-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between w-full h-full px-4 md:px-8 gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsUnitsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors md:hidden"
            >
              <BookOpen size={18} className="text-emerald-600" />
              <span className="font-extrabold text-slate-700 text-sm">{language === 'en' ? 'Units' : 'Unités'}</span>
            </button>
            <button 
              onClick={() => useProgressStore.getState().setShowCommunityModal(true)}
              className="ml-1 text-rose-500 bg-rose-50 p-2 rounded-full hover:bg-rose-100 transition-colors"
            >
              <Heart size={18} fill="currentColor" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {mounted && <PWAInstallButton />}
            {mounted && (
              <button 
                 onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                 className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-extrabold text-sm hover:bg-slate-200 transition-colors"
                 title={language === 'fr' ? "Switch to English" : "Passer en Français"}
              >
                 {language === 'fr' ? 'FR' : 'EN'}
              </button>
            )}
            
            {mounted && (
              <div className="flex items-center gap-1.5 relative">
                <div className="hidden md:flex items-center gap-1 px-2 py-1.5 bg-amber-50 text-amber-600 rounded-xl font-extrabold text-sm">
                  <Star size={16} className="fill-amber-400 stroke-amber-400" />
                  <span>{xp}</span>
                </div>
                <div className="hidden md:flex items-center gap-1 px-2 py-1.5 bg-orange-50 text-orange-500 rounded-xl font-extrabold text-sm">
                  <Flame size={16} fill="currentColor" className={`${currentStreak > 0 ? '' : 'text-slate-400 opacity-50'}`} />
                  <span className={`${currentStreak > 0 ? '' : 'text-slate-400 opacity-50'}`}>{currentStreak}</span>
                </div>

                <button
                  onClick={() => setIsMobileStatsOpen(!isMobileStatsOpen)}
                  className="md:hidden flex items-center justify-center p-1.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Star size={18} className="fill-amber-400 stroke-amber-400" />
                </button>

                {isMobileStatsOpen && (
                  <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl flex flex-col gap-2 z-50 min-w-[120px] md:hidden">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-slate-700">{xp}</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Flame size={16} className={`${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                      <span className={`font-extrabold ${currentStreak > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{currentStreak}</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setIsQuestsModalOpen(true)}
                  className="xl:hidden flex items-center justify-center p-1.5 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Target size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content (Mobile Only) */}
      <main className="max-w-2xl mx-auto px-4 mt-2 flex flex-col gap-8 md:hidden">
        {(() => {
          const unit = UNITS[activeUnitIndex];
          const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
          const maxLevelsInUnit = unitLessons.length * 10;
          const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
          const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
          
          return (
            <div key={unit.id} className="relative z-0">
              <div className={`mb-6 p-4 sm:p-5 ${unit.colorClass} border-b-4 ${unit.borderClass} rounded-2xl text-white shadow-md relative overflow-hidden`}>
                {unit.imageUrl && (
                  <>
                    <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-50 mix-blend-overlay" priority />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-0`}></div>
                  </>
                )}
                <div className="relative z-10 w-full flex flex-col items-start text-left">
                  <div className="flex justify-between items-start w-full mb-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md uppercase tracking-tight break-words pr-2">{mounted && language === 'en' ? unit.titleEn : unit.title}</h2>
                  </div>
                  <p className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} mb-4 font-medium text-sm sm:text-base leading-snug drop-shadow`}>{mounted && language === 'en' ? unit.descriptionEn : unit.description}</p>
                  
                  <div className="w-full">
                    <div className="flex flex-col">
                      <div className="flex justify-between text-xs font-bold text-white mb-1 px-1 drop-shadow-sm uppercase tracking-wide">
                        <span>{language === 'en' ? 'Mastery' : 'Maîtrise'}</span>
                        <span>{completedLevelsInUnit} / {maxLevelsInUnit} {language === 'en' ? 'levels' : 'niveaux'}</span>
                      </div>
                      <div className={`w-full ${unit.imageUrl ? 'bg-black/20 backdrop-blur-sm' : 'bg-black/15'} rounded-full h-2 overflow-hidden mb-1 shadow-inner`}>
                        <div 
                          className={`bg-white h-full rounded-full transition-all duration-1000 ${unit.imageUrl && 'shadow-[0_0_10px_rgba(255,255,255,0.7)]'}`} 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} font-bold text-[10px] px-1 drop-shadow-sm`}>
                        {language === 'en' ? '10 levels / lesson = Mastery' : '10 niveaux / leçon = Maîtrise totale'}
                      </div>
                    </div>
                  </div>
                </div>
                {!unit.imageUrl && (
                  <>
                    <div className={`absolute -bottom-8 -left-8 opacity-10 drop-shadow-lg text-black rotate-[-15deg] pointer-events-none`}>
                      <BookOpen size={160} />
                    </div>
                    <div className={`absolute -top-8 -right-8 opacity-10 drop-shadow-lg text-white rotate-[15deg] pointer-events-none`}>
                      <Star size={100} />
                    </div>
                  </>
                )}
              </div>

              {/* Current Quest Banner (Mobile) */}
              {mounted && (
                <div 
                  onClick={() => setIsQuestsModalOpen(true)}
                  className="xl:hidden mt-6 w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Target size={20} className="text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-400">
                        {language === 'en' ? 'Daily Quest' : 'Quête du jour'}
                      </span>
                      {learnQuests.filter(q => !q.completed).length > 0 ? (
                        <span className="text-sm font-bold text-slate-700">
                          {language === 'en' 
                            ? learnQuests.filter(q => !q.completed)[0].titleEn 
                            : learnQuests.filter(q => !q.completed)[0].titleFr}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-emerald-600">
                          {language === 'en' ? 'All quests completed!' : 'Toutes les quêtes terminées !'}
                        </span>
                      )}
                    </div>
                  </div>
                  {learnQuests.filter(q => !q.completed).length > 0 && (
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-400">
                         {learnQuests.filter(q => !q.completed)[0].progress} / {learnQuests.filter(q => !q.completed)[0].target}
                       </span>
                       <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  )}
                </div>
              )}

              {/* Vertical Timeline of Lessons (Mobile) */}
              <div className="flex flex-col relative w-full items-center mt-8 pb-20">
                 <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0"></div>
                 
                 {unitLessons.map((lesson, idx) => {
                   const globalIndex = unit.startIndex + idx;
                   const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
                   // All lessons are fully unlocked horizontally
                   const isUnlocked = true;
                   const isMaxLevel = level >= 10;

                   const showLineToNext = idx < unitLessons.length - 1;
                   const lineToNextColor = level > 0 ? unit.colorClass : "bg-slate-200";

                   return (
                     <motion.div 
                       id={`mobile-lesson-${lesson.id}`} 
                       key={`mobile-node-${lesson.id}`} 
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                       className="relative flex flex-col items-center w-full scroll-mt-24 z-10 mb-8 sm:mb-12 group"
                     >
                        {/* Circle Node */}
                        <div 
                          className={`relative shrink-0 mb-4 z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLesson({lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass});
                            setModalLevel(Math.min(level, 9));
                          }}
                        >
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-b-[6px] relative z-10 text-4xl sm:text-5xl font-thai shadow-sm overflow-hidden
                            ${isMaxLevel 
                              ? unit.colorClass + ' text-white ' + unit.borderClass 
                              : level >= 8 ? unit.shades.l4 : level >= 6 ? unit.shades.l3 : level >= 3 ? unit.shades.l2 : level >= 1 ? unit.shades.l1
                              : 'bg-white ' + unit.textClass + ' border-slate-200 border-2 active:border-b-2 active:translate-y-1'}`}
                          >
                            {lesson.imageUrl ? (
                              <>
                                <IconImage src={lesson.imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''}`} sizes="(max-width: 640px) 5rem, 6rem" />
                                {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={40} className="stroke-[3] text-white" /></div>}
                              </>
                            ) : (
                              isMaxLevel ? <CheckCircle size={40} className="stroke-[3]" /> : level > 0 ? <CheckCircle size={40} className="stroke-current stroke-[2.5]" /> : lesson.isReview ? <Star size={40} className="fill-current stroke-current" /> : <Play size={40} className="ml-1 fill-current stroke-[2]" />
                            )}
                          </div>
                        </div>
                        
                        {/* Card */}
                        <div 
                          className={`w-full max-w-[280px] sm:max-w-[320px] rounded-[1.5rem] p-5 flex flex-col items-center text-center transition-all z-10 border-2 border-b-[6px] cursor-pointer active:translate-y-[4px] active:border-b-2 shadow-sm relative ${isMaxLevel ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : suggestedLessonId === lesson.id ? 'bg-white border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.5)]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLesson({lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass});
                            setModalLevel(Math.min(level, 9));
                          }}
                        >
                           {isMaxLevel ? (
                             <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                               <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {language === 'en' ? 'MASTERED' : 'MAÎTRISÉ'}
                             </div>
                           ) : suggestedLessonId === lesson.id && (
                             <div className="absolute -top-3.5 left-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                               <Star size={12} fill="currentColor" /> {language === 'en' ? 'SUGGESTED' : 'SUGGÉRÉ'}
                             </div>
                           )}
                           <h4 className={`font-extrabold text-xl text-slate-800`}>
                             {mounted && language === 'en' ? (lesson.titleEn || lesson.title) : lesson.title}
                           </h4>
                           <span className={`text-sm font-bold mt-1 tracking-wide text-slate-500`}>
                             {mounted && language === 'en' ? (lesson.descriptionEn || lesson.description) : lesson.description}
                           </span>
                           
                           {/* Lesson Progress Bar (Out of 10) */}
                           <div className="w-full mt-4">
                             {level === 0 ? (
                                suggestedLessonId === lesson.id ? (
                                  <div className="text-sm font-bold text-slate-400 mt-2 py-1">
                                    {language === 'en' ? 'Start learning' : 'Commencer'}
                                  </div>
                                ) : null
                             ) : (
                               <>
                                 <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-1">
                                   <span>{language === 'en' ? 'Mastery' : 'Maîtrise'}</span>
                                   <span className={unit.textClass}>{level}/10</span>
                                 </div>
                                 <div className="flex justify-between gap-[2px] w-full">
                                   {Array.from({length: 10}).map((_, i) => (
                                     <div key={i} className={`h-2.5 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
                                   ))}
                                 </div>
                               </>
                             )}
                           </div>
                        </div>

                        {showLineToNext && (
                           <div className={`absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-3 h-[calc(100%+2rem)] sm:h-[calc(100%+3rem)] ${lineToNextColor} z-0`}></div>
                        )}
                     </motion.div>
                   )
                 })}
                 
                 {activeUnitIndex < UNITS.length - 1 && (
                     <div className="mt-8 z-10 w-full px-4 relative flex justify-center">
                         <button 
                             onClick={() => handleUnitSelect(activeUnitIndex + 1)}
                             className="px-8 py-4 rounded-2xl bg-amber-50 text-amber-500 border-b-4 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-600 font-extrabold shadow-sm transition-all text-center active:border-b-0 active:translate-y-1 w-full max-w-[280px] sm:max-w-[320px]"
                         >
                            {mounted && language === 'en' ? 'Next Unit' : 'Unité Suivante'}
                         </button>
                     </div>
                 )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* Main Content (Desktop Only) */}
      {mounted && (
        <div 
          className="hidden md:flex flex-row w-full items-start relative min-h-screen"
          onClick={() => setSelectedLesson(null)}
        >
          {/* Center Curriculum Content */}
          <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
            <div className="flex flex-col gap-10 w-full max-w-4xl">
            {(()=>{
              const unit = UNITS[activeUnitIndex];
              const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
              const maxLevelsInUnit = unitLessons.length * 10;
              const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
              const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
              
              return (
                <div key={`desktop-unit-${unit.id}`} className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                  {/* Unit Hero Card */}
                  <div className={`p-8 md:p-10 ${unit.colorClass} border-b-[6px] ${unit.borderClass} rounded-3xl text-white shadow-xl relative overflow-hidden`}>
                    {unit.imageUrl && (
                      <>
                        <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-50 mix-blend-overlay" priority />
                        <div className={`absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent z-0`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-0`}></div>
                      </>
                    )}
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-md uppercase tracking-tight">{language === 'en' ? unit.titleEn : unit.title}</h2>
                        {/* Changer d'unité removed string */}
                      </div>
                      <p className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} mb-10 font-medium text-xl drop-shadow`}>{language === 'en' ? unit.descriptionEn : unit.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className={`flex flex-col mb-3`}>
                            <div className={`text-sm text-white font-bold mb-2 flex justify-between uppercase tracking-wide drop-shadow-sm`}>
                              <span>{language === 'en' ? 'Mastery' : 'MAÎTRISE'}</span>
                              <span>{completedLevelsInUnit} / {maxLevelsInUnit} {language === 'en' ? 'levels' : 'niveaux'}</span>
                            </div>
                            <div className={`w-full ${unit.imageUrl ? 'bg-black/20 backdrop-blur-sm' : unit.bgMutedClass} rounded-full h-4 overflow-hidden shadow-inner mb-2`}>
                              <div 
                                className={`bg-white h-full rounded-full transition-all duration-1000 origin-left ${unit.imageUrl && 'shadow-[0_0_10px_rgba(255,255,255,0.7)]'}`} 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <div className={`text-sm ${unit.imageUrl ? 'text-white' : unit.lightTextClass} font-bold drop-shadow-sm`}>
                              {language === 'en' ? '10 levels per lesson = Total mastery' : '10 niveaux par leçon = Maîtrise totale'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!unit.imageUrl && (
                      <div className={`absolute -bottom-10 -right-10 opacity-20 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
                        <BookOpen size={200} />
                      </div>
                    )}
                  </div>
                  
                  {/* Vertical Timeline of Lessons */}
                  <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
                     <div className="absolute left-[calc(3.5rem-5px)] md:left-[calc(5rem-5px)] top-[5rem] bottom-[8rem] w-[10px] bg-slate-200 rounded-full z-0"></div>
                     
                     {unitLessons.map((lesson, idx) => {
                       const globalIndex = unit.startIndex + idx;
                       const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
                       const isUnlocked = true;
                       
                       const showLineToNext = idx < unitLessons.length - 1;
                       const lineToNextColor = level > 0 ? unit.colorClass : "bg-slate-200";
                       
                       const isMaxLevel = level >= 10;

                       return (
                         <motion.div 
                           id={`desktop-lesson-${lesson.id}`} 
                           key={`desktop-node-${lesson.id}`} 
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                           className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3 group"
                         >
                            {/* Circle Node */}
                            <div 
                              className={`relative shrink-0 py-6 cursor-pointer hover:brightness-95 hover:scale-105 active:scale-95 transition-all z-10`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLesson({lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass});
                                setModalLevel(Math.min(level, 9));
                              }}
                            >
                              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center border-b-[6px] relative z-20 transition-transform overflow-hidden bg-white ${isMaxLevel ? unit.colorClass + ' text-white ' + unit.borderClass : level >= 8 ? unit.shades.l4 : level >= 6 ? unit.shades.l3 : level >= 3 ? unit.shades.l2 : level >= 1 ? unit.shades.l1 : 'bg-white ' + unit.textClass + ' border-slate-200 border-2 active:border-b-2 active:translate-y-1'}`}>
                                {(lesson as any).imageUrl ? (
                                  <>
                                    <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''}`} sizes="(max-width: 768px) 4rem, 5rem" />
                                    {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={32} className="stroke-[3] text-white" /></div>}
                                  </>
                                ) : (
                                  isMaxLevel ? <CheckCircle size={32} className="stroke-[3]" /> : <Play size={32} className="ml-1 fill-current stroke-[2]" />
                                )}
                              </div>
                            </div>
                            
                            {/* Horizontal Card */}
                            <div 
                              className={`flex-1 rounded-[1.5rem] border-2 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group border-b-[6px] cursor-pointer active:translate-y-[4px] active:border-b-2 shadow-sm relative z-10 ${isMaxLevel ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : suggestedLessonId === lesson.id ? 'bg-white border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.5)]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLesson({lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass});
                                setModalLevel(Math.min(level, 9));
                              }}
                            >
                               {isMaxLevel ? (
                                 <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                                   <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {language === 'en' ? 'MASTERED' : 'MAÎTRISÉ'}
                                 </div>
                               ) : suggestedLessonId === lesson.id && (
                                 <div className="absolute -top-3.5 left-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                                   <Star size={12} fill="currentColor" /> {language === 'en' ? 'SUGGESTED' : 'SUGGÉRÉ'}
                                 </div>
                               )}
                               <div className="flex flex-col items-start text-left flex-1 md:pr-4">
                                 <h4 className="font-extrabold text-xl text-slate-800">
                                   {language === 'en' ? (lesson.titleEn || lesson.title) : lesson.title}
                                 </h4>
                                 <span className={`text-sm font-bold mt-1 tracking-wide text-slate-500`}>
                                   {language === 'en' ? (lesson.descriptionEn || lesson.description) : lesson.description}
                                 </span>
                               </div>
                               
                               {/* Lesson Progress Bar (Out of 10) desktop */}
                               <div className="w-full md:w-48 shrink-0 mt-4 md:mt-0 flex flex-col justify-center">
                                 {level === 0 ? (
                                    suggestedLessonId === lesson.id ? (
                                      <div className="text-sm font-bold text-slate-400 text-left md:text-right">
                                        {language === 'en' ? 'Start learning' : 'Commencer'}
                                      </div>
                                    ) : null
                                 ) : (
                                   <>
                                     <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-1">
                                       <span>{language === 'en' ? 'Mastery' : 'Maîtrise'}</span>
                                       <span className={unit.textClass}>{level}/10</span>
                                     </div>
                                     <div className="flex justify-between gap-[2px] w-full">
                                       {Array.from({length: 10}).map((_, i) => (
                                         <div key={i} className={`h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
                                       ))}
                                     </div>
                                   </>
                                 )}
                               </div>
                            </div>

                            {showLineToNext && (
                               <div className={`absolute top-1/2 left-[calc(2rem-5px)] md:left-[calc(2.5rem-5px)] w-[10px] h-[calc(100%+4rem)] ${lineToNextColor} z-0`}></div>
                            )}
                         </motion.div>
                       )
                     })}
                     
                     {activeUnitIndex < UNITS.length - 1 && (
                        <div className="mt-12 z-10 w-full pl-0 md:pl-[6rem] relative flex justify-start">
                             <button 
                                 onClick={() => handleUnitSelect(activeUnitIndex + 1)}
                                 className="px-8 py-4 rounded-2xl bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600 font-extrabold shadow-sm transition-all text-center border-2 border-amber-200 border-b-4 active:border-b-2 active:translate-y-1 text-lg w-full max-w-[280px]"
                             >
                                {language === 'en' ? 'Next Unit' : 'Unité Suivante'}
                             </button>
                        </div>
                     )}
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
          
          <DesktopSidebarRight 
            units={UNITS}
            activeUnitIndex={activeUnitIndex}
            onUnitSelect={handleUnitSelect}
            language={language}
            globalSuggested={globalSuggested}
            lessons={data.lessons}
            lessonLevels={lessonLevels}
            mounted={mounted}
            maxLevelPerLesson={10}
            suggestionType="learn"
            selectedLesson={selectedLesson}
            onCloseLesson={() => setSelectedLesson(null)}
            modalLevel={modalLevel}
            setModalLevel={setModalLevel}
            lessonStars={lessonStars}
            resetLessonLevel={resetLessonLevel}
          />
        </div>
      )}

      {/* Selected Lesson Modal */}
      {mounted && createPortal(
        <AnimatePresence>
           {selectedLesson && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 xl:hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setSelectedLesson(null)}
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`w-full md:max-w-[26rem] h-[100dvh] md:h-auto md:max-h-[90vh] bg-white rounded-none md:rounded-[20px] shadow-xl flex flex-col relative overflow-hidden z-20`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Removed Close Button */}

                {/* Scrollable Content */}
                <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">
                  {/* Image Header */}
                  <div className="w-full shrink-0 z-0">
                     <div className={`w-full h-[100px] md:h-[180px] bg-amber-50 flex items-center justify-center relative overflow-hidden`}>
                       {selectedLesson.lesson.imageUrl ? (
                          <IconImage src={selectedLesson.lesson.imageUrl} alt="" fill className="object-contain md:object-cover p-2 md:p-0" />
                       ) : (
                          <BookOpen size={48} className="text-slate-200" />
                       )}
                     </div>
                  </div>

                  <div className="p-6 pt-5 pb-2 text-center flex flex-col items-center">
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
                      {language === 'en' ? (selectedLesson.lesson.titleEn || selectedLesson.lesson.title) : selectedLesson.lesson.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                      {language === 'en' ? (selectedLesson.lesson.descriptionEn || selectedLesson.lesson.description) : selectedLesson.lesson.description}
                    </p>

                    {/* Levels Grid */}
                    <div className="grid grid-cols-5 gap-y-4 gap-x-2 w-full mb-6 max-w-[16rem] mx-auto">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((levelIndex) => {
                        const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
                        const starsArray = lessonStars[selectedLesson.lesson.id] || Array(10).fill(0);
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
                            className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed`}
                            disabled={!isAccessible}
                          >
                            <div className={`
                              w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                              ${isSelected ? 'scale-110 ring-[4px] ring-offset-[3px] ring-[#0a6c4a]/40 shadow-lg relative z-10' : ''}
                              ${isCompleted ? 'bg-amber-400 border border-amber-500 shadow-sm text-amber-900' : 
                                isCurrent ? 'bg-white border-[3px] border-[#0a6c4a] shadow-sm text-[#0a6c4a]' : 
                                'bg-slate-50 border border-slate-200 text-slate-300'
                              }
                            `}>
                              {isCompleted ? (
                                <div className="flex gap-[1px]">
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <Star key={i} className={`stroke-[1.5] ${i < earnedStars ? "fill-amber-900 stroke-amber-900" : "fill-white stroke-white"}`} size={10} />
                                  ))}
                                </div>
                              ) : isCurrent ? (
                                <span className="font-extrabold text-lg">{levelIndex + 1}</span>
                              ) : (
                                <Lock size={16} className="stroke-[2.5]" />
                              )}
                            </div>
                            <span className={`text-[9px] font-black tracking-widest uppercase
                              ${isCurrent ? 'text-[#0a6c4a]' : isCompleted ? 'text-amber-500' : 'text-slate-300'}
                            `}>
                              {isCurrent ? (language === 'en' ? 'IN PROGRESS' : 'EN COURS') : `NIV. ${levelIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
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
                    if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
                    else estimatedMins = Math.max(1, estimatedMins);

                    return (
                      <div className="px-7 pt-2 flex flex-col">
                        {/* Badges Container */}
                        <div className="flex items-center justify-center gap-3 mb-8 border-b border-slate-100 pb-8 w-full flex-wrap">
                          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold whitespace-nowrap shadow-sm bg-white">
                            <Clock size={16} className="text-slate-500" />
                            {estimatedMins} min
                          </div>
                          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-bold shadow-sm whitespace-nowrap">
                            <Star size={16} className="fill-amber-500 text-amber-600" />
                            +15 XP
                          </div>
                        </div>

                        {/* Vocab preview */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                              {language === 'en' ? `Vocabulary (LVL ${modalLevel + 1}) :` : `Vocabulaire (NIV. ${modalLevel + 1}) :`}
                            </h4>
                            <div className="bg-blue-50/50 text-blue-700 font-black text-[10px] uppercase px-2 py-0.5 rounded">Chips</div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pb-2">
                              {selectedLesson.lesson.words?.map((w: any) => (
                                <button onClick={() => playThaiTTS(w.th)} key={w.id} className="group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm hover:border-[#0a6c4a] hover:bg-[#0a6c4a]/5 transition-colors cursor-pointer active:scale-95">
                                    <span className="font-bold text-[#0a6c4a] text-[17px]">{w.th}</span> 
                                    <span className="text-slate-500 text-[13px] font-medium">({language === 'en' ? w.en : w.fr})</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Sticky Actions Footer */}
                <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    {selectedLesson.isCompleted && (
                      <div className="flex gap-3">
                        <Link
                          href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                          className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Pencil size={16} className="mr-2" />
                          {language === 'en' ? 'Writing' : 'Écriture'}
                        </Link>
                        <button
                          onClick={() => {
                            resetLessonLevel(selectedLesson.lesson.id);
                            setModalLevel(0);
                          }}
                          className="flex-1 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm flex items-center justify-center hover:bg-rose-100 transition-colors"
                        >
                          <RotateCcw size={16} className="mr-2" />
                          {language === 'en' ? 'Reset' : 'Réinitialiser'}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 w-full mt-1">
                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="md:hidden shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <Link
                        href={`/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
                        className="flex-1 py-4 xl:py-4 md:py-3 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all bg-[#0a6c4a]"
                      >
                        {language === 'en' ? `Start lesson` : `Commencer la leçon`}
                      </Link>
                    </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isUnitsModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                onClick={() => setIsUnitsModalOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full bg-[#FAFAFA] rounded-t-3xl shadow-2xl relative pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden"
              >
                <div className="w-full flex justify-center py-3 shrink-0 bg-[#FAFAFA] z-10 rounded-t-3xl border-b border-slate-200/50">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 text-center py-4 border-b border-slate-200/50 shrink-0">
                  {language === 'en' ? 'Course Units' : 'Unités du Cours'}
                </h3>
                
                <button 
                  onClick={() => setIsUnitsModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                <div className="p-4 overflow-y-auto flex flex-col gap-3 pb-12">
                  {UNITS.map((u, i) => {
                    const isActive = i === activeUnitIndex;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          handleUnitSelect(i);
                          setIsUnitsModalOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                          isActive 
                            ? 'bg-white border-emerald-500 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <BookOpen size={24} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-black uppercase text-sm ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {language === 'en' ? 'Unit' : 'Unité'} {i + 1}
                            </span>
                            <span className="font-bold text-slate-800">
                              {language === 'en' ? u.titleEn : u.title}
                            </span>
                          </div>
                        </div>
                        {isActive && <CheckCircle className="text-emerald-500 shrink-0" size={24} />}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isQuestsModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none xl:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                onClick={() => setIsQuestsModalOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full bg-white rounded-t-3xl shadow-2xl relative pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden"
              >
                <div className="w-full flex justify-center py-3 shrink-0 bg-white z-10 rounded-t-3xl border-b border-slate-100">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
                
                <button 
                  onClick={() => setIsQuestsModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                <div className="p-6 pb-12 overflow-y-auto">
                   <DailyQuestsWidget />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <WritingConfigModal isOpen={isWritingConfigModalOpen} onClose={() => setWritingConfigModalOpen(false)} />
    </div>
  );
}
