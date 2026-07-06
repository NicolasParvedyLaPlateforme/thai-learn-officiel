"use client";

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Crown, List } from "lucide-react";
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

/** Affiche 5 étoiles avec animation sur la perte d'une étoile */
function StarsBadge({
  earnedStars,
  currentLevel,
  customTitle,
  mode,
  isReview,
}: {
  earnedStars: number;
  currentLevel: number;
  customTitle?: React.ReactNode;
  mode: string | null;
  isReview?: boolean;
}) {
  const prevStars = useRef(earnedStars);
  const [lostStarIndex, setLostStarIndex] = useState<number | null>(null);

  useEffect(() => {
    if (earnedStars < prevStars.current) {
      // L'étoile perdue est celle à l'index earnedStars (0-based)
      setLostStarIndex(earnedStars);
      const timer = setTimeout(() => setLostStarIndex(null), 700);
      prevStars.current = earnedStars;
      return () => clearTimeout(timer);
    }
    prevStars.current = earnedStars;
  }, [earnedStars]);

  if (mode === 'training' || mode === 'revision' || isReview) return null;

  if (customTitle) {
    return (
      <div className="flex items-center h-8 md:h-10 px-2.5 md:px-3 bg-white border border-slate-100 shadow-sm rounded-xl text-xs md:text-sm font-bold">
        {customTitle}
      </div>
    );
  }

  if (currentLevel >= 9) {
    return (
      <div className="flex items-center h-8 md:h-10 px-2.5 md:px-3 bg-white border border-slate-100 shadow-sm rounded-xl">
        <Crown size={15} className="text-amber-500 fill-current" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 md:gap-1 h-8 md:h-10 px-2 md:px-3">
      {Array.from({ length: 5 }).map((_, i) => {
        const earned = i < earnedStars;
        const isLosing = i === lostStarIndex;
        return (
          <span
            key={i}
            style={{
              display: "inline-flex",
              transform: isLosing ? "scale(0.5)" : "scale(1)",
              opacity: isLosing ? 0 : 1,
              transition: isLosing
                ? "transform 0.35s cubic-bezier(0.36,0.07,0.19,0.97), opacity 0.35s ease"
                : "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            <Star
              size={13}
              className={
                earned
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-300"
              }
            />
          </span>
        );
      })}
    </div>
  );
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
    const part = searchParams.get('part');
    const totalParts = searchParams.get('totalParts');
    if (part && totalParts) {
      url += `&part=${part}&totalParts=${totalParts}`;
    }
    window.location.href = url;
  };

  // Affichage du temps restant (review) ou numéro d'étape
  const isTimerMode = isReview && timeLeft !== undefined && timeLeft !== null;

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
        {/* ── MOBILE LAYOUT ── */}
        <div className="md:hidden flex flex-col">

          {/* Ligne 1 : retour | étoiles | liste — avec padding horizontal */}
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            {/* Retour */}
            <IconButton
              onClick={() => setShowQuitConfirm(true)}
              size="md"
              className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none -ml-1"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </IconButton>

            {/* Étoiles (centre) */}
            <StarsBadge
              earnedStars={earnedStars}
              currentLevel={currentLevel}
              customTitle={customTitle}
              mode={mode}
              isReview={isReview}
            />

            {/* Bouton liste glossaire */}
            <div className="flex items-center gap-1">
              {!isReview && setShowInfoModal && (
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all bg-transparent rounded-xl outline-none"
                  title={getTranslation('auto.vocabulary_list', language)}
                >
                  <List strokeWidth={2.5} className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>
          </div>

          {/* Barre de progression : pleine largeur, collée aux bords, sans arrondi */}
          <div className="w-full h-1 bg-slate-200/80">
            {isTimerMode && initialTime ? (
              <div
                className={`h-full transition-all duration-1000 ${timeLeft! < 30 ? 'bg-red-500' : timeLeft! < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${(timeLeft! / initialTime) * 100}%` }}
              />
            ) : (
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>

          {/* Numéros : juste en dessous de la barre, avec padding horizontal */}
          {!isTimerMode ? (
            <div className="flex items-center justify-between px-3 pt-1">
              <span className="text-xs font-bold text-slate-500 tabular-nums select-none">
                {currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-300 tabular-nums select-none">
                {exercisesLength}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center px-3 pt-1">
              <span className={`text-xs font-bold tabular-nums select-none ${timeLeft! < 30 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                {Math.floor(timeLeft! / 60).toString().padStart(2, '0')}:{(timeLeft! % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

        </div>

        {/* ── DESKTOP LAYOUT ── une seule ligne horizontale */}
        <div className="hidden md:flex w-full max-w-5xl mx-auto px-4 py-0 h-20 items-center justify-between gap-6">

          {/* 1. Bouton retour */}
          <div className="flex items-center">
            <IconButton
              onClick={() => setShowQuitConfirm(true)}
              size="md"
              className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </IconButton>
          </div>

          {/* 2. Barre de progression + numérotation (centre) */}
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-3 bg-slate-200/80 rounded-full overflow-hidden">
              {isTimerMode && initialTime ? (
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${timeLeft! < 30 ? 'bg-red-500' : timeLeft! < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${(timeLeft! / initialTime) * 100}%` }}
                />
              ) : (
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
            <span className="text-sm font-bold text-slate-400 tabular-nums min-w-[48px] text-right select-none">
              {isTimerMode ? (
                <span className={timeLeft! < 30 ? "text-red-500 animate-pulse" : ""}>
                  {Math.floor(timeLeft! / 60).toString().padStart(2, '0')}:{(timeLeft! % 60).toString().padStart(2, '0')}
                </span>
              ) : (
                `${currentIndex + 1}/${exercisesLength}`
              )}
            </span>
          </div>

          {/* 3. Actions + badge étoiles */}
          <div className="flex items-center gap-1 sm:gap-2">
            <StarsBadge
              earnedStars={earnedStars}
              currentLevel={currentLevel}
              customTitle={customTitle}
              mode={mode}
              isReview={isReview}
            />

            {!isReview && setShowInfoModal && (
              <button
                onClick={() => setShowInfoModal(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all bg-transparent rounded-xl outline-none"
                title={getTranslation('auto.vocabulary_list', language)}
              >
                <List strokeWidth={2.5} className="w-[22px] h-[22px]" />
              </button>
            )}
          </div>

        </div>
      </header>
    </>
  );
}
