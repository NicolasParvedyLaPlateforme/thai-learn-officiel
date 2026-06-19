'use client';

import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, m as motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../../lib/store';
import { getAlphabetLessons, AlphabetLessonDef, formatCombiningChar } from '../../lib/alphabet-utils';
import { playThaiTTS } from '../../lib/tts';
import { Drawer } from 'vaul';
import { CheckCircle, BookOpen, Star, Play, Crown, RotateCcw, Pencil, Lock, ChevronLeft, ChevronRight, Clock, Target, Users, Flame, User, Coins, Menu, Globe, X, Sparkles, Volume2 } from 'lucide-react';
import IconImage from '../../components/IconImage';
import { LessonPathMap } from '../../components/LessonPathMap';

import { useGlobalSuggestedLesson } from '../../lib/useGlobalSuggestedLesson';
import { DesktopSidebarRight } from '../../components/DesktopSidebarRight';
import { MobileHeaderMenu } from '../../components/MobileHeaderMenu';
import { DesktopLessonLevelsView } from '../../components/DesktopLessonLevelsView';
import PWAInstallButton from '../../components/PWAInstallButton';
import { DailyQuestsWidget } from '../../components/DailyQuestsWidget';
import { ConversationObjectiveWidget } from '../../components/ConversationObjectiveWidget';
import ALPHABET_BASE_UNITS from '../../data/alphabet_units.json';
import { useIsPWA } from '../../../hooks/use-pwa';
import AlphabetDesktopTimeline from '../../components/alphabet/AlphabetDesktopTimeline';
import AlphabetMobileTimeline from '../../components/alphabet/AlphabetMobileTimeline';

