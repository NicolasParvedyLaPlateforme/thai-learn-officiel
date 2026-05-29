import { X, Star, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Exercise } from "../../../types";

interface HeaderProgressBarProps {
  lessonId: string;
  language: string;
  currentLevel: number;
  progress: number;
  earnedStars: number;
  currentIndex: number;
  exercisesLength: number;
  currentExercise: Exercise | undefined;
  showRomanization: boolean;
  setShowRomanization: (val: boolean) => void;
  setShowInfoModal: (val: boolean) => void;
}

export default function HeaderProgressBar({
  lessonId,
  language,
  currentLevel,
  progress,
  earnedStars,
  currentIndex,
  exercisesLength,
  currentExercise,
  showRomanization,
  setShowRomanization,
  setShowInfoModal,
}: HeaderProgressBarProps) {
  const router = useRouter();

  return (
    <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3 sm:gap-6 w-full max-w-3xl mx-auto h-full px-4 flex-1">
        <button
          onClick={() => router.push(`/learn#lesson-${lessonId}`)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="flex font-bold text-slate-400 text-sm sm:text-base items-center shrink-0">
          {language === "en" ? "Lvl." : "Niv."} {currentLevel + 1}
        </div>

        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden min-w-[2rem]">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="font-bold text-slate-400 flex items-center gap-2 sm:gap-3 text-sm sm:text-base shrink-0">
          <div className="hidden sm:flex items-center gap-0.5 mr-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < earnedStars
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }
              />
            ))}
          </div>
          {currentLevel + 1 < 9 ? (
            <span className="flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-300"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              {language === "en" ? "Lvl." : "Niv."} {currentLevel + 2}
            </span>
          ) : (
            <span className="flex items-center text-amber-500">
              <Crown size={18} className="fill-current stroke-[2.5]" />
            </span>
          )}

          <span className="bg-slate-100 text-slate-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-semibold shrink-0 ml-1">
            {currentIndex + 1} / {exercisesLength}
          </span>

          {!currentExercise?.forceHideRomanization && (
            <button
              onClick={() => setShowRomanization(!showRomanization)}
              className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl font-bold border-2 transition-colors ${
                showRomanization
                  ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  : "border-slate-200 text-slate-400 bg-white hover:bg-slate-100"
              }`}
              title={
                showRomanization
                  ? language === "en"
                    ? "Hide Pronunciation"
                    : "Masquer la prononciation"
                  : language === "en"
                    ? "Show Pronunciation"
                    : "Afficher la prononciation"
              }
            >
              <span className="text-xs font-mono">
                {showRomanization ? "aA" : "ก"}
              </span>
            </button>
          )}

          <button
            onClick={() => setShowInfoModal(true)}
            className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
            title={
              language === "en" ? "Vocabulary List" : "Liste de vocabulaire"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
