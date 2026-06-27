import React from 'react';
import { m as motion } from "motion/react";
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
import { AnimatePresence } from 'framer-motion';
import { useProgressStore } from "@/lib/store";

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

    const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
    const [expandedLessons, setExpandedLessons] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        if (selectedLesson && expandedLessons.size === 0) {
            setExpandedLessons(new Set([selectedLesson.lesson.id]));
        }
    }, [selectedLesson]);

    const completedLevelsInUnit = mounted
        ? unitLessons.reduce((acc, l) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson), 0)
        : 0;
    const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
    const activeQuests = quests.filter(q => !q.completed);

    const handleNodeClick = (lesson: any, level: number, unit: any, isReviewLocked: boolean, pathType: string) => (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isReviewLocked) {
            setLockedReviewModalOpen(true);
            return;
        }

        const isCurrentlyExpanded = expandedLessons.has(lesson.id);

        setExpandedLessons(prev => {
            const next = new Set(prev);
            if (next.has(lesson.id)) {
                next.delete(lesson.id);
            } else {
                next.add(lesson.id);
            }
            return next;
        });

        if (isCurrentlyExpanded) {
            if (selectedLesson?.lesson.id === lesson.id) {
                setSelectedLesson(null);
            }
        } else {
            setSelectedLesson({ lesson, isCompleted: level >= maxLevelPerLesson, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass });
        }
    };

    return (
        <>
            <MobileStickyBanner
                unit={unit}
                language={language}
                mounted={mounted}
                onOpenUnitsList={() => setIsUnitsModalOpen(true)}
            />

            <main className="max-w-2xl mx-auto px-4 mt-2 flex flex-col gap-8 md:hidden">
                <motion.div
                    key={unit.id}
                    className="relative z-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onPanEnd={(e, info) => {
                        const swipeThreshold = 50;
                        if (Math.abs(info.offset.x) > Math.abs(info.offset.y) && Math.abs(info.offset.x) > swipeThreshold) {
                            if (info.offset.x < 0) {
                                if (activeUnitIndex < totalUnits - 1) handleUnitSelect(activeUnitIndex + 1);
                                else setIsUnitsModalOpen(true);
                            } else {
                                if (activeUnitIndex > 0) handleUnitSelect(activeUnitIndex - 1);
                                else setIsUnitsModalOpen(true);
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
                    <div className="-mx-4 mb-1 mt-1 flex flex-col">
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

                    {/* Quests / Objectives Widget */}
                    {mounted && (
                        activeQuests.length > 0 ? (
                            <div
                                onClick={() => setIsQuestsModalOpen(true)}
                                className="xl:hidden p-2 cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between -mx-4 bg-[#f5f5f5]"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                        <Target size={20} className="text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-slate-500 truncate">
                                            {getLocalizedField(activeQuests.filter(q => !q.completed)[0], 'title', language)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                        {activeQuests.filter(q => !q.completed)[0].progress} / {activeQuests.filter(q => !q.completed)[0].target}
                                    </span>
                                    <ChevronRight size={18} className="text-slate-300 shrink-0 mr-1" />
                                </div>
                            </div>
                        ) : storyObjective ? (
                            <div
                                onClick={() => setIsQuestsModalOpen(true)}
                                className="xl:hidden mt-6 w-full bg-white rounded-2xl border-0 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between"
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
                        ) : null
                    )}

                    {/* Timeline Nodes */}
                    <div className="flex flex-col w-full mt-12 pl-2 pr-2 sm:pl-4 sm:pr-4">
                        <div className="flex flex-col relative w-full pb-8">
                            {unitLessons.map((lesson, idx) => {
                                const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
                                const isBilan = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
                                let isReviewLocked = false;
                                if (isBilan && mounted) {
                                    const otherLessons = unitLessons.filter(l => l.id !== lesson.id && !l.isReview && !l.id?.startsWith('bilan-') && !l.id?.includes('-bilan'));
                                    isReviewLocked = !otherLessons.every(l => (lessonLevels[l.id] || 0) >= reviewUnlockLevel);
                                }
                                const isMaxLevel = level >= maxLevelPerLesson;

                                return (
                                    <div className="w-full" key={`mobile-node-${lesson.id}`}>
                                        <MobileTimelineNodeLayout
                                            lessonId={lesson.id}
                                            index={idx}
                                            level={level}
                                            maxLevel={maxLevelPerLesson}
                                            unitColorClass={unit.colorClass}
                                            unitTextClass={unit.textClass}
                                            unitShades={unit.shades}
                                            isReviewLocked={isReviewLocked}
                                            isMaxLevel={isMaxLevel}
                                            isReview={isBilan}
                                            onNodeClick={handleNodeClick(lesson, level, unit, isReviewLocked, pathType)}
                                            lesson={lesson}
                                            cardContent={
                                                <SharedLessonCard
                                                    pathType={pathType}
                                                    lesson={lesson}
                                                    level={level}
                                                    unit={unit}
                                                    language={language}
                                                    isReviewLocked={isReviewLocked}
                                                    suggestedLessonId={suggestedLessonId}
                                                    isMobileLayout={true}
                                                    index={idx}
                                                    maxLevelPerLesson={maxLevelPerLesson}
                                                    onClick={handleNodeClick(lesson, level, unit, isReviewLocked, pathType)}
                                                />
                                            }
                                        />

                                        <AnimatePresence>
                                            {expandedLessons.has(lesson.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="w-full overflow-hidden flex flex-col items-center mt-6 relative"
                                                >
                                                    <div className="w-full relative">
                                                        <LessonPathMap
                                                            maxLevel={maxLevelPerLesson}
                                                            currentProgress={level}
                                                            modalLevel={modalLevel ?? null}
                                                            setModalLevel={setModalLevel}
                                                            earnedStarsArray={lessonStars?.[lesson.id] || Array(maxLevelPerLesson + 1).fill(0)}
                                                            unitColor={unit.colorClass}
                                                            unitBorder={unit.borderClass}
                                                            unitText={unit.textClass}
                                                            language={language}
                                                            lessonId={lesson.id}
                                                            lesson={lesson}
                                                            lessonPartsCompleted={useProgressStore.getState().lessonPartsCompleted}
                                                            suggestionType={pathType}
                                                            initialScrollLevel={selectedLesson?.initialScrollLevel}
                                                            onReady={() => {}}
                                                            onBack={() => {
                                                                setExpandedLessons(prev => {
                                                                    const next = new Set(prev);
                                                                    next.delete(lesson.id);
                                                                    return next;
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {children}
                    </div>
                </motion.div>
            </main>
        </>
    );
}