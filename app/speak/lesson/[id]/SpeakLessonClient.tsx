'use client';

import { getTranslation } from '../../../hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../../../lib/store';
import { Word, Phrase } from '../../../types';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { SpeakingExercise } from '../../../components/SpeakingExercise';

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
  const { language, completeSpeakLesson, addXp } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleComplete = () => {
    // 20 steps done successfully
    completeSpeakLesson(lessonId, 50, level - 1, 3);
    router.push('/speak');
  };

  const handleQuitEarly = () => {
    // Give partial XP based on currentIndex, do not complete lesson
    if (currentIndex > 0) {
      addXp(currentIndex * 2);
    }
    router.push('/speak');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center sticky top-0 z-50 gap-4">
        <button 
          onClick={() => setShowQuitConfirm(true)}
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex-1 flex items-center gap-4">
           <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${vocabulary.length > 0 ? (currentIndex / vocabulary.length) * 100 : 0}%` }}></div>
           </div>
           <div className="text-sm font-bold text-slate-400 shrink-0">
              {currentIndex} / {vocabulary.length}
           </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <SpeakingExercise 
          vocabulary={vocabulary} 
          dictionary={dictionary} 
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onComplete={handleComplete} 
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
                ? `You won't complete the lesson, but you'll get ${currentIndex * 2} XP for your efforts so far.` 
                : `Vous ne terminerez pas la leçon, mais vous gagnerez ${currentIndex * 2} XP pour vos efforts.`}
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
