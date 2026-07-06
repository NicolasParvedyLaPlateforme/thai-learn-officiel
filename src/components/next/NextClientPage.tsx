'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/lib/store';
import { getLightweightLessons } from '@/actions/course';
import { computeUnits } from '@/lib/lesson-utils';
import {
  computeNextLesson,
  buildNextLessonUrl,
  getDailyUnitIndex,
  getLocalDateString,
} from '@/lib/next-mode-utils';
import { getTranslation, getLocalizedField } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { m as motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';
import BASE_UNITS from '@/data/units.json';

export default function NextClientPage() {
  const router = useRouter();

  const {
    language,
    lessonLevels,
    lessonPartsCompleted,
    fullLevelsCompleted,
    lessonStars,
    nextModeUnit,
    setNextModeUnit,
    _hasHydrated,
  } = useProgressStore();

  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Chargement des leçons légères
  useEffect(() => {
    getLightweightLessons().then((data) => {
      setLessons(data);
      setIsLoading(false);
    });
  }, []);

  // Calcul des unités
  const units = useMemo(() => computeUnits(BASE_UNITS as any[], lessons), [lessons]);

  // Gestion de l'unité du jour
  const dailyUnitIndex = useMemo(() => {
    if (units.length === 0) return 0;
    return getDailyUnitIndex(units.length, nextModeUnit);
  }, [units.length, nextModeUnit]);

  // Persister l'unité du jour si elle a changé
  useEffect(() => {
    if (units.length === 0) return;
    const today = getLocalDateString();
    if (!nextModeUnit || nextModeUnit.date !== today) {
      const newIndex = getDailyUnitIndex(units.length, nextModeUnit);
      setNextModeUnit({ unitIndex: newIndex, date: today });
    }
  }, [units.length, nextModeUnit, setNextModeUnit]);

  const dailyUnit = units[dailyUnitIndex] as any;

  // Leçons de l'unité du jour
  const unitLessons = useMemo(() => {
    if (!dailyUnit || lessons.length === 0) return [];
    return lessons.slice(dailyUnit.startIndex, dailyUnit.endIndex);
  }, [dailyUnit, lessons]);

  // Seed journalier stable (basé sur la date)
  const dailySeed = useMemo(() => {
    const today = getLocalDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }, []);

  // Calcul du prochain exercice
  const nextLesson = useMemo(() => {
    if (!_hasHydrated || unitLessons.length === 0) return undefined;
    return computeNextLesson(
      unitLessons,
      lessonLevels,
      lessonPartsCompleted,
      fullLevelsCompleted,
      lessonStars,
      dailySeed
    );
  }, [
    _hasHydrated,
    unitLessons,
    lessonLevels,
    lessonPartsCompleted,
    fullLevelsCompleted,
    lessonStars,
    dailySeed,
  ]);

  const isAllDone = _hasHydrated && !isLoading && nextLesson === null;

  const handleNext = () => {
    if (!nextLesson || isNavigating) return;
    setIsNavigating(true);
    const url = buildNextLessonUrl(nextLesson);
    router.push(url);
  };

  // Nom de la leçon courante à lancer
  const nextLessonData = useMemo(() => {
    if (!nextLesson) return null;
    return unitLessons.find((l) => l.id === nextLesson.lessonId) || null;
  }, [nextLesson, unitLessons]);

  const nextLessonName = nextLessonData
    ? getLocalizedField(nextLessonData, 'title', language)
    : null;

  const levelLabel = (() => {
    if (!nextLesson) return null;
    const formatNextLessonSubtitle = (lvl: number, nextLesson?: any) => {
      if (lvl === 10) return getTranslation('auto.ultimate_level', language);
      const num = lvl + 1;
      if (nextLesson && nextLesson.type === 'full') return `${getTranslation('auto.level', language)}${num} ${getTranslation('auto.full_parentheses', language)}`;
      if (nextLesson && typeof nextLesson.partIndex === 'number' && typeof nextLesson.totalParts === 'number') {
        return `${getTranslation('auto.level', language)}${num} — ${getTranslation('auto.part', language)}${nextLesson.partIndex + 1}/${nextLesson.totalParts}`;
      }
      return `${getTranslation('auto.level', language)}${num}`;
    };
    return formatNextLessonSubtitle(nextLesson.levelIndex, nextLesson);
  })();

  const unitName = dailyUnit ? getLocalizedField(dailyUnit, 'title', language) : null;
  const unitColor: string = (dailyUnit as any)?.colorClass || 'bg-emerald-500';
  const unitTextColor: string = (dailyUnit as any)?.textClass || 'text-emerald-500';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FAFAFA] font-sans">
      {/* Fond décoratif subtil */}
      <div
        className={`absolute inset-0 opacity-[0.04] pointer-events-none`}
        style={{
          background: `radial-gradient(ellipse at 50% 40%, var(--tw-gradient-from, #10b981) 0%, transparent 70%)`,
        }}
      />
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-100 blur-3xl opacity-40 -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-indigo-100 blur-3xl opacity-40 translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <AnimatePresence mode="wait">
        {isLoading || !_hasHydrated ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 animate-pulse" />
            <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
          </motion.div>
        ) : isAllDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center px-6 max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
                {getTranslation('next.all_done', language)}
              </h1>
              <p className="text-slate-500 font-medium">
                {getTranslation('next.all_done_sub', language)}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8 text-center px-6 max-w-sm w-full"
          >
            {/* Titre */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {getTranslation('next.title', language)}
                </span>
                <Zap size={18} className="text-amber-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                {getTranslation('next.subtitle', language)}
              </h1>
            </div>

            {/* Info unité du jour */}
            {dailyUnit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <BookOpen size={13} />
                  {getTranslation('next.daily_unit', language)}
                </div>
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${unitColor}`} />
                  <div className="text-left">
                    <p className={`font-extrabold text-sm ${unitTextColor}`}>{unitName}</p>
                    {nextLessonName && (
                      <p className="text-slate-500 text-xs font-medium mt-0.5 truncate max-w-[200px]">
                        {nextLessonName}
                      </p>
                    )}
                    {levelLabel && (
                      <p className="text-slate-400 text-xs mt-0.5">{levelLabel}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Le bouton principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full"
            >
              <Button
                id="next-mode-button"
                variant="gamified"
                size="lg"
                className="w-full text-xl py-6 uppercase tracking-widest gap-3 shadow-lg shadow-emerald-200"
                onClick={handleNext}
                disabled={isNavigating || !nextLesson}
              >
                {isNavigating ? (
                  <span className="animate-pulse">…</span>
                ) : (
                  <>
                    {getTranslation('next.button', language)}
                    <ChevronRight size={24} />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
