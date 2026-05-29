'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../lib/store';
import { Exercise, CourseData, Word } from '../types';
import { X, Check, Play } from 'lucide-react';
import { playThaiTTS, preloadThaiVoices } from '../lib/tts';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingScreen } from '../components/LoadingScreen';

// Exercise Components
import PairMatch from '../components/PairMatch';
import { getEndlessPairMatchingServer } from '../actions/course';

import Footer from '../lesson/[id]/components/Footer';

export default function ReviewPairsPage() {
  const router = useRouter();
  const { completedLessons, xp, completeLesson, language, setExerciseRunning } = useProgressStore();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interaction State
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setExerciseRunning(true);
    return () => setExerciseRunning(false);
  }, [setExerciseRunning]);
  
  useEffect(() => {
    let initialized = false;
    const timer = setTimeout(() => {
      setMounted(true);
      if(!initialized && completedLessons.length > 0) {
        getEndlessPairMatchingServer(completedLessons, language).then(generated => {
           setExercises(generated);
        });
        initialized = true;
      }
    }, 0);
    
    preloadThaiVoices();
    return () => clearTimeout(timer);
  }, [completedLessons, language]);

  const fetchMore = () => {
    getEndlessPairMatchingServer(completedLessons, language).then(generated => {
      setExercises(prev => [...prev, ...generated]);
    });
  };

  if (!mounted) return null;

  if (completedLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 text-center">
          {language === 'en' ? 'No completed lessons' : 'Aucune leçon complétée'}
        </h1>
        <p className="text-slate-500 mb-8 text-center text-lg font-medium">
          {language === 'en' ? 'You must complete at least one lesson to access this!' : 'Vous devez compléter au moins une leçon pour pouvoir y accéder !'}
        </p>
        <button 
          onClick={() => router.push('/practice')}
          className="px-12 py-3 rounded-xl bg-fuchsia-500 border-b-4 border-fuchsia-700 text-white font-bold text-lg shadow-lg hover:bg-fuchsia-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest w-full max-w-sm"
        >
          {language === 'en' ? 'Back' : 'Retour'}
        </button>
      </div>
    );
  }

  const isDataLoaded = exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Early return prevention
  }

  const currentExercise = exercises[currentIndex] || null;
  const progress = ((currentIndex % 10) / 10) * 100;

  const handleCheck = () => {
    if (isChecking) {
      if (isCorrect) {
          setIsExiting(true);
          setTimeout(() => {
            setIsExiting(false);
            completeLesson('review-dummy', 1); // grant 1 xp
            if (currentIndex >= exercises.length - 3) {
              fetchMore();
            }
            setCurrentIndex(prev => prev + 1);
            setIsChecking(false);
            setIsCorrect(null);
          }, 150);
      } else {
        // If wrong, wait for user to click Continue (which calls handleCheck)
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          // put exercise at the end? Or just proceed.
          setExercises([...exercises, currentExercise]);
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
        }, 150);
      }
      return;
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FAFAFA] font-sans text-slate-800 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!showExerciseUI ? (
          <LoadingScreen 
            key="loading-screen"
            isLoadingData={!isDataLoaded} 
            onReady={() => setShowExerciseUI(true)} 
          />
        ) : (
          <motion.div
            key="exercise-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col h-full w-full absolute inset-0"
          >
      {/* Header / Progress bar */}
      <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-6 w-full max-w-2xl mx-auto h-full px-4 flex-1">
          <button onClick={() => router.push('/practice')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-fuchsia-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="font-bold text-slate-400">{language === 'en' ? 'Pairs ∞' : 'Paires ∞'}</div>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main className="flex-1 flex flex-col w-full relative">
        <AnimatePresence mode="wait">
          {currentExercise && (
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center md:justify-center md:overflow-y-auto hide-scrollbar"
            >
              {/* Scrollable / Main Area */}
              <motion.div
                animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: 1 }}
                transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.1 }}
                className={`flex flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col justify-center hide-scrollbar`}
              >
                <div className="mt-2 text-center w-full max-w-3xl flex flex-col justify-center items-center flex-1">
                   <PairMatch 
                     key={currentExercise.id}
                     pairs={currentExercise.pairs as Word[]}
                     mode={currentExercise.pairMatchMode}
                     disabled={isChecking}
                     onComplete={(failed?: boolean) => {
                       if (failed) {
                         setIsCorrect(false);
                         setIsChecking(true);
                       } else {
                         setIsExiting(true);
                         setTimeout(() => {
                           setIsExiting(false);
                           completeLesson('review-dummy', 1); // grant 1 xp
                           if (currentIndex >= exercises.length - 3) {
                             fetchMore();
                           }
                           setCurrentIndex(prev => prev + 1);
                           setIsChecking(false);
                           setIsCorrect(null);
                         }, 150);
                       }
                     }}
                   />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer
        currentExercise={currentExercise!}
        isChecking={isChecking}
        isCorrect={isCorrect}
        language={language}
        selectedAnswer={null}
        showFooter={isChecking && !isCorrect}
        handleCheck={handleCheck}
      />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
