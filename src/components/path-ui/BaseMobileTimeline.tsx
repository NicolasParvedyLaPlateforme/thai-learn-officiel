import React from 'react';
import { m as motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, Target, ChevronRight, Play, Map } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useRouter } from 'next/navigation';
import { useNextConversationObjective } from "@/hooks/useNextConversationObjective";
import IconImage from '../ui/IconImage';
import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { MobileTimelineNodeLayout } from '../path-ui/MobileTimelineNodeLayout';
import MobileStickyBanner from '../path-ui/MobileStickyBanner';
import { useMobileTimelineNodeClick } from "@/hooks/useMobileTimelineNodeClick";
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { LessonPathMap } from '../learn/LessonPathMap';
import { useProgressStore } from "@/lib/store";
import { LessonHorizontalCarousel } from './LessonHorizontalCarousel';
interface BaseMobileTimelineProps {
    pathType: 'learn' | 'alphabet' | 'speak';
    unit: any;
    unitLessons: any[];
    activeUnitIndex: number;
    totalUnits: number;
    language: string;
    lessonLevels: Record<string, number>;
    suggestedLessonId: string | null;
    quests: any[];
    mounted: boolean;
    handleUnitSelect: (index: number) => void;
    setIsUnitsModalOpen: (open: boolean) => void;
    setIsQuestsModalOpen: (open: boolean) => void;
    setSelectedLesson: (data: any) => void;
    setModalLevel: (level: number | null) => void;
    setLockedReviewModalOpen: (open: boolean) => void;
    selectedLesson?: any;
    modalLevel?: number | null;
    lessonStars?: Record<string, number[]>;
    maxLevelPerLesson?: number;
    reviewUnlockLevel?: number;
    nextUnit?: any;
    children?: React.ReactNode;
}

