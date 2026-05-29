'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../lib/store';
import { Exercise, CourseData, Word } from '../types';
import { X, Check, Volume2 } from 'lucide-react';
import { playThaiTTS } from '../lib/tts';

import { getCharacterHint } from '../lib/phonetic-mapper';
import VirtualKeyboard from './components/VirtualKeyboard';
import { SentenceWithHints } from '../components/Hints';
import { formatCombiningChar } from '../lib/alphabet-utils';
import { getWritingExercisesServer, getDictionaryForExerciseServer, getPhrasesForExerciseServer } from '../actions/course';
import { LoadingScreen } from '../components/LoadingScreen';
import { AnimatePresence, motion } from "motion/react";

export default function WritingPage() {
  const router = useRouter();
  const { completedLessons, unlockedLessons, completeLesson, language, _hasHydrated, writingConfig, showRomanization, setShowRomanization, setExerciseRunning } = useProgressStore();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExerciseUI, setShowExerciseUI] = useState(false);

  const [mounted, setMounted] = useState(false);
  
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [allPhrases, setAllPhrases] = useState<any[]>([]);
  
  useEffect(() => {
    setExerciseRunning(true);
    return () => setExerciseRunning(false);
  }, [setExerciseRunning]);
  
  useEffect(() => {
    if (!_hasHydrated) return;
    let initialized = false;
    const timer = setTimeout(() => {
      setMounted(true);
      if(!initialized) {
        let targetLessons = completedLessons;
        
        if (writingConfig.lessonId !== 'all') {
           targetLessons = [writingConfig.lessonId];
        }
        
        if (targetLessons.length > 0) {
           getWritingExercisesServer(targetLessons, language, writingConfig.selectedWordIds).then(generated => {
               setExercises(generated);
           });
        }
        initialized = true;
      }
    }, 0);
    getDictionaryForExerciseServer().then(words => {
      setAllWords(words as Word[]);
    });
    getPhrasesForExerciseServer().then(phrases => {
      setAllPhrases(phrases);
    });
    return () => clearTimeout(timer);
  }, [completedLessons, language, _hasHydrated, unlockedLessons, writingConfig]);

  if (!mounted) return null;

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasLessonId = !!params?.get('lessonId');

  if (completedLessons.length === 0 && !hasLessonId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 text-center">
          {language === 'en' ? 'No completed lessons' : 'Aucune leçon complétée'}
        </h1>
        <p className="text-slate-500 mb-8 text-center text-lg font-medium">
          {language === 'en' ? 'You must complete at least one lesson to practice writing!' : 'Vous devez compléter au moins une leçon pour pratiquer l\'écriture !'}
        </p>
        <button 
          onClick={() => {
            if (hasLessonId) {
              router.push(`/lesson/${params?.get('lessonId')}`);
            } else {
              router.push('/practice');
            }
          }}
          className="px-12 py-3 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest w-full max-w-sm"
        >
          {language === 'en' ? 'Back' : 'Retour'}
        </button>
      </div>
    );
  }

  const isDataLoaded = mounted && exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
     // prevent early render
  }

  const currentExercise = exercises[currentIndex] || null;
  // Loop back or refill if needed
  const progress = ((currentIndex % 10) / 10) * 100;

  const handleCheck = (overrideAnswer?: string[]) => {
    if (!currentExercise) return;
    if (isChecking) {
      if (isCorrect) {
          completeLesson('writing-dummy', 1);
          
          if (currentIndex >= exercises.length - 1) {
            let targetLessons = completedLessons;
            if (writingConfig.lessonId !== 'all') {
               targetLessons = [writingConfig.lessonId];
            }
            getWritingExercisesServer(targetLessons, language, writingConfig.selectedWordIds).then(generated => {
               setExercises(generated);
               setCurrentIndex(0);
            });
          } else {
            setCurrentIndex(currentIndex + 1);
          }
          
          setIsChecking(false);
          setIsCorrect(null);
          setSelectedAnswer([]);
      } else {
        // If wrong, re-add to end
        setExercises([...exercises, currentExercise]);
        setCurrentIndex(currentIndex + 1);
        setIsChecking(false);
        setIsCorrect(null);
        setSelectedAnswer([]);
      }
      return;
    }

    const answerToCheck = overrideAnswer || selectedAnswer;
    if (answerToCheck.length === 0) return;
    
    const builtValue = answerToCheck.join('').replace(/\s+/g, '');
    const targetValue = currentExercise.answer.replace(/\s+/g, '');
    const correct = builtValue === targetValue;

    setIsCorrect(correct);
    setIsChecking(true);
    playThaiTTS(currentExercise.answer);
  };

  const nextCharIdx = selectedAnswer.length;
  const charHint = currentExercise?.correctComponents && nextCharIdx < currentExercise.correctComponents.length
    ? getCharacterHint(currentExercise.correctComponents, nextCharIdx)
    : undefined;

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
      {/* Header */}
      <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-6 w-full max-w-2xl mx-auto h-full px-4 flex-1">
          <button onClick={() => {
            if (hasLessonId) {
              router.push(`/lesson/${params?.get('lessonId')}`);
            } else {
              router.push('/practice');
            }
          }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          {!currentExercise?.forceHideRomanization && (
            <button 
              onClick={() => setShowRomanization(!showRomanization)}
              className={`mr-2 w-9 h-9 flex flex-col items-center justify-center rounded-xl font-bold border-2 transition-colors ${showRomanization ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "border-slate-200 text-slate-400 bg-white hover:bg-slate-100"}`}
              title={showRomanization ? (language === 'en' ? "Hide Pronunciation" : "Masquer la prononciation") : (language === 'en' ? "Show Pronunciation" : "Afficher la prononciation")}
            >
              <span className="text-xs font-mono">{showRomanization ? 'aA' : 'ก'}</span>
            </button>
          )}
          <div className="font-bold text-slate-400">{language === 'en' ? 'Writing ∞' : 'Écriture ∞'}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center py-2 sm:py-6 md:py-12 px-4 w-full">
        {currentExercise && (
        <div className="w-full max-w-3xl flex flex-col justify-center flex-1">
        
          <div className="flex items-start gap-4 md:gap-8 mb-4 md:mb-8">
            <div className="hidden md:flex w-32 h-32 bg-emerald-100 rounded-3xl items-center justify-center text-5xl shadow-sm border border-emerald-200 flex-shrink-0">
               <span>✍️</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 md:mb-6 text-center md:text-left">
                {language === 'en' 
                  ? "Write this " + (currentExercise.id.includes('phrase') ? "sentence" : "word") + " in Thai" 
                  : "Écrivez " + (currentExercise.id.includes('phrase') ? "cette phrase" : "ce mot") + " en thaï"}
              </h2>
              <div className="relative pb-1 w-full text-center md:text-left min-h-[40px]">
                {!writingConfig.hideTranslation ? (
                  <SentenceWithHints 
                    text={currentExercise.question} 
                    dictionary={allWords} 
                    phrases={allPhrases}
                    isSentence={false}
                    exerciseOptions={[]} // No vocab needed for hints here as it's writing
                    hideHints={false}
                    disableTooltips={writingConfig.disableDictionaryClick}
                    alwaysShowPhonetic={true}
                    charHintRegex={charHint?.highlightRegex}
                    isChecking={isChecking}
                    forceHideRomanization={currentExercise.forceHideRomanization}
                    rightElement={
                      !isChecking ? (
                        <button 
                           onClick={() => playThaiTTS(currentExercise.answer)}
                           className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 p-2 rounded-full transition-colors flex-shrink-0"
                           title={language === 'en' ? 'Listen to full phrase' : 'Écouter la phrase entière'}
                        >
                           <Volume2 size={24} strokeWidth={2.5} />
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="relative inline-block group">
                      <div className={`text-xl md:text-2xl text-indigo-500 font-medium tracking-wider ${!writingConfig.disableDictionaryClick ? 'cursor-help border-b-2 border-dashed border-indigo-200 pb-1' : ''}`}>
                         {(() => {
                            const matchItem = [...allWords, ...allPhrases].find(item => item.th === currentExercise.answer);
                            return matchItem?.phonetic || currentExercise.question;
                         })()}
                      </div>
                      {!writingConfig.disableDictionaryClick && (
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-slate-800 text-white font-thai text-2xl rounded-xl shadow-xl whitespace-nowrap pointer-events-none z-10">
                          {currentExercise.answer}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                    {!isChecking && (
                      <button 
                         onClick={() => playThaiTTS(currentExercise.answer)}
                         className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 p-2 rounded-full transition-colors flex-shrink-0"
                         title={language === 'en' ? 'Listen to full phrase' : 'Écouter la phrase entière'}
                      >
                         <Volume2 size={24} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-8 md:mt-10">
                <div className="text-4xl md:text-5xl font-thai font-medium flex flex-wrap gap-x-1 gap-y-3 leading-normal">
                  {(() => {
                    if (!currentExercise.correctComponents) return <span>{currentExercise.answer}</span>;

                    const groupedComponents: { cluster: string; idx: number; groupIndex: number }[][] = [];
                    let currentGroup: { cluster: string; idx: number; groupIndex: number }[] = [];
                    let currentGroupIndex = currentExercise.componentGroups?.[0] ?? -1;

                    currentExercise.correctComponents.forEach((cluster, idx) => {
                       const groupIndex = currentExercise.componentGroups?.[idx] ?? idx;
                       if (groupIndex === currentGroupIndex) {
                           currentGroup.push({ cluster, idx, groupIndex });
                       } else {
                           if (currentGroup.length > 0) groupedComponents.push(currentGroup);
                           currentGroup = [{ cluster, idx, groupIndex }];
                           currentGroupIndex = groupIndex;
                       }
                    });
                    if (currentGroup.length > 0) groupedComponents.push(currentGroup);

                    return groupedComponents.map((group, gIdx) => {
                      
                      // First determine the color and text for each item
                      const items = group.map(({ cluster, idx }) => {
                        let color = "text-slate-300"; // remaining
                        if (idx < selectedAnswer.length) {
                          if (selectedAnswer[idx] === cluster) {
                            color = "text-emerald-500";
                          } else {
                            color = "text-rose-500";
                          }
                        } else {
                          if (writingConfig.hideThai) {
                            color = "text-transparent";
                          } else if (idx === selectedAnswer.length) {
                            color = "text-orange-500";
                          }
                        }

                        // We handle combining marks using formatCombiningChar
                        let displayCluster = cluster;
                        if (idx >= selectedAnswer.length) {
                          displayCluster = formatCombiningChar(cluster);
                        }

                        return { text: displayCluster, color };
                      });

                      // Group contiguous items with the same color
                      const mergedItems: { text: string; color: string }[] = [];
                      for (const item of items) {
                        if (mergedItems.length > 0 && mergedItems[mergedItems.length - 1].color === item.color) {
                          // Merge text if they have the same color, this is crucial for mobile WebKit combining marks
                          mergedItems[mergedItems.length - 1].text += item.text;
                        } else {
                          mergedItems.push({ text: item.text, color: item.color });
                        }
                      }

                      return (
                        <span 
                          key={gIdx} 
                          className={`inline-block mx-[2px] px-[6px] py-[4px] rounded-xl transition-colors ${group.length > 1 ? (gIdx % 2 === 0 ? 'bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200' : 'bg-slate-50 border border-slate-200/50') : 'bg-transparent'}`}
                        >
                          {mergedItems.map((mi, i) => (
                            <span key={i} className={`${mi.color}`}>
                              {mi.text}
                            </span>
                          ))}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>
              
              {!writingConfig.hideCharacterHints && charHint && !isChecking && (
                <div className="mt-6 p-4 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-3">
                  <div className="text-xl">💡</div>
                  <div className="text-orange-800 text-sm font-medium leading-relaxed">
                    {language === 'en' ? charHint.noteEn : charHint.note}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <VirtualKeyboard 
              exercise={currentExercise}
              selected={selectedAnswer}
              onChange={setSelectedAnswer}
              disabled={isChecking}
              onAutoCheck={(val) => handleCheck(val)}
            />
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <>
        <div className="shrink-0 min-h-[100px] md:h-32 w-full bg-transparent"></div>
        {isChecking && (
        <footer className={`fixed bottom-0 left-0 right-0 z-50 min-h-[100px] md:h-32 py-4 md:py-0 border-t-2 border-slate-200 flex items-center justify-center transition-colors duration-300 ${isCorrect ? 'bg-emerald-50' : 'bg-rose-50 border-rose-200'}`}>
          <div className="w-full max-w-2xl px-4 flex sm:flex-row flex-col items-center justify-between gap-4">
            
            <div className="flex-1 w-full text-center sm:text-left">
              {isCorrect ? (
                <div className="flex items-center justify-center sm:justify-start gap-3 text-emerald-600 font-extrabold text-xl">
                  <div className="bg-white text-emerald-500 rounded-full p-1"><Check size={24} strokeWidth={3} /></div>
                  {language === 'en' ? 'Perfect!' : 'Parfait !'}
                </div>
              ) : (
                <div className="flex flex-col text-rose-600 font-extrabold text-xl gap-1 items-center sm:items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-rose-500 rounded-full p-1"><X size={24} strokeWidth={3} /></div>
                    {language === 'en' ? 'Almost...' : 'Presque...'}
                  </div>
                  <div className="text-rose-800 text-sm mt-1 uppercase tracking-widest hidden sm:block">
                    {language === 'en' ? 'The exact spelling was:' : 'La bonne écriture était :'}
                  </div>
                  <div className="text-rose-900 font-medium font-thai text-2xl md:text-3xl mt-1 tracking-wider">{currentExercise.answer}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleCheck()}
              disabled={selectedAnswer.length === 0}
              className={`w-full sm:w-auto px-12 py-3 rounded-xl border-b-4 font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${isCorrect ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' : 'bg-rose-500 border-rose-700 text-white hover:bg-rose-400'}`}
            >
              {language === 'en' ? 'Continue' : 'Continuer'}
            </button>
          </div>
        </footer>
        )}
      </>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