export default function AlphabetClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const router = useRouter();
  const isPWA = useIsPWA();
  const { completedLessons, unlockedLessons, lessonLevels, lessonStars, xp, goldCoins, currentStreak, dailyQuests, resetLessonLevel, unlockLessonManual, language, setLanguage, autoDetectLanguage, getExpectedXp } = useProgressStore();
  const alphabetQuests = dailyQuests?.alphabet || [];
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const levelsScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const [selectedLesson, setSelectedLesson] = useState<{lesson: AlphabetLessonDef, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string} | null>(null);
  const [modalLevel, setModalLevel] = useState<number | null>(null);
  const [cols, setCols] = useState(5);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [showDesktopUnitsList, setShowDesktopUnitsList] = useState(false);

  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  
  const { consonants, vowels } = getAlphabetLessons();

  const UNITS = [
    {
      ...ALPHABET_BASE_UNITS[0],
      lessons: consonants
    },
    {
      ...ALPHABET_BASE_UNITS[1],
      lessons: vowels
    }
  ];

  const suggestedLessonId = globalSuggested?.type === 'alphabet' ? globalSuggested.id : null;

  const handleUnitSelect = (index: number) => {
    setActiveUnitIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
     
    setMounted(true);
    autoDetectLanguage();
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const unitParam = params.get('unit');
      if (unitParam && parseInt(unitParam) >= 0 && parseInt(unitParam) <= 1) {
        setActiveUnitIndex(parseInt(unitParam));
        window.history.replaceState({}, '', '/alphabet');
      }
    }
  }, [autoDetectLanguage]);

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

  const [isProcessingHash, setIsProcessingHash] = useState(true);

  useEffect(() => {
    if (mounted) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#lesson-')) {
        try {
          const baseId = hash.substring(1).replace('lesson-', '');
          
          const allLessons = [...consonants, ...vowels];
          const foundLesson = allLessons.find(l => l.id === baseId);
          
          if (foundLesson) {
            const isCompleted = completedLessons.includes(baseId);
            const unitIndex = UNITS.findIndex(u => u.lessons.some(l => l.id === baseId));
            
            if (unitIndex !== -1) {
              const unit = UNITS[unitIndex];
              setSelectedLesson({
                lesson: foundLesson,
                isCompleted,
                unitColor: unit.colorClass,
                unitBorder: unit.borderClass,
                unitText: unit.textClass,
                unitHover: unit.hoverClass
              });
              setActiveUnitIndex(unitIndex);
              
              const lastLvl = localStorage.getItem(`last_level_${baseId}`);
              if (lastLvl !== null) {
                if (window.innerWidth >= 1280) {
                  setModalLevel(parseInt(lastLvl, 10));
                }
              }
            }
          }

          setTimeout(() => {
            const isDesktop = window.innerWidth >= 768;
            const targetId = isDesktop ? `#desktop-lesson-${baseId}` : `#mobile-lesson-${baseId}`;
            
            let el = document.querySelector(targetId);
            if (!el) {
               el = document.querySelector(hash);
            }

            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 50);
        } catch (e) {
          console.error(e);
        } finally {
          setIsProcessingHash(false);
        }
      } else {
        setIsProcessingHash(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, completedLessons]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0">
      
      {/* Header */}
      {/* Mobile Top Header */}
      <header className={`bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden sticky top-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between w-full h-full px-4 md:px-8 gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsUnitsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors md:hidden"
            >
              <BookOpen size={18} className="text-emerald-600" />
              <span className="font-extrabold text-slate-700 text-sm">{getTranslation('auto.units', language)}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {mounted && <PWAInstallButton />}
            {mounted && (
              <button 
                 onClick={() => useProgressStore.getState().setShowLanguageModal(true)}
                 className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-extrabold text-sm hover:bg-slate-200 transition-colors uppercase md:hidden"
              >
                 {language}
              </button>
            )}
            
            {mounted && (
              <div className="flex items-center gap-2 relative">
                <Link
                  href="/profile"
                  className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <User size={18} />
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center justify-center p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileHeaderMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenQuests={() => setIsQuestsModalOpen(true)} 
      />

      {/* Main Content (Mobile Only) */}
      {!mounted || isProcessingHash ? (
        <div className="md:hidden flex flex-col items-center w-full px-4 mt-2">
          {/* Hero Card Mobile */}
          <div className="w-full h-[180px] bg-slate-200 rounded-2xl animate-pulse mb-6" />
          
          <div className="flex flex-col relative w-full items-center mt-8 pb-20">
            <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0 animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative flex flex-col items-center w-full z-10 mb-8 sm:mb-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 animate-pulse mb-4 border-[6px] border-[#FAFAFA]" />
                <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-[1.5rem] h-32 bg-slate-200 animate-pulse border-2 border-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ) : (() => {
          const unit = UNITS[activeUnitIndex];
          const unitLessons = unit.lessons;
          const completedInUnit = mounted ? unitLessons.filter(l => completedLessons.includes(l.id)).length : 0;
          const progressPercent = mounted && unitLessons.length > 0 ? (completedInUnit / unitLessons.length) * 100 : 0;
          
          if (selectedLesson) {
            return (
              <div className="md:hidden flex flex-col w-full pb-32">
                <DesktopLessonLevelsView
                  lessonData={selectedLesson}
                  unitTitle={unit ? (getLocalizedField(unit, 'title', language) || unit.title) : undefined}
                  modalLevel={modalLevel}
                  setModalLevel={(lvl) => {
                    setModalLevel(lvl);
                  }}
                  onBack={() => {
                    setSelectedLesson(null);
                    setModalLevel(null);
                  }}
                  language={language}
                  lessonLevels={lessonLevels}
                  lessonStars={lessonStars}
                  maxLevelPerLesson={4}
                  suggestionType="alphabet"
                />
              </div>
            );
          }

          return (
             <AlphabetMobileTimeline 
                unit={unit}
                unitLessons={unitLessons}
                activeUnitIndex={activeUnitIndex}
                totalUnits={UNITS.length}
                language={language}
                lessonLevels={lessonLevels}
                suggestedLessonId={suggestedLessonId}
                alphabetQuests={alphabetQuests}
                mounted={mounted}
                handleUnitSelect={handleUnitSelect}
                setIsUnitsModalOpen={setIsUnitsModalOpen}
                setIsQuestsModalOpen={setIsQuestsModalOpen}
                setSelectedLesson={setSelectedLesson}
                setModalLevel={setModalLevel}
                maxLevelPerLesson={4}
             />
          );
        })()}

      {/* Main Content (Desktop Only) */}
      {!mounted || isProcessingHash ? (
        <div className="hidden md:flex flex-row w-full items-start relative min-h-screen">
          <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
            <div className="flex flex-col gap-10 w-full max-w-4xl">
               <div className="flex flex-col gap-8 w-full">
                  {/* Header hero */}
                  <div className="p-8 md:p-10 bg-slate-200 border-b-[6px] border-slate-300 rounded-3xl h-[280px] w-full flex flex-col justify-between overflow-hidden relative">
                     <div className="relative z-10">
                       <div className="w-64 h-10 bg-slate-300 rounded-lg animate-pulse mb-4" />
                       <div className="w-96 h-6 bg-slate-300 rounded-md animate-pulse" />
                     </div>
                     <div className="w-full mt-auto relative z-10">
                       <div className="flex justify-between w-full mb-3">
                          <div className="w-24 h-4 bg-slate-300 rounded animate-pulse" />
                          <div className="w-32 h-4 bg-slate-300 rounded animate-pulse" />
                       </div>
                       <div className="w-full h-4 bg-slate-300 rounded-full animate-pulse" />
                     </div>
                  </div>

                  <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
                     <div className="absolute left-[3.25rem] md:left-[4.25rem] top-[5rem] bottom-[8rem] w-2.5 bg-slate-200 rounded-full z-0 animate-pulse"></div>

                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3">
                         <div className="relative shrink-0 py-6 z-10">
                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-2 border-slate-200 border-b-[6px] flex items-center justify-center">
                             <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                           </div>
                         </div>
                         <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 p-5 md:p-6 bg-white h-[8.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shadow-sm">
                           <div className="flex flex-col items-start w-full max-w-[200px] gap-3">
                              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
                              <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                           </div>
                           <div className="w-full md:w-48 shrink-0 mt-4 md:mt-0 flex flex-col justify-center gap-2">
                              <div className="flex justify-between w-full">
                                <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                                <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
                              </div>
                              <div className="flex justify-between gap-[2px] w-full">
                                {Array.from({ length: 4 }).map((_, j) => (
                                  <div key={j} className="h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full bg-slate-100 animate-pulse"></div>
                                ))}
                              </div>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          <div className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-8">
             {/* Unités du Cours Skeleton */}
             <div className="w-full h-[72px] bg-white border-2 border-slate-100 rounded-2xl flex items-center px-4 gap-4">
               <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
               <div className="flex flex-col gap-2 flex-1">
                 <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                 <div className="w-32 h-3 bg-slate-200 rounded animate-pulse" />
               </div>
             </div>
             
             {/* Quêtes journalières Skeleton */}
             <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                 <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
               </div>
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-full h-[60px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
               ))}
             </div>

             {/* Objectif d'histoire Skeleton */}
             <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                 <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
               </div>
               <div className="w-40 h-4 bg-slate-200 rounded animate-pulse mb-2" />
               <div className="w-full h-[80px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
               <div className="w-full h-12 bg-slate-200 rounded-xl animate-pulse mt-2" />
             </div>
          </div>
        </div>
      ) : (
        <div 
          className="hidden md:flex flex-row w-full items-start relative min-h-screen"
          onClick={() => {
            setShowDesktopUnitsList(false);
          }}
        >
          {/* Center Curriculum Content */}
          <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
            <div className="flex flex-col gap-10 w-full max-w-4xl">
            {(()=>{
              const unit = UNITS[activeUnitIndex];
              const unitLessons = unit.lessons;
              const completedInUnit = mounted ? unitLessons.filter(l => completedLessons.includes(l.id)).length : 0;
              const progressPercent = mounted && unitLessons.length > 0 ? (completedInUnit / unitLessons.length) * 100 : 0;
              
              if (selectedLesson) {
                 return (
                   <DesktopLessonLevelsView
                     lessonData={selectedLesson}
                     unitTitle={mounted ? getLocalizedField(unit, 'title', language) : unit.title}
                     modalLevel={modalLevel}
                     setModalLevel={(lvl) => {
                       setModalLevel(lvl);
                       if (lvl !== null && selectedLesson?.lesson?.id) {
                         localStorage.setItem(`last_level_${selectedLesson.lesson.id}`, lvl.toString());
                       }
                     }}
                     onBack={() => {
                       setSelectedLesson(null);
                       setShowDesktopUnitsList(false);
                     }}
                     language={language}
                     lessonLevels={lessonLevels}
                     lessonStars={lessonStars}
                     maxLevelPerLesson={4}
                     suggestionType="alphabet"
                   />
                 );
              }

              return (
                 <AlphabetDesktopTimeline 
                    unit={unit}
                    unitLessons={unitLessons}
                    activeUnitIndex={activeUnitIndex}
                    totalUnits={UNITS.length}
                    language={language}
                    lessonLevels={lessonLevels}
                    suggestedLessonId={suggestedLessonId}
                    mounted={mounted}
                    handleUnitSelect={handleUnitSelect}
                    setShowDesktopUnitsList={setShowDesktopUnitsList}
                    setSelectedLesson={setSelectedLesson}
                    setModalLevel={setModalLevel}
                    maxLevelPerLesson={4}
                 />
              );
            })()}
            </div>
          </div>
          
          {/* Right Sidebar Wrap */}
          <DesktopSidebarRight 
            showUnitsList={showDesktopUnitsList}
            setShowUnitsList={setShowDesktopUnitsList}
            units={UNITS}
            activeUnitIndex={activeUnitIndex}
            onUnitSelect={handleUnitSelect}
            language={language}
            globalSuggested={globalSuggested}
            lessons={UNITS[activeUnitIndex].lessons}
            lessonLevels={lessonLevels}
            mounted={mounted}
            maxLevelPerLesson={4}
            suggestionType="alphabet"
            selectedLesson={selectedLesson}
            onCloseLesson={() => setSelectedLesson(null)}
            modalLevel={modalLevel}
            setModalLevel={setModalLevel}
            lessonStars={lessonStars}
            resetLessonLevel={resetLessonLevel}
            questsCategory="alphabet"
          />
        </div>
      )}

      {/* Selected Lesson Modal */}
      {mounted && windowWidth < 1280 && createPortal(
        <Drawer.Root open={!!selectedLesson && modalLevel !== null} onOpenChange={(open) => {
          if (!open) setModalLevel(null);
        }}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
            <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[95vh] outline-none">
                <Drawer.Title className="sr-only">Alphabet Details</Drawer.Title>
                <Drawer.Description className="sr-only">Choose a level</Drawer.Description>
                <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
                  <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
                </div>
                {/* Scrollable Content */}
                <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar pt-6">
                  {selectedLesson && (
                    <>
                      <div className="w-full shrink-0 z-0">
                         <div className={`w-full h-[120px] ${selectedLesson?.unitColor || 'bg-amber-50'} flex items-center justify-center relative overflow-hidden`}>
                           <div className="text-5xl text-white font-thai tracking-widest drop-shadow-sm font-bold flex items-center justify-center h-full pt-2">
                             {selectedLesson?.lesson.items.map(i => formatCombiningChar(i.letter)).join('')}
                           </div>
                           <div className={`absolute -bottom-8 -right-8 opacity-20 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
                             <BookOpen size={120} />
                           </div>
                         </div>
                      </div>

                      <div className="p-6 pt-5 pb-2 text-center flex flex-col items-center">
                        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
                          {mounted ? `${getTranslation(selectedLesson.lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${selectedLesson.lesson.id.split('-').pop()}` : selectedLesson.lesson.title}
                        </h3>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                          Alphabet
                        </p>
                      </div>

                      {(() => {
                        const letterCount = selectedLesson.lesson.items.length;
                        const stepsCount = 10 + letterCount;
                        let secsPerStep = 5;
                        
                        let estimatedSecs = stepsCount * secsPerStep;
                        let estimatedMins = Math.max(1, Math.ceil(estimatedSecs / 60));
                        
                        const { xp: expectedXp, isFirstTime } = getExpectedXp(selectedLesson.lesson.id, modalLevel ?? 0, false);
                        
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
                            {isFirstTime ? `+${expectedXp} XP` : (
                              <>
                                <span className="line-through text-amber-400/60 mr-1 opacity-80">+{expectedXp === 5 ? 20 : (expectedXp === 25 ? 50 : 200)}</span>
                                <span>+{expectedXp} XP</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Letters preview */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                              {getTranslation('auto.letters', language)} ({letterCount}) :
                            </h4>
                            <div className="bg-blue-50/50 text-blue-700 font-black text-[10px] uppercase px-2 py-0.5 rounded">Chips</div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pb-2">
                              {selectedLesson.lesson.items.slice(0, 10).map((i: any) => (
                                <button onClick={() => playThaiTTS(i.letter)} key={i.letter} className={`group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer active:scale-95 ${selectedLesson.unitBorder.replace('border-', 'hover:border-')} ${selectedLesson.unitColor.replace('bg-', 'hover:bg-').replace('500', '100')}`}>
                                    <span className={`font-bold text-[17px] font-thai ${selectedLesson.unitText}`}>{formatCombiningChar(i.letter)}</span> 
                                    <span className="text-slate-500 text-[13px] font-medium">({i.romanization})</span>
                                </button>
                              ))}
                              {letterCount > 10 && (
                                <div className="shrink-0 border border-dashed border-slate-300 text-slate-400 rounded-[2rem] px-4 py-2 flex items-center justify-center font-medium text-[13px]">
                                   +{letterCount - 10} {getTranslation('auto.others', language)}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  </>
                  )}
                </div>
                
                {/* Sticky Actions Footer */}
                {selectedLesson && (
                  <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-3 w-full">
                        <Link
                          href={`/alphabet/lesson/${selectedLesson.lesson.id}?level=${(modalLevel ?? 0) + 1}`}
                          className={`flex-1 py-4 xl:py-4 md:py-3 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all ${selectedLesson.unitColor}`}
                        >
                          {getTranslation('auto.start_lesson', language)}
                        </Link>
                      </div>
                  </div>
                )}
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>,
        document.body
      )}

      {/* Portals for Units and Daily Quests */}
      {mounted && windowWidth < 768 && (
      <Drawer.Root open={isUnitsModalOpen} onOpenChange={setIsUnitsModalOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden" />
          <Drawer.Content className="md:hidden bg-[#FAFAFA] flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] outline-none">
            <Drawer.Title className="sr-only">Alphabet Units</Drawer.Title>
            <Drawer.Description className="sr-only">Select a course unit</Drawer.Description>
            <div className="w-full flex justify-center py-3 shrink-0 bg-[#FAFAFA] z-10 rounded-t-3xl border-b border-slate-200/50">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 text-center py-4 border-b border-slate-200/50 shrink-0">
              {getTranslation('auto.alphabet_units', language)}
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
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                      isActive 
                        ? `bg-white ${u.borderClass} shadow-sm` 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                     <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? `${u.shades.l1} ${u.textClass}` : 'bg-slate-100 text-slate-400'
                      }`}>
                        <BookOpen size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black uppercase text-sm ${isActive ? u.textClass : 'text-slate-400'}`}>
                          {getTranslation('auto.unit', language)} {i + 1}
                        </span>
                        <span className="font-bold text-slate-800">
                          {getLocalizedField(u, 'title', language)}
                        </span>
                      </div>
                    </div>
                    {isActive && <CheckCircle className={`${u.textClass} shrink-0`} size={24} />}
                  </button>
                )
              })}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      )}

      {mounted && windowWidth < 1280 && (
      <Drawer.Root open={isQuestsModalOpen} onOpenChange={setIsQuestsModalOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
          <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] outline-none">
            <Drawer.Title className="sr-only">Quests</Drawer.Title>
            <Drawer.Description className="sr-only">View your daily quests and objectives</Drawer.Description>
            <div className="w-full flex justify-center py-3 shrink-0 bg-white z-10 rounded-t-3xl border-b border-slate-100">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            
            <button 
              onClick={() => setIsQuestsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-6 pb-12 overflow-y-auto flex flex-col gap-6">
               <DailyQuestsWidget category="alphabet" />
               <ConversationObjectiveWidget />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      )}

    </div>
  );
}

