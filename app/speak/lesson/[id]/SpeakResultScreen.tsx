import { getTranslation } from '../../../hooks/useTranslation';
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, Star, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProgressStore } from "../../lib/store";
import { DailyQuestsWidget } from "../../components/DailyQuestsWidget";

interface SpeakResultScreenProps {
  lessonId: string;
  currentLevel: number;
  earnedStars: number;
  exercisesLength: number;
  language: string;
  earnedXp: number;
}

export default function SpeakResultScreen({
  lessonId,
  currentLevel,
  earnedStars,
  exercisesLength,
  language,
  earnedXp,
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
      
      <p className="text-slate-500 mb-4 text-center text-lg font-medium">
        + {earnedXp !== undefined ? earnedXp : exercisesLength * 3} XP
      </p>

      <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <DailyQuestsWidget category="speak" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {currentLevel + 1 < 5 && (
          <button
            onClick={() =>
              handleNavigate(`/speak/lesson/${lessonId}?level=${currentLevel + 2}`, getTranslation('auto.next_level', language))
            }
            className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {getTranslation('auto.next_level', language)}
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          {getTranslation('auto.retry', language)}
        </button>
        <button
          onClick={() => router.push(`/speak`)}
          className="px-8 py-3 flex-1 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
        >
          {getTranslation('auto.back', language)}
        </button>
      </div>
    </div>
  );
}