export default function BaseMobileTimeline({
    pathType,
    unit,
    unitLessons,
    activeUnitIndex,
    totalUnits,
    language,
    lessonLevels,
    suggestedLessonId,
    quests,
    mounted,
    handleUnitSelect,
    setIsUnitsModalOpen,
    setIsQuestsModalOpen,
    setSelectedLesson,
    setModalLevel,
    setLockedReviewModalOpen,
    selectedLesson,
    modalLevel,
    lessonStars,
    maxLevelPerLesson = 10,
    reviewUnlockLevel = 4,
    nextUnit,
    children
}: BaseMobileTimelineProps) {
    const router = useRouter();
    const storyObjective = useNextConversationObjective();
    const currentPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

    const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
    const [expandedLessons, setExpandedLessons] = React.useState<Set<string>>(new Set());
    const [isInitializingScroll, setIsInitializingScroll] = React.useState(true);
    const hasInitializedScrollRef = React.useRef(false);

    // Guaranteed fog dismissal after 800ms
    React.useEffect(() => {
        if (!mounted) return;
        const fallbackTimer = setTimeout(() => setIsInitializingScroll(false), 800);
        return () => clearTimeout(fallbackTimer);
    }, [mounted]);

    // Scroll logic that only runs once
    React.useEffect(() => {
        if (!mounted || hasInitializedScrollRef.current) return;

        // Wait until unitLessons has data (if it's empty on first mount)
        if (!unitLessons || unitLessons.length === 0) return;

        hasInitializedScrollRef.current = true;

        let toExpand = null;
        if (suggestedLessonId) {
            toExpand = unitLessons.find(l => l.id === suggestedLessonId);
        }
        if (!toExpand) {
            toExpand = unitLessons.find(l => (lessonLevels[l.id] || 0) < maxLevelPerLesson);
        }

        if (toExpand) {
            setExpandedLessons(new Set([toExpand.id]));
            const activeLevel = Math.min(lessonLevels[toExpand.id] || 0, maxLevelPerLesson);

            const hasAnyProgressInUnit = unitLessons.some(l => {
                if ((lessonLevels[l.id] || 0) > 0) return true;
                const partsKey = `${l.id}_level-0`;
                if ((currentPartsCompleted[partsKey] || []).length > 0) return true;
                return false;
            });

            if (hasAnyProgressInUnit) {
                // Scroll to the card
                window.dispatchEvent(new Event('hideGlobalHeader'));
                setTimeout(() => {
                    const cardEl = document.getElementById(`mobile-lesson-${toExpand.id}`);
                    if (cardEl) {
                        window.dispatchEvent(new Event('hideGlobalHeader'));
                        cardEl.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                }, 450);
            }
        }
    }, [mounted, unitLessons, suggestedLessonId, lessonLevels, maxLevelPerLesson]);

    // Logic for active lesson index
    const [activeLessonIndex, setActiveLessonIndex] = React.useState(0);
    const screen2Ref = React.useRef<HTMLDivElement>(null);
    const hasInitializedLessonIndexRef = React.useRef(false);
    const prevSelectedLessonRef = React.useRef(selectedLesson);

    React.useEffect(() => {
        if (!mounted || !unitLessons || unitLessons.length === 0) return;
        
        const isFirstInit = !hasInitializedLessonIndexRef.current;
        const selectedLessonChanged = selectedLesson !== prevSelectedLessonRef.current;
        
        if (isFirstInit || selectedLessonChanged) {
            hasInitializedLessonIndexRef.current = true;
            prevSelectedLessonRef.current = selectedLesson;
            
            // Find the initial lesson to show
            let toExpandIdx = 0;
            if (selectedLesson && selectedLesson.lesson) {
                 toExpandIdx = unitLessons.findIndex(l => l.id === selectedLesson.lesson.id);
            } else if (suggestedLessonId) {
                 toExpandIdx = unitLessons.findIndex(l => l.id === suggestedLessonId);
            } else {
                 const idx = unitLessons.findIndex(l => (lessonLevels[l.id] || 0) < maxLevelPerLesson);
                 if (idx !== -1) toExpandIdx = idx;
            }
            
            if (toExpandIdx !== -1) {
                setActiveLessonIndex(toExpandIdx);
            }
        }
    }, [mounted, unitLessons, suggestedLessonId, lessonLevels, maxLevelPerLesson, selectedLesson]);

    // Intersection Observer to hide/show global header when on Screen 2
    React.useEffect(() => {
        const el = screen2Ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    window.dispatchEvent(new Event('hideGlobalHeader'));
                    // Also dispatch event to hide footer/bottom nav if necessary
                    window.dispatchEvent(new Event('hideGlobalFooter'));
                } else {
                    window.dispatchEvent(new Event('showGlobalHeader'));
                    window.dispatchEvent(new Event('showGlobalFooter'));
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Initial Scroll handling for returning from lesson
    React.useEffect(() => {
        if (!mounted || hasInitializedScrollRef.current) return;
        if (!unitLessons || unitLessons.length === 0) return;
        
        // Wait until selectedLesson has been processed
        if (selectedLesson !== undefined) {
             hasInitializedScrollRef.current = true;
             if (selectedLesson !== null) {
                 // Return from lesson, scroll to Screen 2
                 setTimeout(() => {
                      if (screen2Ref.current) {
                          const scrollContainer = document.getElementById('path-scroll-container');
                          if (scrollContainer) {
                              // We use offsetTop because it's relative to the scroll container's content
                              const targetY = screen2Ref.current.offsetTop;
                              scrollContainer.scrollTo({ top: targetY, behavior: 'auto' });
                          } else {
                              screen2Ref.current.scrollIntoView({ behavior: 'auto', block: 'start' });
                          }
                      }
                 }, 300);
             }
        }
    }, [mounted, unitLessons, selectedLesson]);

    const completedLevelsInUnit = mounted
        ? unitLessons.reduce((acc, l) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson), 0)
        : 0;
    const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
    const activeQuests = quests.filter(q => !q.completed);

    const handleAccessLessons = () => {
         screen2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activeLesson = unitLessons[activeLessonIndex];
    const activeLessonLevel = activeLesson && mounted ? (lessonLevels[activeLesson.id] || 0) : 0;

    return (
        <div className="flex flex-col w-full h-full">
            <AnimatePresence>
                {mounted && isInitializingScroll && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed inset-x-0 top-[3.75rem] bottom-16 z-[150] bg-slate-50/90 flex flex-col items-center justify-center backdrop-blur-md touch-none"
                        onWheel={(e) => e.preventDefault()}
                        onTouchMove={(e) => e.preventDefault()}
                    >
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin opacity-80" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SCREEN 1: Base UI */}
            <div className="w-full min-h-[100dvh] snap-start flex flex-col items-center pt-[80px] pb-8 relative z-0">
                <main className="max-w-2xl w-full mx-auto px-4 mt-2 flex flex-col gap-6">
                    <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        onPanEnd={(e, info) => {
                            const swipeThreshold = 50;
                            if (Math.abs(info.offset.x) > Math.abs(info.offset.y) && Math.abs(info.offset.x) > swipeThreshold) {
                                if (info.offset.x < 0) {
                                    if (activeUnitIndex < totalUnits - 1) handleUnitSelect(activeUnitIndex + 1);
                                } else {
                                    if (activeUnitIndex > 0) handleUnitSelect(activeUnitIndex - 1);
                                }
                            }
                        }}
                    >
                        {/* Unit Banner */}
                        <div
                            onClick={() => setIsUnitsModalOpen(true)}
                            className={`-mt-2 mb-0 p-5 sm:p-6 pb-6 ${unit.colorClass} rounded-xl text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform min-h-[120px] max-h-[120px] flex items-center group`}
                        >
                            {unit.imageUrl && (
                                <div
                                    className="absolute top-0 right-0 bottom-0 w-[70%] sm:w-[60%] z-0 pointer-events-none overflow-hidden"
                                    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)', maskImage: 'linear-gradient(to right, transparent 0%, black 50%)' }}
                                >
                                    <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-85 transition-transform duration-1000 group-hover:scale-105" priority />
                                </div>
                            )}
                            <div className="relative z-10 w-[80%] sm:w-[70%] flex flex-col items-start text-left">
                                <Typography variant="timeline-unit-title">
                                    {(() => {
                                        const titleStr = mounted ? getLocalizedField(unit, 'title', language) : unit.title;
                                        return titleStr.includes(':') ? titleStr.substring(titleStr.indexOf(':') + 1).trim() : titleStr;
                                    })()}
                                </Typography>
                                <Typography variant="timeline-unit-desc">
                                    {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
                                </Typography>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="-mx-4 mb-4 mt-1 flex flex-col">
                            <div className="flex justify-between items-center px-5 sm:px-6 py-2.5">
                                <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">
                                    {getTranslation('auto.mastery_3', language)}
                                </span>
                                <div className="relative w-[60%] bg-slate-100 h-[6px] shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 via-green-500 to-yellow-400 transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-100 text-slate-500">
                                    {completedLevelsInUnit} / {maxLevelsInUnit}
                                </span>
                            </div>
                        </div>

                        {/* Quests Display (Directly displayed instead of hidden in modal) */}
                        {mounted && activeQuests.length > 0 && (
                            <div className="flex flex-col gap-3 mt-2 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                                <Typography variant="h3" className="text-sm text-slate-500 mb-1">
                                    {getTranslation('auto.daily_quests', language) || 'Quêtes Journalières'}
                                </Typography>
                                {activeQuests.map((quest, idx) => (
                                    <div key={idx} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                                            <span>{getLocalizedField(quest, 'title', language)}</span>
                                            <span className="text-slate-400">{quest.progress} / {quest.target}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(quest.progress / quest.target) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Story Objective */}
                        {mounted && storyObjective && (
                             <div
                                onClick={() => setIsQuestsModalOpen(true)}
                                className="w-full bg-white rounded-2xl border-0 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between mb-4"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                    <Map size={20} className="text-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-slate-700 truncate">
                                        {storyObjective.type === 'vocab'
                                            ? getLocalizedField(storyObjective.lesson, 'title', language)
                                            : getLocalizedField(storyObjective.conversation, 'title', language)}
                                    </span>
                                </div>
                                <Button
                                    size="icon-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (storyObjective.type === 'vocab') {
                                            router.push(`/lesson/${storyObjective.lesson.id}?level=1`);
                                        } else {
                                            router.push(`/conversations/${storyObjective.conversation.id}${storyObjective.levelToComplete > 0 ? `?level=${storyObjective.levelToComplete}` : ''}`);
                                        }
                                    }}
                                >
                                    <Play size={18} className="ml-1 fill-current" />
                                </Button>
                            </div>
                        )}

                        {/* Access Lessons Button */}
                        <div className="flex justify-center mt-6 w-full">
                             <Button onClick={handleAccessLessons} size="lg" className="w-full sm:w-auto px-8 py-6 rounded-2xl shadow-sm text-lg gap-2" variant="gamified">
                                 <BookOpen size={24} /> {getTranslation('auto.lessons', language) || 'Accès aux leçons'}
                             </Button>
                        </div>

                    </motion.div>
                </main>
            </div>

            {/* SCREEN 2: Lesson Map */}
            {activeLesson && (
                <div 
                    ref={screen2Ref} 
                    className="w-full min-h-[100dvh] snap-start flex flex-col relative z-50 bg-[#FAFAFA]"
                >
                    <div className="sticky top-0 z-[60] w-full">
                         {/* Here we need to import LessonHorizontalCarousel at the top of file, but we will use dynamic import or just standard import since we can't edit imports easily, let's just assume we can add the import. Wait, I should add the import. */}
                         <LessonHorizontalCarousel 
                             lessons={unitLessons}
                             activeLessonIndex={activeLessonIndex}
                             onLessonChange={(idx) => {
                                 setActiveLessonIndex(idx);
                                 if (setModalLevel) setModalLevel(null);
                             }}
                             language={language}
                             pathType={pathType}
                         />
                    </div>
                    <div className="flex-1 w-full max-w-2xl mx-auto px-0 pb-0 flex flex-col items-center pt-2">
                         <div className="w-full relative min-h-[500px] flex-1 flex flex-col justify-between">
                              <LessonPathMap
                                  key={activeLesson.id}
                                  maxLevel={maxLevelPerLesson}
                                  currentProgress={activeLessonLevel}
                                  modalLevel={modalLevel ?? null}
                                  setModalLevel={setModalLevel}
                                  earnedStarsArray={lessonStars?.[activeLesson.id] || Array(maxLevelPerLesson + 1).fill(0)}
                                  unitColor={unit.colorClass}
                                  unitBorder={unit.borderClass}
                                  unitText={unit.textClass}
                                  language={language}
                                  lessonId={activeLesson.id}
                                  lesson={activeLesson}
                                  lessonPartsCompleted={currentPartsCompleted}
                                  suggestionType={pathType}
                                  initialScrollLevel={selectedLesson && selectedLesson.lesson.id === activeLesson.id ? selectedLesson.initialScrollLevel : undefined}
                                  disableAutoScroll={!isInitializingScroll}
                                  onReady={() => { }}
                                  onBack={() => {}}
                              />
                         </div>
                    </div>
                </div>
            )}

            {/* SCREEN 3: Next Unit */}
            <div className="w-full snap-start snap-always flex flex-col items-center justify-center min-h-[100dvh] pb-32 pt-12 relative z-50">
                {children}
            </div>
        </div>
    );
}