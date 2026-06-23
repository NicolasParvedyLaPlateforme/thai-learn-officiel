import { getTranslation } from "@/hooks/useTranslation";
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, Star, Clock, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Lesson } from "@/types";
import { useProgressStore } from "@/lib/store";
import { getLevelSplit } from "@/lib/levelSplits";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";

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
}: ResultScreenProps) {
  const router = useRouter();
  const searchParams = require('next/navigation').useSearchParams();
  const setLastActiveUnitIndex = useProgressStore((s) => s.setLastActiveUnitIndex);
  
  const percentage = failedDueToTime && currentIndex !== undefined ? Math.round((currentIndex / exercisesLength) * 100) : 100;
  const timeTakenSec = initialTime !== undefined && initialTime !== null && timeLeft !== undefined && timeLeft !== null ? initialTime - Math.max(0, timeLeft) : null;
  
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
          <button
            onClick={() => handleNavigate(`/${pathType === 'alphabet' ? 'alphabet' : 'learn'}#lesson-${lesson.id}`, language === "en" ? "Back" : "Accueil")}
            className="px-8 py-3 flex-1 rounded-xl bg-slate-200 border-b-4 border-slate-300 text-slate-500 font-bold text-lg shadow-lg hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {getTranslation('auto.back', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
      <div className="text-emerald-500 mb-2">
        <Check size={80} className="mx-auto" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
          >
            <Star
              size={48}
              className={
                i < earnedStars
                  ? "fill-amber-400 text-amber-500"
                  : "fill-slate-200 text-slate-300 drop-shadow-sm"
              }
            />
          </motion.div>
        ))}
      </div>
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
      
      {(lesson.isReview || currentLevel === 10) && timeTakenSec !== null ? (
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
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {nextUnitIndex !== -1 && (
          <button
            onClick={() => {
              setLastActiveUnitIndex(nextUnitIndex);
              handleNavigate(pathType === 'alphabet' ? "/alphabet" : "/learn", getTranslation('auto.next_unit', language));
            }}
            className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all text-center"
          >
            {getTranslation('auto.next_unit', language)}
          </button>
        )}
        {mode !== 'training' && mode !== 'revision' && isPart && partIndex !== undefined && partIndex !== null && totalParts !== undefined && totalParts !== null && partIndex < totalParts - 1 ? (
          <button
            onClick={() =>
              handleNavigate(`/${pathType === 'alphabet' ? 'alphabet/lesson' : 'lesson'}/${lesson.id}?level=${currentLevel + 1}&part=${partIndex + 1}&totalParts=${totalParts}`, language === "en" ? "Next Part" : "Partie suivante")
            }
            className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {language === "en" ? "Next Part" : "Partie suivante"}
          </button>
        ) : mode !== 'training' && mode !== 'revision' && currentLevel + 1 < (pathType === 'alphabet' ? 4 : 10) && (
          <button
            onClick={() => {
              const basePath = pathType === 'alphabet' ? '/alphabet/lesson' : '/lesson';
              const nextTotalParts = pathType === 'alphabet' ? 1 : getLevelSplit(currentLevel + 1, lesson);
              if (nextTotalParts > 1) {
                handleNavigate(`${basePath}/${lesson.id}?level=${currentLevel + 2}&part=0&totalParts=${nextTotalParts}`, getTranslation('auto.next_level', language));
              } else {
                handleNavigate(`${basePath}/${lesson.id}?level=${currentLevel + 2}`, getTranslation('auto.next_level', language));
              }
            }}
            className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {getTranslation('auto.next_level', language)}
          </button>
        )}
        
        {mode === 'training' && (
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 flex-1 rounded-xl bg-blue-500 border-b-4 border-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            S'entraîner à nouveau
          </button>
        )}

        {mode === 'revision' && (
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 flex-1 rounded-xl bg-purple-500 border-b-4 border-purple-700 text-white font-bold text-lg shadow-lg hover:bg-purple-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Réviser à nouveau
          </button>
        )}

        <button
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
               router.push(pathType === 'alphabet' ? '/alphabet' : '/learn');
            }
          }}
          className="px-8 py-3 flex-1 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
        >
          {mode === 'training' ? "Enchaîner la leçon" : getTranslation('auto.continue', language)}
        </button>
      </div>
    </div>
  );
}
