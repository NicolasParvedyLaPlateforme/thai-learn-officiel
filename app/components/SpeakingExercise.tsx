'use client';

import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from '../types';
import { Mic, ArrowRight, Play, Loader2, RotateCcw, Square, Trash2 } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { m as motion, AnimatePresence } from "motion/react";

const normalizeThai = (str: string) => {
   return str.replace(/[\s\.\?!,ๆ;]/g, '').toLowerCase();
};

const getAliases = (word: string): string[] => {
   const aliases: Record<string, string[]> = {
      'ฉัน': ['ชั้น'],
      'เขา': ['เค้า'],
      'ไหม': ['มั้ย', 'มั๊ย'],
      'หรือ': ['หรอ', 'เหรอ'],
      'หรือเปล่า': ['รึเปล่า', 'ป่าว'],
      'เปล่า': ['ป่าว'],
      'อย่างไร': ['ยังไง'],
      'เท่าไร': ['เท่าไหร่'],
      'ทำไม': ['ทําไม'],
      'ก็': ['ก้อ'],
      'หนึ่ง': ['นึง'],
      'ค่ะ': ['คะ', 'คา', 'ค่า', 'ขะ', 'ข่า'],
      'คะ': ['ค่ะ', 'ค้า', 'ขะ', 'คา'],
      'ครับ': ['คับ', 'ครัช', 'ฮะ'],
      'อะไร': ['อัลไล']
   };
   return aliases[word] || [];
};

const replaceNumbersWithThai = (text: string) => {
   const map: Record<string, string> = {
      '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่',
      '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า',
      '10': 'สิบ', '11': 'สิบเอ็ด', '20': 'ยี่สิบ', '100': 'ร้อย'
   };
   let res = text;
   // Replace longer numbers first
   for (const num of ['100', '20', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0']) {
      const re = new RegExp(`(?<!\\d)${num}(?!\\d)`, 'g');
      res = res.replace(re, map[num]);
   }
   return res;
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
            setMicAttempts(prev => {
               const newCount = prev + 1;
               if (newCount % 2 === 0 && onLoseStar) {
                  onLoseStar();
               }
               return newCount;
            });
         }
      } else if (status === 'success') {
         SpeechRecognition.stopListening();
         setTimeout(() => SpeechRecognition.abortListening(), 50);
      }

      return () => {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      };
   }, [status]);

   // Clean up on unmount
   useEffect(() => {
      return () => {
         SpeechRecognition.abortListening();
      };
   }, []);

   const startListening = () => {
      if (transcript) {
         setSpokenHistory(currentFullTranscript + " ");
      }
      resetTranscript();
      setStatus('listening');
      SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
   };

   const playTTS = () => {
      const utterance = new SpeechSynthesisUtterance(currentItem.th);
      utterance.lang = 'th-TH';
      window.speechSynthesis.speak(utterance);
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
                  return (
                     <div key={`fixed-${index}`} className="bg-transparent border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-medium font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-14">
                        <span className="leading-none text-2xl sm:text-3xl">...</span>
                     </div>
                  );
               }

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
            {orderedIndices.map((originalIndex) => {
               const word = targetWords[originalIndex];
               if (word.id === 'w_dots') return null; // Do not render dots in options

               const isPlaced = placedIndices.includes(originalIndex);
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

         {/* Controls (Fixed Bottom) */}
         <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent flex flex-col items-center gap-3 z-50 pointer-events-none">
            {status === 'timeup' && placedIndices.length < targetWords.length && (
               <p className="text-amber-600 font-bold animate-pulse text-center bg-white/80 px-4 py-1 rounded-full shadow-sm text-sm pointer-events-auto">
                  {language === 'en' ? 'Timeout! Retry or Skip?' : 'Temps écoulé !'}
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
               {status !== 'listening' && status !== 'success' && (
                  <button
                     onClick={startListening}
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
                        title={status === 'success' ? getTranslation('auto.continue', language) : (language === 'en' ? 'Skip' : 'Passer')}
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
