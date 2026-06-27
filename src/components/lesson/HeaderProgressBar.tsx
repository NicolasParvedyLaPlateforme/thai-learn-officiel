import { getTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { X, Star, Crown, Clock, BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Exercise } from "@/types";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

interface HeaderProgressBarProps {
  lessonId: string;
  language: string;
  currentLevel: number;
  progress: number;
  earnedStars: number;
  currentIndex: number;
  exercisesLength: number;
  currentExercise: Exercise | undefined;
  showRomanization?: boolean;
  setShowRomanization?: (val: boolean) => void;
  setShowInfoModal?: (val: boolean) => void;
  isReview?: boolean;
  timeLeft?: number | null;
  initialTime?: number | null;
  returnUrl?: string;
  customTitle?: React.ReactNode;
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
  isReview,
  timeLeft,
  initialTime,
  returnUrl,
  customTitle,
}: HeaderProgressBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleQuit = () => {
    router.push(returnUrl || `/learn#lesson-${lessonId}`);
  };

  const handleTrainInstead = () => {
    const baseUrl = window.location.pathname;
    let url = `${baseUrl}?level=${currentLevel}&mode=training`;
    // We try to pass part info if we can, but since HeaderProgressBar doesn't get partIndex natively,
    // we just use the current searchParams
    const part = searchParams.get('part');
    const totalParts = searchParams.get('totalParts');
    if (part && totalParts) {
      url += `&part=${part}&totalParts=${totalParts}`;
    }
    window.location.href = url;
  };

  return (
    <>
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-center">
            <h3 className="text-xl font-bold text-slate-800">
              {getTranslation('auto.quit_lesson', language) || 'Quitter la leçon ?'}
            </h3>
            <p className="text-slate-500 font-medium">
              {getTranslation('auto.your_progress_will_be_saved', language) || 'Votre progression est sauvegardée. Vous pourrez revenir à tout moment pour terminer cet exercice.'}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              {!mode && currentLevel > 0 && (
                <Button variant="indigoGamified" size="lg" onClick={handleTrainInstead}>
                  {getTranslation('auto.train_instead', language) || 'S\'entraîner d\'abord (+10 XP)'}
                </Button>
              )}

              <Button variant="dangerSoft" size="lg" onClick={handleQuit}>
                {getTranslation('auto.quit', language)}
              </Button>

              <Button variant="flat" size="lg" onClick={() => setShowQuitConfirm(false)}>
                {getTranslation('auto.cancel', language)}
              </Button>
            </div>
          </div>
        </div>
      )}
      <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 sm:gap-6 w-full max-w-3xl mx-auto h-full px-4 flex-1">
          <IconButton
            onClick={() => setShowQuitConfirm(true)}
            size="md"
          >
            <X size={24} strokeWidth={2.5} />
          </IconButton>

          <div className="flex font-bold text-slate-400 text-sm sm:text-base items-center shrink-0">
            {mode === 'training' ? "Entraînement" : mode === 'revision' ? "Révision" : `${getTranslation('auto.lvl', language)} ${currentLevel + 1}`}
          </div>

          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden min-w-[2rem]">
            {isReview && timeLeft !== undefined && timeLeft !== null && initialTime ? (
              <div
                className={`h-full transition-all duration-1000 rounded-full ${timeLeft < 30 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                  timeLeft < 60 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  }`}
                style={{ width: `${(timeLeft / initialTime) * 100}%` }}
              />
            ) : (
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0 text-sm sm:text-base whitespace-nowrap overflow-hidden">
            {mode === 'training' || mode === 'revision' ? null : customTitle ? (
              customTitle
            ) : currentLevel < 9 && !isReview ? (
              <span className="flex items-center text-slate-400 font-semibold tracking-wide">
                <div className="hidden sm:flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < earnedStars ? "fill-current" : "text-slate-200 fill-slate-200"}
                    />
                  ))}
                </div>
                <div className="flex sm:hidden text-amber-400">
                  <Star size={16} className="fill-current" />
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-300 mx-1 sm:mx-2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <span className="hidden sm:inline">
                  {getTranslation('auto.lvl', language)} {currentLevel + 2}
                </span>
                <span className="sm:hidden">
                  {getTranslation('auto.lvl', language)} {currentLevel + 2}
                </span>
              </span>
            ) : (
              <span className="flex items-center text-amber-500">
                <Crown size={18} className="fill-current stroke-[2.5]" />
              </span>
            )}

            <span className="bg-slate-100 text-slate-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-semibold shrink-0 ml-1 flex items-center gap-1.5 tabular-nums">
              {isReview && timeLeft !== undefined && timeLeft !== null ? (
                <>
                  <Clock size={14} className={timeLeft < 30 ? "text-red-500" : "text-slate-400"} />
                  <span className={timeLeft < 30 ? "text-red-500 font-bold" : ""}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </>
              ) : (
                `${currentIndex + 1} / ${exercisesLength}`
              )}
            </span>

            {!isReview && setShowRomanization && !currentExercise?.forceHideRomanization && (
              <button
                onClick={() => setShowRomanization(!showRomanization)}
                className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl font-bold border-2 transition-colors ${showRomanization
                  ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  : "border-slate-200 text-slate-400 bg-white hover:bg-slate-100"
                  }`}
                title={
                  showRomanization
                    ? getTranslation('auto.hide_pronunciation', language)
                    : getTranslation('auto.show_pronunciation', language)
                }
              >
                <span className="text-xs font-mono">
                  {showRomanization ? "aA" : "ก"}
                </span>
              </button>
            )}

            {!isReview && setShowInfoModal && (
              <IconButton
                onClick={() => setShowInfoModal(true)}
                size="sm"
                title={getTranslation('auto.vocabulary_list', language)}
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
              </IconButton>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
