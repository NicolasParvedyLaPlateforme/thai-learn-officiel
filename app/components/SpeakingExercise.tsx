'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Word, Phrase } from '../types';
import { Mic, MicOff, CheckCircle, XCircle, ArrowRight, Play, Loader2, RefreshCw } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { motion, AnimatePresence } from 'motion/react';

// Normalize string for comparison (removes spaces, punctuation, special chars)
const normalizeThai = (str: string) => {
  return str.replace(/[\s\.\?!,ๆ;]/g, '').toLowerCase();
};

function colorizeSpoken(spoken: string, target: string) {
  const m = spoken.length;
  const n = target.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (spoken[i - 1] === target[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  let i = m, j = n;
  const lcsIndices = new Set();
  while (i > 0 && j > 0) {
    if (spoken[i - 1] === target[j - 1]) {
      lcsIndices.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return spoken.split('').map((char, index) => ({
    char,
    correct: lcsIndices.has(index)
  }));
}

export function SpeakingExercise({ vocabulary, onComplete }: { vocabulary: (Word | Phrase)[], onComplete: () => void }) {
  const { language } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'failed' | 'partial_fail' | 'evaluating'>('idle');
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  
  const [spokenHistory, setSpokenHistory] = useState("");
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = vocabulary[currentIndex];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Combined transcript for logic and display
  const currentFullTranscript = (spokenHistory + (transcript ? (spokenHistory.endsWith(' ; ') ? transcript : (spokenHistory ? ' ' + transcript : transcript)) : '')).trim();

  // Instant validation
  useEffect(() => {
    if (!currentFullTranscript || status === 'success' || status === 'failed' || status === 'evaluating') return;

    const normalizedSpoken = normalizeThai(currentFullTranscript);
    const normalizedTarget = normalizeThai(currentItem.th);

    if (normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget)) {
      setStatus('success');
      SpeechRecognition.stopListening();
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      playSuccessSound();
    }
  }, [currentFullTranscript, currentItem, status]);

  // Pause detection
  useEffect(() => {
    if (status !== 'listening' || !transcript) return;

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    pauseTimeoutRef.current = setTimeout(() => {
      setSpokenHistory(prev => {
        const prefix = prev ? prev + (prev.endsWith(' ; ') ? '' : ' ') : '';
        return prefix + transcript + ' ; ';
      });
      resetTranscript();
    }, 1500);

    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [transcript, status, resetTranscript]);

  // 5-second max timer
  useEffect(() => {
    if (status === 'listening') {
      listeningTimerRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
        
        // Short delay to let the final transcripts settle before evaluating
        setTimeout(() => {
          setStatus(prev => {
            if (prev === 'listening' || prev === 'idle') {
               return 'evaluating';
            }
            return prev;
          });
        }, 300);
      }, 5000);
    }

    return () => {
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
    };
  }, [status]);

  // Handle failure evaluation
  useEffect(() => {
    if (status === 'evaluating') {
      const normalizedSpoken = normalizeThai(currentFullTranscript);
      const normalizedTarget = normalizeThai(currentItem.th);

      if (normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget)) {
         setStatus('success');
         playSuccessSound();
      } else {
         const currentAttempts = attempts + 1;
         setAttempts(currentAttempts);
         
         if (currentAttempts >= 3) {
           const distance = levenshtein.get(normalizedSpoken, normalizedTarget);
           const maxLength = Math.max(normalizedSpoken.length, normalizedTarget.length);
           const similarity = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
           
           setSimilarityScore(similarity);
           setStatus('failed');
           playFailSound();
         } else {
           setStatus('partial_fail');
           playFailSound();
           setTimeout(() => {
             setStatus(prev => {
                if (prev === 'partial_fail') {
                   setSpokenHistory("");
                   resetTranscript();
                   return 'idle';
                }
                return prev;
             });
           }, 3500);
         }
      }
    }
  }, [status, currentFullTranscript, currentItem, attempts, resetTranscript]);

  // Reset when changing word
  useEffect(() => {
    resetTranscript();
    setSpokenHistory("");
    setAttempts(0);
    setStatus('idle');
    setSimilarityScore(null);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
  }, [currentIndex, resetTranscript]);

  const playSuccessSound = () => {
    // try {
    //   const audio = new Audio('/sounds/correct.mp3');
    //   audio.volume = 0.5;
    //   audio.play();
    // } catch(e) {}
  };

  const playFailSound = () => {
    // try {
    //   const audio = new Audio('/sounds/wrong.mp3');
    //   audio.volume = 0.5;
    //   audio.play();
    // } catch(e) {}
  };

  const playTTS = () => {
    const utterance = new SpeechSynthesisUtterance(currentItem.th);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  const nextWord = () => {
    if (currentIndex + 1 < vocabulary.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const startListening = () => {
    resetTranscript();
    setSpokenHistory("");
    setStatus('listening');
    SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        {language === 'en' 
          ? "Your browser doesn't support speech recognition. Please try using Google Chrome on desktop or mobile."
          : "Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez utiliser Google Chrome sur ordinateur ou mobile."}
      </div>
    );
  }

  const progress = ((currentIndex) / vocabulary.length) * 100;
  
  // Colorized output for failed attempts
  const coloredOutput = (status === 'failed' || status === 'partial_fail') && currentFullTranscript 
    ? colorizeSpoken(currentFullTranscript, currentItem.th) 
    : null;

  return (
    <div className="w-full flex flex-col items-center">
       {/* Progress */}
       <div className="w-full max-w-md mb-8">
         <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
            <span>{currentIndex} / {vocabulary.length}</span>
            <span>{Math.round(progress)}%</span>
         </div>
         <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
         </div>
       </div>

       {/* Word Card */}
       <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 w-full max-w-md text-center shadow-lg mb-4 relative">
          <button 
            onClick={playTTS}
            className="absolute top-4 right-4 w-10 h-10 bg-slate-100 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors"
            title={language === 'en' ? "Listen to pronunciation" : "Écouter la prononciation"}
          >
             <Play size={20} className="ml-1" />
          </button>

          <h2 className="text-5xl font-thai text-slate-800 mb-4 mt-6 leading-relaxed">
            {currentItem.th}
          </h2>
          {currentItem.phonetic && (
             <p className="text-lg text-slate-500 font-mono bg-slate-100 inline-block px-3 py-1 rounded-lg mb-2">
               {currentItem.phonetic}
             </p>
          )}
          <p className="text-xl text-slate-600 font-medium">
             {language === 'en' && currentItem.en ? currentItem.en : currentItem.fr}
          </p>
       </div>

       {/* Real-time transcript display */}
       <div className="min-h-[3rem] w-full max-w-md text-center px-4 mb-4">
         {currentFullTranscript && status === 'listening' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-thai text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block max-w-full break-words">
             {currentFullTranscript}
             <span className="inline-block w-1.5 h-4 ml-1 bg-orange-400 animate-pulse"></span>
           </motion.div>
         )}
       </div>

       {/* Status Messages */}
       <div className="min-h-[5rem] flex items-center justify-center w-full max-w-md">
          <AnimatePresence mode="wait">
             {status === 'success' && (
                <motion.div 
                   key="success"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="text-emerald-500 font-bold flex items-center gap-2 text-xl bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200"
                >
                   <CheckCircle /> {language === 'en' ? 'Excellent!' : 'Parfait !'}
                </motion.div>
             )}
             
             {status === 'partial_fail' && (
                <motion.div 
                   key="partial"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="text-amber-600 flex items-start gap-3 text-lg bg-amber-50 px-6 py-4 rounded-2xl border border-amber-200 w-full"
                >
                   <XCircle className="mt-0.5 shrink-0" /> 
                   <div className="flex flex-col items-start w-full">
                      <span className="font-bold">{language === 'en' ? "Not quite, try again!" : "Pas tout à fait, réessaie !"}</span>
                      {coloredOutput && (
                        <div className="mt-2 bg-white p-2.5 rounded-xl border border-amber-200 w-full break-words text-left font-thai text-xl leading-relaxed shadow-sm">
                          {coloredOutput.map((item, i) => (
                             <span key={i} className={item.correct ? 'text-emerald-500 font-bold' : 'text-red-500'}>{item.char}</span>
                          ))}
                        </div>
                      )}
                   </div>
                </motion.div>
             )}

             {status === 'failed' && (
                <motion.div 
                   key="failed"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="text-red-500 flex items-start gap-3 text-lg bg-red-50 px-6 py-4 rounded-2xl border border-red-200 w-full"
                >
                   <XCircle className="mt-0.5 shrink-0" /> 
                   <div className="flex flex-col items-start w-full">
                     <span className="font-bold">
                       {language === 'en' ? 'Failed.' : 'Échec.'} 
                       {similarityScore !== null && ` Précision : ${similarityScore}%`}
                     </span>
                     {coloredOutput && (
                        <div className="mt-2 bg-white p-2.5 rounded-xl border border-red-200 w-full break-words text-left font-thai text-xl leading-relaxed shadow-sm">
                          {coloredOutput.map((item, i) => (
                             <span key={i} className={item.correct ? 'text-emerald-500 font-bold' : 'text-red-500'}>{item.char}</span>
                          ))}
                        </div>
                      )}
                   </div>
                </motion.div>
             )}

             {status === 'listening' && (
                <motion.div 
                   key="listening"
                   initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                   className="flex items-center gap-3 text-orange-500 font-bold text-lg"
                >
                   <Loader2 className="animate-spin" /> {language === 'en' ? 'Listening...' : 'Écoute en cours...'}
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="mt-6 flex items-center gap-4">
         {(status === 'idle' || status === 'partial_fail') && (
            <button 
               onClick={startListening}
               className="w-24 h-24 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2 transition-all group"
            >
               <Mic size={40} className="group-hover:scale-110 transition-transform" />
            </button>
         )}

         {(status === 'success' || status === 'failed') && (
            <button 
               onClick={nextWord}
               className="px-10 h-16 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] active:translate-y-1.5 transition-all"
            >
               {language === 'en' ? 'Continue' : 'Continuer'} <ArrowRight size={24} />
            </button>
         )}
       </div>

       {/* Instruction hints */}
       <div className="mt-12 text-slate-400 text-sm font-medium text-center max-w-xs">
          {language === 'en' 
             ? "Tap the microphone and read the Thai word aloud clearly."
             : "Appuyez sur le micro et lisez le mot thaï à voix haute et clairement."}
       </div>
    </div>
  );
}

