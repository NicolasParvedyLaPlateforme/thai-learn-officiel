'use client';

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from "@/types";
import { Mic, ArrowRight, Play, Loader2, RotateCcw, Square, Trash2, Zap } from 'lucide-react';
import { useProgressStore } from "@/lib/store";
import { stopTTS, playThaiTTS } from "@/lib/tts";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { m as motion, AnimatePresence } from "motion/react";
import { getAliases, replaceNumbersWithThai } from "@/lib/vocabulary-utils";
import { WordTile } from "@/components/ui/WordTile";

const normalizeThai = (str: string) => {
   return str.replace(/[\s\.\?!,ๆ;]/g, '').toLowerCase();
};



export function SpeakingExercise({
   vocabulary,
   dictionary,
   currentIndex,
   onNext,
   onLoseStar
}: {
   vocabulary: (Word | Phrase)[],
   dictionary: Word[],
   currentIndex: number,
   onNext: (isSuccess: boolean, isAbandoned?: boolean) => void,
   onLoseStar?: () => void
}) {
   const { language, addXp, speakingConfig } = useProgressStore();
   const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'timeup'>('idle');
   const [spokenHistory, setSpokenHistory] = useState("");
   const [micAttempts, setMicAttempts] = useState(0);
   const [isAutoMicEnabled, setIsAutoMicEnabled] = useState(false);
   const autoStartNextRef = useRef(false);
   const lastNotifiedAttemptRef = useRef(0);
   const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

   const currentItem = vocabulary[currentIndex];
   const requiredAccuracy = speakingConfig.requiredAccuracy || 50;

   // Derive target components
   const targetWords = useMemo(() => {
      if (!currentItem) return [];
      if ('components' in currentItem) { // Phrase
         return currentItem.components.map(id => {
            if (id === 'w_dots') return { id: 'w_dots', th: '...', fr: '', phonetic: '' } as Word;
            const w = dictionary.find(d => d.id === id);
            return w || { id, th: '???', fr: '', phonetic: '' } as Word;
         });
      } else { // Single Word
         return [currentItem as Word];
      }
   }, [currentItem, dictionary]);

   const orderedIndices = useMemo(() => {
      return Array.from({ length: targetWords.length }, (_, i) => i);
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
      setMicAttempts(0);
      lastNotifiedAttemptRef.current = 0;

      const dotsIndices: number[] = [];
      const dotsScores: Record<number, number> = {};
      targetWords.forEach((tw, i) => {
         if (tw.id === 'w_dots') {
            dotsIndices.push(i);
            dotsScores[i] = 100;
         }
      });
      setPlacedIndices(dotsIndices);
      setPlacedScores(dotsScores);

      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
   }, [currentIndex, resetTranscript, targetWords]);

   const evaluateTranscript = (text: string) => {
      if (!text || targetWords.length === 0) return;

      let remainingTranscript = normalizeThai(replaceNumbersWithThai(text));
      let calculatedIndices: number[] = [];
      let calculatedScores: Record<number, number> = {};

      // Sort targets by length descending to match longest words first
      const targets = targetWords
         .map((w, i) => ({ word: w, index: i }))
         .sort((a, b) => b.word.th.length - a.word.th.length);

      for (const target of targets) {
         if (target.word.id === 'w_dots') {
            calculatedIndices.push(target.index);
            calculatedScores[target.index] = 100;
            continue;
         }

         const targetNorm = normalizeThai(target.word.th);
         if (!targetNorm) continue;

         // If strictMode is true, we disable aliases and leniency
         const variants = speakingConfig.strictMode ? [targetNorm] : [targetNorm, ...getAliases(targetNorm)];

         let matchedExact = false;
         let matchStart = -1;
         let matchLen = 0;

         // Exact match check first
         for (const variant of variants) {
            const exactIndex = remainingTranscript.indexOf(variant);
            if (exactIndex !== -1) {
               matchedExact = true;
               matchStart = exactIndex;
               matchLen = variant.length;
               break;
            }
         }

         if (matchedExact) {
            calculatedIndices.push(target.index);
            calculatedScores[target.index] = 100;
            remainingTranscript = remainingTranscript.slice(0, matchStart) + "###" + remainingTranscript.slice(matchStart + matchLen);
            continue;
         }

         // Fuzzy substring check
         let bestSimilarity = 0;
         let bestMatchStart = -1;
         let bestMatchLen = 0;

         for (const variant of variants) {
            const vLen = variant.length;
            for (let len = Math.max(1, vLen - 1); len <= vLen + 1; len++) {
               for (let i = 0; i <= remainingTranscript.length - len; i++) {
                  const sub = remainingTranscript.substring(i, i + len);
                  if (sub.includes('#')) continue; // skip consumed parts

                  const dist = levenshtein.get(sub, variant);
                  const maxL = Math.max(sub.length, variant.length);
                  const sim = Math.max(0, Math.round(((maxL - dist) / maxL) * 100));

                  if (sim > bestSimilarity) {
                     bestSimilarity = sim;
                     bestMatchStart = i;
                     bestMatchLen = len;
                  }
               }
            }
         }

         // Special leniency for very short words (disabled in strict mode)
         let adjustedAccuracy = requiredAccuracy;
         if (targetNorm.length <= 3 && requiredAccuracy > 60 && !speakingConfig.strictMode) {
            adjustedAccuracy = 60; // 1 mistake allowed on a 3 char word gives 66%
         }

         if (bestSimilarity >= adjustedAccuracy) {
            calculatedIndices.push(target.index);
            calculatedScores[target.index] = bestSimilarity;
            remainingTranscript = remainingTranscript.slice(0, bestMatchStart) + "###" + remainingTranscript.slice(bestMatchStart + bestMatchLen);
         }
      }

      // Merge with existing placed indices to prevent flickering
      let newPlacedIndices = [...placedIndices];
      let newPlacedScores = { ...placedScores };
      let newlyAdded = false;

      for (const idx of calculatedIndices) {
         if (!newPlacedIndices.includes(idx)) {
            newPlacedIndices.push(idx);
            newPlacedScores[idx] = calculatedScores[idx];
            newlyAdded = true;
         } else {
            // Update score if it's better
            if (calculatedScores[idx] > newPlacedScores[idx]) {
               newPlacedScores[idx] = calculatedScores[idx];
               newlyAdded = true;
            }
         }
      }

      if (newlyAdded) {
         setPlacedIndices(newPlacedIndices);
         setPlacedScores(newPlacedScores);
      }

      if (newPlacedIndices.length === targetWords.length && targetWords.length > 0) {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         setStatus('success');
         SpeechRecognition.stopListening();
         setTimeout(() => {
            SpeechRecognition.abortListening();
         }, 50);
      }
   };

   // Real-time evaluation
   useEffect(() => {
      if (status !== 'listening' && status !== 'evaluating') return;
      evaluateTranscript(currentFullTranscript);
   }, [currentFullTranscript, status]);

   const stopAndEvaluate = () => {
      SpeechRecognition.stopListening();
      setStatus('evaluating');
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      setTimeout(() => {
         setStatus(prev => {
            if (prev === 'evaluating') return 'timeup';
            return prev;
         });
      }, 500);
   };

   // Timer logic
   useEffect(() => {
      if (status === 'listening') {
         listeningTimerRef.current = setTimeout(() => {
            stopAndEvaluate();
         }, 5000);
      } else if (status === 'idle' || status === 'timeup') {
         SpeechRecognition.stopListening();
         if (status === 'timeup') {
            setMicAttempts(prev => prev + 1);
         }
      } else if (status === 'success') {
         SpeechRecognition.stopListening();
         setTimeout(() => SpeechRecognition.abortListening(), 50);

         const autoNextTimer = setTimeout(() => {
            if (isAutoMicEnabled) {
               autoStartNextRef.current = true;
            }
            onNext(placedIndices.length >= targetWords.length, false);
         }, 1500);

         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         listeningTimerRef.current = autoNextTimer;
      }

      return () => {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      };
   }, [status]);

   // Trigger onLoseStar when micAttempts hits multiples of 2
   useEffect(() => {
      if (micAttempts > 0 && micAttempts % 2 === 0 && micAttempts !== lastNotifiedAttemptRef.current) {
         lastNotifiedAttemptRef.current = micAttempts;
         if (onLoseStar) {
            onLoseStar();
         }
      }
   }, [micAttempts, onLoseStar]);

   // Clean up on unmount
   useEffect(() => {
      return () => {
         SpeechRecognition.abortListening();
      };
   }, []);

   const startListening = (clearHistory = true) => {
      stopTTS();
      SpeechRecognition.abortListening();
      if (!clearHistory && transcript) {
         setSpokenHistory(currentFullTranscript + " ");
      }
      if (clearHistory) {
         setSpokenHistory("");
      }
      resetTranscript();
      setStatus('listening');
      SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
   };

   // Auto-start mic on next item if enabled
   useEffect(() => {
      if (autoStartNextRef.current) {
         autoStartNextRef.current = false;
         setTimeout(() => {
            startListening(true);
         }, 300);
      }
   }, [currentIndex]);

   const playTTS = () => {
      if (status === 'listening' || status === 'evaluating') {
         SpeechRecognition.abortListening();
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         setStatus('idle');
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
         const utterance = new SpeechSynthesisUtterance(currentItem.th);
         utterance.lang = 'th-TH';
         window.speechSynthesis.speak(utterance);
      } else {
         playThaiTTS(currentItem.th);
      }
   };

   const nextWord = () => {
      const isSuccess = status === 'success';
      onNext(isSuccess);
   };

   if (!browserSupportsSpeechRecognition) {
      return (
         <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            {getTranslation('auto.your_browser_doesn_t_support_s', language)}
         </div>
      );
   }

   return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] pb-32">
         {/* Prompt (Translation) */}
         <div className="text-center mb-8 relative w-full max-w-2xl mt-4">
            <h2 className="text-3xl font-bold text-slate-800 leading-relaxed">
               {getLocalizedField(currentItem, '', language)}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
               {currentItem.phonetic && (
                  <p className="text-base text-slate-500 font-mono bg-slate-100 inline-block px-3 py-1 rounded-lg">
                     {currentItem.phonetic}
                  </p>
               )}
               <button
                  onClick={playTTS}
                  className="w-8 h-8 bg-slate-100 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors shrink-0"
                  title={getTranslation('auto.listen_to_pronunciation', language)}
               >
                  <Play size={16} className="ml-0.5" />
               </button>
            </div>
         </div>

         {/* Build Zone (Target) */}
         <div className="min-h-[120px] w-full max-w-2xl border-y-2 border-slate-200 py-6 flex flex-wrap gap-3 items-center justify-center mb-8">
            {targetWords.map((word, index) => {
               const isPlaced = placedIndices.includes(index);

               if (word.id === 'w_dots') {
                  return <WordTile key={`fixed-${index}`} variant="dots" className="!h-14" />;
               }

               if (isPlaced) {
                  const score = placedScores[index];
                  let wordStatus: 'perfect' | 'good' | 'bad' = 'perfect';
                  if (score < 50) wordStatus = 'bad';
                  else if (score < 100) wordStatus = 'good';

                  return (
                     <WordTile
                        key={`placed-${index}`}
                        layoutId={`word-${index}`}
                        variant="scored"
                        status={wordStatus}
                        score={score}
                        text={word.th}
                        className="!h-14 !min-w-[4rem]"
                     />
                  );
               } else {
                  return (
                     <WordTile
                        key={`empty-${index}`}
                        variant="dots"
                        className="!h-14 !min-w-[4rem]"
                     />
                  );
               }
            })}
         </div>

         {/* Options Bank (Bottom) */}
         <div className="w-full max-w-2xl flex flex-wrap gap-3 items-center justify-center mb-10 min-h-[4rem]">
            {orderedIndices.map((originalIndex) => {
               const word = targetWords[originalIndex];
               if (word.id === 'w_dots') return null;

               const isPlaced = placedIndices.includes(originalIndex);
               if (!isPlaced) {
                  return (
                     <WordTile
                        key={`bank-${originalIndex}`}
                        layoutId={`word-${originalIndex}`}
                        variant="bank"
                        text={word.th}
                        className="!h-14 !min-w-[4rem]"
                     />
                  );
               }
               return <div key={`bank-empty-${originalIndex}`} className="min-w-[4rem] h-14" />; // Placeholder to keep spacing
            })}
         </div>

         {/* Controls (Fixed Bottom) */}
         <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent flex flex-col items-center gap-3 z-50 pointer-events-none">
            {status === 'timeup' && placedIndices.length < targetWords.length && (
               <p className="text-amber-600 font-bold animate-pulse text-center bg-white/80 px-4 py-1 rounded-full shadow-sm text-sm pointer-events-auto">
                  {getTranslation('auto.time_s_up', language) || 'Temps écoulé !'}
               </p>
            )}

            <div className="relative flex items-center justify-center w-full h-24 pointer-events-auto">

               {/* Left Area (Absolute) - Abandon Button */}
               <div className="absolute left-[calc(50%-7rem)] md:left-[calc(50%-8rem)] flex items-center">
                  {micAttempts >= 3 && status !== 'success' && (
                     <button
                        onClick={() => onNext(false, true)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 shadow-[0_6px_0_rgb(255,228,230)] active:shadow-[0_0px_0_rgb(255,228,230)] active:translate-y-1.5 transition-all"
                        title={getTranslation('auto.skip', language) || "Abandonner"}
                     >
                        <Trash2 size={24} />
                     </button>
                  )}
               </div>

               {/* Center Area */}
               <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <button
                     onClick={() => setIsAutoMicEnabled(!isAutoMicEnabled)}
                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isAutoMicEnabled ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                     title={isAutoMicEnabled ? 'Désactiver le micro automatique' : 'Activer le micro automatique'}
                  >
                     <Zap size={20} className={isAutoMicEnabled ? 'fill-emerald-500' : ''} />
                  </button>
               </div>

               {status !== 'listening' && status !== 'success' && (
                  <button
                     onClick={() => startListening(false)}
                     className="w-20 h-20 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2 transition-all group z-10"
                  >
                     {status === 'evaluating' ? (
                        <Loader2 size={32} className="animate-spin" />
                     ) : (
                        <Mic size={32} className="group-hover:scale-110 transition-transform" />
                     )}
                  </button>
               )}

               {status === 'success' && (
                  <div className="w-20 h-20 bg-emerald-500/50 text-white rounded-full flex items-center justify-center z-10 opacity-60 cursor-not-allowed">
                     <Mic size={32} />
                  </div>
               )}

               {status === 'listening' && (
                  <>
                     <motion.div
                        key="listening"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex items-center z-10 w-max max-w-[90vw]"
                     >
                        <span className="text-lg font-thai text-slate-600 bg-white/90 backdrop-blur px-6 py-3 rounded-full border border-orange-200 shadow-sm flex items-center gap-2 truncate">
                           <Loader2 size={18} className="animate-spin text-orange-500 shrink-0" />
                           <span className="truncate">{currentFullTranscript || <span className="text-slate-400 font-sans italic text-sm">{getTranslation('auto.speak_now', language)}</span>}</span>
                        </span>
                     </motion.div>

                     <button
                        onClick={stopAndEvaluate}
                        className="w-20 h-20 bg-rose-500 hover:bg-rose-400 text-white rounded-3xl flex items-center justify-center shadow-[0_8px_0_rgb(225,29,72)] active:shadow-[0_0px_0_rgb(225,29,72)] active:translate-y-2 transition-all group z-10"
                        title="Stop"
                     >
                        <Square size={32} className="fill-current group-hover:scale-110 transition-transform" />
                     </button>
                  </>
               )}

               {/* Right Area (Absolute) */}
               <div className="absolute left-[calc(50%+3.5rem)] md:left-[calc(50%+4rem)] flex items-center">
                  {(status === 'success' || status === 'timeup') && (
                     <button
                        onClick={nextWord}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                        ${status === 'success'
                              ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_6px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] active:translate-y-1.5'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-[0_6px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1.5'
                           }
                     `}
                        title={status === 'success' ? getTranslation('auto.continue', language) : (getTranslation('auto.skip', language) || 'Passer')}
                     >
                        <ArrowRight size={24} />
                     </button>
                  )}
               </div>
            </div>
         </div>

      </div>
   );
}