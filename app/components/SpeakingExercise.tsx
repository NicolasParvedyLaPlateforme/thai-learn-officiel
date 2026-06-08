'use client';

import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from '../types';
import { Mic, ArrowRight, Play, Loader2, RotateCcw } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { m as motion, AnimatePresence } from "motion/react";

const normalizeThai = (str: string) => {
  return str.replace(/[\s\.\?!,ๆ;]/g, '').toLowerCase();
};

export function SpeakingExercise({ vocabulary, dictionary, onComplete }: { vocabulary: (Word | Phrase)[], dictionary: Word[], onComplete: () => void }) {
  const { language, addXp, speakingConfig } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'timeup'>('idle');
  const [spokenHistory, setSpokenHistory] = useState("");
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = vocabulary[currentIndex];
  const requiredAccuracy = speakingConfig.requiredAccuracy || 50;

  // Derive target components
  const targetWords = useMemo(() => {
    if (!currentItem) return [];
    if ('components' in currentItem) { // Phrase
      return currentItem.components.map(id => {
         const w = dictionary.find(d => d.id === id);
         return w || { id, th: '???', fr: '', phonetic: '' } as Word;
      });
    } else { // Single Word
      return [currentItem as Word];
    }
  }, [currentItem, dictionary]);

  const shuffledIndices = useMemo(() => {
    return Array.from({length: targetWords.length}, (_, i) => i).sort(() => Math.random() - 0.5);
  }, [targetWords]);

  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [placedScores, setPlacedScores] = useState<Record<number, number>>({});

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const currentFullTranscript = (spokenHistory + (transcript ? (spokenHistory.endsWith(' ; ') ? transcript : (spokenHistory ? ' ' + transcript : transcript)) : '')).trim();

  // Reset when changing word
  useEffect(() => {
    resetTranscript();
    setSpokenHistory("");
    setStatus('idle');
    setPlacedIndices([]);
    setPlacedScores({});
    if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
  }, [currentIndex, resetTranscript]);

  const evaluateTranscript = (text: string) => {
    if (!text || targetWords.length === 0) return;
    
    let newlyPlaced = false;
    let newPlacedScores = { ...placedScores };
    let newPlacedIndices = [...placedIndices];
    let remainingTranscript = normalizeThai(text);

    // Sort unplaced targets by length descending to match longest words first
    const unplacedTargets = targetWords
      .map((w, i) => ({ word: w, index: i }))
      .filter(item => !newPlacedIndices.includes(item.index))
      .sort((a, b) => b.word.th.length - a.word.th.length);

    for (const target of unplacedTargets) {
      const targetNorm = normalizeThai(target.word.th);
      if (!targetNorm) continue;
      
      // Exact match check first
      const exactIndex = remainingTranscript.indexOf(targetNorm);
      if (exactIndex !== -1) {
         newPlacedIndices.push(target.index);
         newPlacedScores[target.index] = 100;
         newlyPlaced = true;
         remainingTranscript = remainingTranscript.slice(0, exactIndex) + "###" + remainingTranscript.slice(exactIndex + targetNorm.length);
         continue;
      }
      
      // Fuzzy substring check
      let bestSimilarity = 0;
      let bestMatchStart = -1;
      let bestMatchLen = 0;
      
      const targetLen = targetNorm.length;
      for (let len = Math.max(1, targetLen - 1); len <= targetLen + 1; len++) {
         for (let i = 0; i <= remainingTranscript.length - len; i++) {
            const sub = remainingTranscript.substring(i, i + len);
            if (sub.includes('#')) continue; // skip consumed parts
            
            const dist = levenshtein.get(sub, targetNorm);
            const maxL = Math.max(sub.length, targetNorm.length);
            const sim = Math.max(0, Math.round(((maxL - dist) / maxL) * 100));
            
            if (sim > bestSimilarity) {
               bestSimilarity = sim;
               bestMatchStart = i;
               bestMatchLen = len;
            }
         }
      }
      
      if (bestSimilarity >= requiredAccuracy) {
         newPlacedIndices.push(target.index);
         newPlacedScores[target.index] = bestSimilarity;
         newlyPlaced = true;
         remainingTranscript = remainingTranscript.slice(0, bestMatchStart) + "###" + remainingTranscript.slice(bestMatchStart + bestMatchLen);
      }
    }

    if (newlyPlaced) {
      setPlacedIndices(newPlacedIndices);
      setPlacedScores(newPlacedScores);
      // Reset transcript buffer so they don't have to worry about past mistakes
      setSpokenHistory("");
      resetTranscript();
    }

    if (newPlacedIndices.length === targetWords.length && targetWords.length > 0) {
      setStatus('success');
      SpeechRecognition.stopListening();
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
    }
  };

  // Real-time evaluation
  useEffect(() => {
    if (status !== 'listening' && status !== 'evaluating') return;
    evaluateTranscript(currentFullTranscript);
  }, [currentFullTranscript, status]);

  // Timer logic
  useEffect(() => {
    if (status === 'listening') {
      listeningTimerRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
        setStatus('evaluating');
        setTimeout(() => {
          setStatus(prev => {
             if (prev === 'evaluating') return 'timeup';
             return prev;
          });
        }, 500);
      }, 5000);
    }

    return () => {
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
    };
  }, [status]);

  const startListening = () => {
    resetTranscript();
    setSpokenHistory("");
    setStatus('listening');
    SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
  };

  const playTTS = () => {
    const utterance = new SpeechSynthesisUtterance(currentItem.th);
    utterance.lang = 'th-TH';
    window.speechSynthesis.speak(utterance);
  };

  const nextWord = () => {
    if (status === 'success') {
      addXp(3);
    }
    if (currentIndex + 1 < vocabulary.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        {getTranslation('auto.your_browser_doesn_t_support_s', language)}
      </div>
    );
  }

  const progress = ((currentIndex) / vocabulary.length) * 100;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
       {/* Progress */}
       <div className="w-full max-w-2xl mb-8 mt-4">
         <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
            <span>{currentIndex} / {vocabulary.length}</span>
            <span>{Math.round(progress)}%</span>
         </div>
         <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
         </div>
       </div>

       {/* Prompt (Translation) */}
       <div className="text-center mb-8 relative w-full max-w-2xl">
          <button 
            onClick={playTTS}
            className="absolute -top-4 right-0 w-10 h-10 bg-slate-100 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors"
            title={getTranslation('auto.listen_to_pronunciation', language)}
          >
             <Play size={20} className="ml-1" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800 mt-4 leading-relaxed">
            {getLocalizedField(currentItem, '', language)}
          </h2>
          {currentItem.phonetic && (
             <p className="text-base text-slate-500 font-mono bg-slate-100 inline-block px-3 py-1 rounded-lg mt-3">
               {currentItem.phonetic}
             </p>
          )}
       </div>

       {/* Build Zone (Target) */}
       <div className="min-h-[120px] w-full max-w-2xl border-y-2 border-slate-200 py-6 flex flex-wrap gap-3 items-center justify-center mb-8">
          {targetWords.map((word, index) => {
             const isPlaced = placedIndices.includes(index);
             if (isPlaced) {
                const score = placedScores[index];
                let colorClass = "text-emerald-700 border-emerald-300 bg-emerald-50";
                if (score < 50) colorClass = "text-red-700 border-red-300 bg-red-50";
                else if (score < 100) colorClass = "text-amber-700 border-amber-300 bg-amber-50";
                
                return (
                   <motion.div 
                     layoutId={`word-${index}`}
                     key={`placed-${index}`}
                     className={`flex flex-col items-center justify-center px-4 py-2 border-2 rounded-xl shadow-sm font-thai min-w-[4rem] h-14 ${colorClass}`}
                   >
                      <span className="text-3xl font-medium leading-none">{word.th}</span>
                      {score < 100 && <span className="text-[10px] font-bold mt-1 opacity-80">{score}%</span>}
                   </motion.div>
                );
             } else {
                return (
                   <div key={`empty-${index}`} className="border-2 border-dashed border-slate-300 bg-transparent rounded-xl px-4 py-2 flex items-center justify-center min-w-[4rem] h-14">
                      <span className="text-2xl text-slate-400 font-medium">...</span>
                   </div>
                );
             }
          })}
       </div>

       {/* Options Bank (Bottom) */}
       <div className="w-full max-w-2xl flex flex-wrap gap-3 items-center justify-center mb-10 min-h-[4rem]">
          {shuffledIndices.map((originalIndex) => {
             const isPlaced = placedIndices.includes(originalIndex);
             const word = targetWords[originalIndex];
             if (!isPlaced) {
                return (
                   <motion.div 
                     layoutId={`word-${originalIndex}`}
                     key={`bank-${originalIndex}`}
                     className="bg-white text-slate-700 border-2 border-slate-200 border-b-4 rounded-xl px-4 py-2 shadow-sm font-thai flex items-center justify-center min-w-[4rem] h-14"
                   >
                      <span className="text-3xl font-medium leading-none">{word.th}</span>
                   </motion.div>
                );
             }
             return <div key={`bank-empty-${originalIndex}`} className="min-w-[4rem] h-14" />; // Placeholder to keep spacing
          })}
       </div>

       {/* Transcript display & Status feedback */}
       <div className="h-12 w-full max-w-2xl flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
             {status === 'success' && (
                <motion.div 
                   key="success"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="text-emerald-500 font-bold flex items-center gap-2 text-xl bg-emerald-50 px-6 py-2 rounded-full border border-emerald-200 shadow-sm"
                >
                   {getTranslation('auto.excellent', language)}
                </motion.div>
             )}
             
             {status === 'listening' && (
                <motion.div 
                   key="listening"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="w-full text-center"
                >
                   <span className="text-xl font-thai text-slate-600 bg-white px-6 py-3 rounded-full border border-orange-200 shadow-sm inline-flex items-center gap-2">
                     <Loader2 size={18} className="animate-spin text-orange-500" />
                     {currentFullTranscript || <span className="text-slate-400 font-sans italic text-base">{getTranslation('auto.speak_now', language)}</span>}
                   </span>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="flex flex-col items-center gap-4">
         {(status === 'idle' || status === 'timeup' || status === 'evaluating') && (
            <div className="flex flex-col items-center gap-3">
               <button 
                  onClick={startListening}
                  className="w-24 h-24 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2 transition-all group relative"
               >
                  {status === 'evaluating' ? (
                     <Loader2 size={40} className="animate-spin" />
                  ) : (
                     <Mic size={40} className="group-hover:scale-110 transition-transform" />
                  )}
               </button>
               {status === 'timeup' && placedIndices.length < targetWords.length && (
                  <p className="text-amber-600 font-bold mt-2 animate-pulse">
                     {language === 'en' ? 'Timeout! Retry or Skip?' : 'Temps écoulé ! Réessayer ou passer ?'}
                  </p>
               )}
            </div>
         )}

         {(status === 'success' || status === 'timeup') && (
            <button 
               onClick={nextWord}
               className={`px-10 h-16 rounded-2xl flex items-center justify-center gap-2 font-bold text-xl transition-all
                  ${status === 'success' 
                     ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_6px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] active:translate-y-1.5' 
                     : 'bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-[0_6px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1.5 mt-2'
                  }
               `}
            >
               {status === 'success' ? getTranslation('auto.continue', language) : (language === 'en' ? 'Skip' : 'Passer')} <ArrowRight size={24} />
            </button>
         )}
       </div>

    </div>
  );
}
