'use client';

import { useRouter } from 'next/navigation';
import { m as motion } from 'motion/react';
import { Check, Clock, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedStars } from '@/components/ui/AnimatedStars';
import { getTranslation } from '@/hooks/useTranslation';
import { useProgressStore } from '@/lib/store';
import {
  computeNextLesson,
  buildNextLessonUrl,
  getLocalDateString,
} from '@/lib/next-mode-utils';
import { useMemo } from 'react';
import { computeUnits } from '@/lib/lesson-utils';
import BASE_UNITS from '@/data/units.json';

interface NextResultScreenProps {
  lesson: any;
  currentLevel: number;
  earnedStars: number;
  earnedXp?: number;
  isPart?: boolean;
  partIndex?: number | null;
  totalParts?: number | null;
  elapsedTimeSec?: number;
  language: string;
  /** Leçons légères de l'unité du jour pour calculer la suite */
  allLessons: any[];
}

export default function NextResultScreen({
  lesson,
  currentLevel,
  earnedStars,
  earnedXp,
  isPart,
  partIndex,
  totalParts,
  elapsedTimeSec,
  language,
  allLessons,
}: NextResultScreenProps) {
  const router = useRouter();

  const {
    lessonLevels,
    lessonPartsCompleted,
    fullLevelsCompleted,
    lessonStars,
    nextModeUnit,
  } = useProgressStore();

  // Calcul des unités et seed
  const units = useMemo(() => computeUnits(BASE_UNITS as any[], allLessons), [allLessons]);

  const dailySeed = useMemo(() => {
    const today = getLocalDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }, []);

  const dailyUnitIndex = nextModeUnit?.unitIndex ?? 0;
  const dailyUnit = units[dailyUnitIndex];

  const unitLessons = useMemo(() => {
    if (!dailyUnit || allLessons.length === 0) return [];
    return allLessons.slice((dailyUnit as any).startIndex, (dailyUnit as any).endIndex);
  }, [dailyUnit, allLessons]);

  // Prochain exercice après celui qu'on vient de faire
  const nextLessonResult = useMemo(() => {
    if (unitLessons.length === 0) return null;
    return computeNextLesson(
      unitLessons,
      lessonLevels,
      lessonPartsCompleted,
      fullLevelsCompleted,
      lessonStars,
      dailySeed
    );
  }, [unitLessons, lessonLevels, lessonPartsCompleted, fullLevelsCompleted, lessonStars, dailySeed]);

  const handleNext = () => {
    if (!nextLessonResult) {
      router.push('/next');
      return;
    }
    const url = buildNextLessonUrl(nextLessonResult);
    router.push(url);
  };

  const handleQuit = () => {
    router.push('/next');
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}min ${s}s`;
  };

  const levelLabel = (() => {
    const num = currentLevel + 1;
    if (currentLevel === 10) return language === 'en' ? 'Ultimate Level' : 'Niveau Ultime';
    if (isPart && partIndex !== null && partIndex !== undefined && totalParts) {
      return language === 'en'
        ? `Level ${num} — Part ${partIndex + 1}/${totalParts} completed!`
        : `Niveau ${num} — Partie ${partIndex + 1}/${totalParts} terminée !`;
    }
    return language === 'en' ? `Level ${num} completed!` : `Niveau ${num} terminé !`;
  })();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
      {/* Icône de succès */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="text-emerald-500 mb-2"
      >
        <Check size={80} className="mx-auto" />
      </motion.div>

      <AnimatedStars earnedStars={earnedStars} />

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight text-center mb-4 px-4"
      >
        {levelLabel}
      </motion.h2>

      {/* XP et temps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-6 mb-10"
      >
        {earnedXp !== undefined && earnedXp > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-amber-500">+{earnedXp}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">XP</span>
          </div>
        )}
        {elapsedTimeSec !== undefined && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-indigo-500 flex items-center gap-1">
              <Clock size={20} />
              {formatTime(elapsedTimeSec)}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {language === 'en' ? 'Time' : 'Temps'}
            </span>
          </div>
        )}
      </motion.div>

      {/* Boutons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button
          id="next-result-continue"
          variant="gamified"
          size="lg"
          className="w-full text-lg uppercase tracking-widest gap-2"
          onClick={handleNext}
        >
          {getTranslation('next.result.next', language)}
          <ChevronRight size={20} />
        </Button>

        <Button
          id="next-result-quit"
          variant="retour"
          size="lg"
          className="w-full text-lg gap-2"
          onClick={handleQuit}
        >
          <LogOut size={18} className="rotate-180" />
          {getTranslation('next.result.quit', language)}
        </Button>
      </motion.div>
    </div>
  );
}
