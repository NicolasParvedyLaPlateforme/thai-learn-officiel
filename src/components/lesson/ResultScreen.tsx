import { getTranslation } from "@/hooks/useTranslation";
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, Star, Clock, RotateCcw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lesson } from "@/types";
import { useProgressStore } from "@/lib/store";
import { getLevelSplit } from "@/lib/levelSplits";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import { AnimatedStars } from "@/components/ui/AnimatedStars";

interface ResultScreenProps {
  lesson: Lesson;
  currentLevel: number;
  earnedStars: number;
  exercisesLength: number;
  language: string;
  nextUnitIndex: number;
  failedDueToTime?: boolean;
  timeLeft?: number | null;
  initialTime?: number | null;
  earnedXp?: number;
  isPart?: boolean;
  partIndex?: number | null;
  totalParts?: number | null;
  currentIndex?: number;
  mode?: string | null;
  pathType?: "learn" | "alphabet" | "speak";
  elapsedTimeSec?: number;
}

export default function ResultScreen({
  lesson,
  currentLevel,
  earnedStars,
  exercisesLength,
  language,
  nextUnitIndex,
  failedDueToTime,
  timeLeft,
  initialTime,
  currentIndex,
  earnedXp,
  isPart,
  partIndex,
  totalParts,
  mode,
  pathType = "learn",
  elapsedTimeSec,
}: ResultScreenProps) {
  const router = useRouter();
  const searchParams = require('next/navigation').useSearchParams();
  const setLastActiveUnitIndex = useProgressStore((s) => s.setLastActiveUnitIndex);

  const percentage = failedDueToTime && currentIndex !== undefined ? Math.round((currentIndex / exercisesLength) * 100) : 100;

  let timeTakenSec = null;
  if (elapsedTimeSec !== undefined) {
    timeTakenSec = elapsedTimeSec;
  } else if (initialTime !== undefined && initialTime !== null && timeLeft !== undefined && timeLeft !== null) {
    timeTakenSec = initialTime - Math.max(0, timeLeft);
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}min ${s}s`;
  };

  const { unopenedGifts } = useProgressStore();

  const handleNavigate = (nextUrl: string, nextLabel: string) => {
    const giftsAvailable = (pathType === 'alphabet' ? unopenedGifts?.alphabet : unopenedGifts?.learn) || 0;
    if (giftsAvailable > 0) {
      const replayUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      router.push(`/reward?category=${pathType === 'alphabet' ? 'alphabet' : 'learn'}&nextUrl=${encodeURIComponent(nextUrl)}&nextLabel=${encodeURIComponent(nextLabel)}&replayUrl=${encodeURIComponent(replayUrl)}`);
    } else {
      router.push(nextUrl);
    }
  };

  if (failedDueToTime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <div className="text-rose-500 mb-2">
          <Clock size={80} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center mt-6">
          {getTranslation('auto.time_s_up', language)}
        </h1>
        <p className="text-slate-500 mb-8 text-center text-lg font-medium">
          {language === "en" ? `Completion: ${percentage}%` : `Complété à : ${percentage}%`}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button
            onClick={() => handleNavigate(`/${pathType === 'alphabet' ? 'alphabet/lesson' : 'lesson'}/${lesson.id}?level=${currentLevel + 1}`, language === "en" ? "Retry" : "Refaire")}
            className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            {getTranslation('auto.retry', language)}
          </button>

          <Button
            variant="flat"
            size="lg"
            className="flex-1 text-lg uppercase tracking-widest gap-2"
            onClick={() => handleNavigate(`/${pathType === 'alphabet' ? 'alphabet' : 'learn'}#lesson-${lesson.id}`, getTranslation('auto.back', language))}>
            <LogOut size={20} className="rotate-180" />
            {getTranslation('auto.back', language)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
      <div className="text-emerald-500 mb-2">
        <Check size={80} className="mx-auto" />
      </div>
      <AnimatedStars earnedStars={earnedStars} />
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm text-center mb-2 px-4">
        {mode === 'training'
          ? "Entraînement terminé !"
          : mode === 'revision'
            ? "Révision terminée !"
            : currentLevel === 10
              ? getTranslation('auto.mastery_level_completed', language)
              : isPart && partIndex !== undefined && partIndex !== null && totalParts !== undefined && totalParts !== null
                ? `Partie ${partIndex + 1}/${totalParts} terminée !`
                : (language === "en"
                  ? `Level ${currentLevel + 1} completed!`
                  : `Niveau ${currentLevel + 1} terminé !`)
        }
      </h2>

      {timeTakenSec !== null ? (
        <p className="text-indigo-500 mb-4 text-center text-lg font-bold flex items-center justify-center gap-2">
          <Clock size={20} />
          {language === "en" ? `Time: ${formatTime(timeTakenSec)}` : `Temps : ${formatTime(timeTakenSec)}`}
        </p>
      ) : (
        <p className="text-slate-500 mb-4 text-center text-lg font-medium">
          + {earnedXp !== undefined ? earnedXp : 10 + exercisesLength} XP
        </p>
      )}

      <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <DailyQuestsWidget category={pathType === 'alphabet' ? 'alphabet' : 'learn'} />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-lg">
        {nextUnitIndex !== -1 && (
          <Button
            variant="amberGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest"
            onClick={() => {
              setLastActiveUnitIndex(nextUnitIndex);
              handleNavigate(pathType === 'alphabet' ? "/alphabet" : "/learn", getTranslation('auto.next_unit', language));
            }}
          >
            {getTranslation('auto.next_unit', language)}
          </Button>
        )}
        {mode !== 'training' && mode !== 'revision' && isPart && partIndex !== undefined && partIndex !== null && totalParts !== undefined && totalParts !== null && partIndex < totalParts - 1 ? (
          <Button
            variant="indigoGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest"
            onClick={() =>
              handleNavigate(`/${pathType === 'alphabet' ? 'alphabet/lesson' : 'lesson'}/${lesson.id}?level=${currentLevel + 1}&part=${partIndex + 1}&totalParts=${totalParts}`, language === "en" ? "Next Part" : "Partie suivante")
            }
          >
            {language === "en" ? "Next Part" : "Partie suivante"}
          </Button>
        ) : mode !== 'training' && mode !== 'revision' && currentLevel + 1 < (pathType === 'alphabet' ? 4 : 10) && (
          <Button
            variant="indigoGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest"
            onClick={() => {
              const basePath = pathType === 'alphabet' ? '/alphabet/lesson' : '/lesson';
              const nextTotalParts = pathType === 'alphabet' ? 1 : getLevelSplit(currentLevel + 1, lesson);
              if (nextTotalParts > 1) {
                handleNavigate(`${basePath}/${lesson.id}?level=${currentLevel + 2}&part=0&totalParts=${nextTotalParts}`, getTranslation('auto.next_level', language));
              } else {
                handleNavigate(`${basePath}/${lesson.id}?level=${currentLevel + 2}`, getTranslation('auto.next_level', language));
              }
            }}
          >
            {getTranslation('auto.next_level', language)}
          </Button>
        )}

        {mode === 'training' && (
          <Button
            variant="blueGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={20} />
            S'entraîner à nouveau
          </Button>
        )}

        {mode === 'revision' && (
          <Button
            variant="purpleGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={20} />
            Réviser à nouveau
          </Button>
        )}

        <div className="flex flex-row gap-4 w-full">
          <Button
            variant={mode === 'training' ? "gamified" : "flat"}
            size="lg"
            className="flex-1 text-lg uppercase tracking-widest gap-2"
            onClick={() => {
              if (mode === 'training') {
                const partStr = searchParams.get("part");
                const totalPartsStr = searchParams.get("totalParts");
                let url = `/${pathType === 'alphabet' ? 'alphabet/lesson' : 'lesson'}/${lesson.id}?level=${currentLevel + 1}`;
                if (partStr && totalPartsStr) {
                  url += `&part=${partStr}&totalParts=${totalPartsStr}`;
                }
                handleNavigate(url, "Enchaîner la leçon");
              } else {
                const backUrl = pathType === 'alphabet' ? `/alphabet#lesson-${lesson.id}` : pathType === 'speak' ? `/speak#lesson-${lesson.id}` : `/learn#lesson-${lesson.id}`;
                router.push(backUrl);
              }
            }}
          >
            {mode === 'training' ? "Enchaîner la leçon" : (
              <>
                <LogOut size={20} className="rotate-180" />
                {getTranslation('auto.back', language) || "Retour"}
              </>
            )}
          </Button>

          {mode !== 'training' && mode !== 'revision' && (
            <Button
              variant="gamifiedSecondary"
              size="lg"
              className="px-0 w-16 shrink-0"
              onClick={() => window.location.reload()}
              title={getTranslation('auto.retry', language) || "Recommencer"}
            >
              <RotateCcw size={24} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
