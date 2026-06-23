import { getTranslation } from "@/hooks/useTranslation";
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, Star, RotateCcw, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "@/lib/store";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import { Button } from "@/components/ui/Button";

interface SpeakResultScreenProps {
  lessonId: string;
  currentLevel: number;
  earnedStars: number;
  exercisesLength: number;
  language: string;
  earnedXp: number;
  elapsedTimeSec?: number;
}

export default function SpeakResultScreen({
  lessonId,
  currentLevel,
  earnedStars,
  exercisesLength,
  language,
  earnedXp,
  elapsedTimeSec,
}: SpeakResultScreenProps) {
  const router = useRouter();

  const { unopenedGifts } = useProgressStore();

  const handleNavigate = (nextUrl: string, nextLabel: string) => {
    const giftsAvailable = unopenedGifts?.speak || 0;
    if (giftsAvailable > 0) {
      const replayUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      router.push(`/reward?category=speak&nextUrl=${encodeURIComponent(nextUrl)}&nextLabel=${encodeURIComponent(nextLabel)}&replayUrl=${encodeURIComponent(replayUrl)}`);
    } else {
      router.push(nextUrl);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
        {currentLevel === 10
          ? (getTranslation('auto.mastery_level_completed', language))
          : (getTranslation('auto.level_completed', language) || 'Niveau {level} terminé !').replace('{level}', String(currentLevel + 1))}
      </h1>

      {elapsedTimeSec !== undefined && elapsedTimeSec !== null ? (
        <p className="text-indigo-500 mb-4 text-center text-lg font-bold flex items-center justify-center gap-2">
          <Clock size={20} />
          {language === "en" ? `Time: ${formatTime(elapsedTimeSec)}` : `Temps : ${formatTime(elapsedTimeSec)}`}
        </p>
      ) : (
        <p className="text-slate-500 mb-4 text-center text-lg font-medium">
          + {earnedXp !== undefined ? earnedXp : exercisesLength * 3} XP
        </p>
      )}

      <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <DailyQuestsWidget category="speak" />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-lg">
        {currentLevel + 1 < 5 && (
          <Button
            variant="indigoGamified"
            size="lg"
            className="w-full text-lg uppercase tracking-widest"
            onClick={() =>
              handleNavigate(`/speak/lesson/${lessonId}?level=${currentLevel + 2}`, getTranslation('auto.next_level', language))
            }
          >
            {getTranslation('auto.next_level', language)}
          </Button>
        )}
        <div className="flex flex-row gap-4 w-full">
          <Button
            variant="flat"
            size="lg"
            className="flex-1 text-lg uppercase tracking-widest gap-2"
            onClick={() => router.push(`/speak#lesson-${lessonId}`)}
          >
            <LogOut size={20} className="rotate-180" />
            {getTranslation('auto.back', language) || "Retour"}
          </Button>

          <Button
            variant="gamifiedSecondary"
            size="lg"
            className="px-0 w-16 shrink-0"
            onClick={() => window.location.reload()}
            title={getTranslation('auto.retry', language) || "Recommencer"}
          >
            <RotateCcw size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
