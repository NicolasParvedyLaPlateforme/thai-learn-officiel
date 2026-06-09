'use client';

import { getTranslation } from '../../../hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../../../lib/store';
import { Word, Phrase } from '../../../types';
import { ArrowLeft, Loader2, X, Star, Crown } from 'lucide-react';
import { SpeakingExercise } from '../../../components/SpeakingExercise';
import SpeakResultScreen from './SpeakResultScreen';

const triggerConfetti = () => {
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  });
};

export default function SpeakLessonClient({ 
  lessonId, 
  level, 
  vocabulary, 
  dictionary,
  lessonTitle
}: { 
  lessonId: string, 
  level: number, 
  vocabulary: (Word | Phrase)[], 
  dictionary: Word[],
  lessonTitle: string 
}) {
  const router = useRouter();
  const { language, completeSpeakLesson, addXp, getExpectedXp } = useProgressStore();
  const [exercises, setExercises] = useState(vocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const earnedStars = Math.max(0, 5 - Math.floor(mistakes / 2));

  useEffect(() => setMounted(true), []);

  const handleComplete = () => {
    const expected = getExpectedXp(`speak_${lessonId}`, level - 1, false);
    const finalXp = expected.xp || 50;
    setEarnedXp(finalXp);
    completeSpeakLesson(lessonId, 50, level - 1, earnedStars);
    setIsFinished(true);
    triggerConfetti();
  };

  const handleNext = (isSuccess: boolean, isAbandoned?: boolean) => {
    if (isSuccess) {
      setSuccessCount(prev => prev + 1);
      addXp(3);
    } else if (!isAbandoned) {
      setExercises(prev => [...prev, prev[currentIndex]]);
    }
    
    // If it's abandoned, we just move to the next item (or finish)
    // If we appended to the end, the length increased by 1
    const newLength = exercises.length + (isSuccess || isAbandoned ? 0 : 1);
    
    if (currentIndex + 1 < newLength) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleLoseStar = () => {
    setMistakes(prev => prev + 1);
  };

  const handleQuitEarly = () => {
    router.push('/speak');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (isFinished) {
    return (
      <SpeakResultScreen 
        lessonId={lessonId}
        currentLevel={level - 1}
        earnedStars={earnedStars}
        exercisesLength={vocabulary.length}
        language={language}
        earnedXp={earnedXp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-6 w-full max-w-3xl mx-auto h-full px-4 flex-1">
          <button 
            onClick={() => setShowQuitConfirm(true)}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          <div className="flex font-bold text-slate-400 text-sm sm:text-base items-center shrink-0">
            {getTranslation('auto.lvl', language) || 'Niv.'} {level}
          </div>

          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden min-w-[2rem]">
            <div 
              className="bg-orange-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
              style={{ width: `${exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0}%` }}
            ></div>
          </div>

          <div className="font-bold text-slate-400 flex items-center gap-2 sm:gap-3 text-sm sm:text-base shrink-0">
            <div className="hidden sm:flex items-center gap-0.5 mr-1">
              {Array.from({ length: 5 }).map((_, i) => (
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

            {level < 10 ? (
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
                {getTranslation('auto.lvl', language) || 'Niv.'} {level + 1}
              </span>
            ) : (
              <span className="flex items-center text-amber-500">
                <Crown size={18} className="fill-current stroke-[2.5]" />
              </span>
            )}

            <span className="bg-slate-100 text-slate-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-semibold shrink-0 ml-1 flex items-center gap-1.5 tabular-nums">
              {currentIndex} / {exercises.length}
            </span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <SpeakingExercise 
          vocabulary={exercises} 
          dictionary={dictionary} 
          currentIndex={currentIndex}
          onNext={handleNext} 
          onLoseStar={handleLoseStar}
        />
      </main>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <X size={32} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
              {language === 'en' ? 'Quit early?' : 'Abandonner ?'}
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              {language === 'en' 
                ? `You won't complete the lesson, but you keep the ${successCount * 3} XP you earned.` 
                : `Vous ne terminerez pas la leçon, mais vous conservez les ${successCount * 3} XP gagnés.`}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleQuitEarly}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-extrabold shadow-[0_4px_0_rgb(225,29,72)] active:translate-y-1 active:shadow-[0_0px_0_rgb(225,29,72)] transition-all"
              >
                {language === 'en' ? 'Yes, quit' : 'Oui, quitter'}
              </button>
              <button 
                onClick={() => setShowQuitConfirm(false)}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-extrabold hover:bg-slate-200 transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
