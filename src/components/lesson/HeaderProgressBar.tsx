import { getTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { ArrowLeft, Star, Crown, Clock, BookOpen, HelpCircle, List } from "lucide-react";
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
  showHelpButton?: boolean;
  onShowHelp?: () => void;
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
  showHelpButton,
  onShowHelp,
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

      {/* Header transparent */}
      <header className="w-full bg-transparent shrink-0">
        {/* On utilise flex-wrap sur mobile pour permettre le passage à la ligne, et h-auto sur mobile / h-20 sur desktop */}
        <div className="w-full max-w-5xl mx-auto px-4 py-3 md:h-20 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-2 md:gap-x-6">

          {/* 1. BOUTON RETOUR (Reste toujours à gauche) */}
          <div className="flex items-center order-1">
            <IconButton
              onClick={() => setShowQuitConfirm(true)}
              size="md"
              className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </IconButton>
          </div>

          {/* 3. ACTIONS ET BADGES */}
          <div className="flex items-center gap-1 sm:gap-2 order-2 md:order-3">

            {/* Badge d'étoiles ou couronne */}
            {mode !== 'training' && mode !== 'revision' && !isReview && (
              <div className="flex items-center h-9 md:h-10 px-2.5 md:px-3 bg-white border border-slate-100 shadow-sm rounded-xl text-xs md:text-sm font-bold mr-1 md:mr-2">
                {customTitle ? (
                  customTitle
                ) : currentLevel < 9 ? (
                  <div className="flex text-amber-400 gap-0.5 items-center">
                    <Star size={15} className="fill-current" />
                    <span className="text-slate-600 ml-1">{earnedStars}</span>
                  </div>
                ) : (
                  <Crown size={15} className="text-amber-500 fill-current" />
                )}
              </div>
            )}

            {/* {showHelpButton && onShowHelp && (
              <button
                onClick={onShowHelp}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all bg-transparent rounded-xl outline-none"
                title={getTranslation('auto.help_instructions', language)}
              >
                <HelpCircle strokeWidth={2.5} className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]" />
              </button>
            )} */}
            {/* 
            {!isReview && setShowRomanization && !currentExercise?.forceHideRomanization && (
              <button
                onClick={() => setShowRomanization(!showRomanization)}
                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center font-bold border transition-all rounded-xl outline-none ${showRomanization
                    ? "text-indigo-600 bg-white border-slate-100 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-white hover:border-slate-100 hover:shadow-sm"
                  }`}
                title={showRomanization ? getTranslation('auto.hide_pronunciation', language) : getTranslation('auto.show_pronunciation', language)}
              >
                <span className="text-md md:text-lg font-semibold leading-none select-none">
                  {showRomanization ? "aA" : "ก"}
                </span>
              </button>
            )} */}

            {!isReview && setShowInfoModal && (
              <button
                onClick={() => setShowInfoModal(true)}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all bg-transparent rounded-xl outline-none"
                title={getTranslation('auto.vocabulary_list', language)}
              >
                {/* Correction ici également */}
                <List strokeWidth={2.5} className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]" />
              </button>
            )}
          </div>

          {/* 3. BARRE DE PROGRESSION (Prend 100% de large sur mobile et passe en dessous, se remet au milieu sur desktop) */}
          <div className="w-full md:w-auto md:flex-1 flex items-center gap-3 order-3 md:order-2 mt-1 md:mt-0">
            {/* Note le bg-slate-200/80 pour qu'on devine bien la barre vide sur ton fond gris très clair */}
            <div className="flex-1 h-2.5 md:h-3 bg-slate-200/80 rounded-full overflow-hidden">
              {isReview && timeLeft !== undefined && timeLeft !== null && initialTime ? (
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${timeLeft < 30 ? 'bg-red-500' : timeLeft < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  style={{ width: `${(timeLeft / initialTime) * 100}%` }}
                />
              ) : (
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>

            {/* Numérotation de l'exercice */}
            <span className="text-xs md:text-sm font-bold text-slate-400 tabular-nums min-w-[40px] text-right select-none">
              {isReview && timeLeft !== undefined && timeLeft !== null ? (
                <span className={timeLeft < 30 ? "text-red-500 animate-pulse" : ""}>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              ) : (
                `${currentIndex + 1}/${exercisesLength}`
              )}
            </span>
          </div>

        </div>
      </header>
    </>
  );
}
