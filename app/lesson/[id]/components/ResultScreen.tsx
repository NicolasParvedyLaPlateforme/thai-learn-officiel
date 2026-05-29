import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Lesson } from "../../../types";
import { useProgressStore } from "../../../lib/store";

interface ResultScreenProps {
  lesson: Lesson;
  currentLevel: number;
  earnedStars: number;
  exercisesLength: number;
  language: string;
  nextUnitIndex: number;
}

export default function ResultScreen({
  lesson,
  currentLevel,
  earnedStars,
  exercisesLength,
  language,
  nextUnitIndex,
}: ResultScreenProps) {
  const router = useRouter();
  const setLastActiveUnitIndex = useProgressStore((s) => s.setLastActiveUnitIndex);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
      <div className="text-orange-500 mb-2">
        <Check size={80} className="mx-auto" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
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
        {language === "en"
          ? `Level ${currentLevel + 1} completed!`
          : `Niveau ${currentLevel + 1} terminé !`}
      </h1>
      <p className="text-slate-500 mb-8 text-center text-lg font-medium">
        + {10 + exercisesLength} XP
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {nextUnitIndex !== -1 && (
          <button
            onClick={() => {
              setLastActiveUnitIndex(nextUnitIndex);
              router.push("/learn");
            }}
            className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all text-center"
          >
            {language === "en" ? "Next Unit" : "Aller à l'unité suivante"}
          </button>
        )}
        {currentLevel + 1 < 9 && (
          <button
            onClick={() =>
              router.push(`/lesson/${lesson.id}?level=${currentLevel + 2}`)
            }
            className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {language === "en" ? "Next Level" : "Prochain Niveau"}
          </button>
        )}
        <button
          onClick={() => router.push(`/learn#lesson-${lesson.id}`)}
          className="px-8 py-3 flex-1 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
        >
          {language === "en" ? "Back" : "Retour"}
        </button>
      </div>
    </div>
  );
}
