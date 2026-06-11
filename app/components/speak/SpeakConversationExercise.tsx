'use client';

import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from '../../types';
import { Mic, ArrowRight, Loader2, Square, Trash2, Volume2 } from 'lucide-react';
import { useProgressStore } from '../../lib/store';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { m as motion, AnimatePresence } from "motion/react";
import { stopTTS, playThaiTTS } from '../../lib/tts';
import IconImage from '../IconImage';

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
   for (const num of ['100', '20', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0']) {
      const re = new RegExp(`(?<!\\d)${num}(?!\\d)`, 'g');
      res = res.replace(re, map[num]);
   }
   return res;
};

export interface DialogueLine {
  speaker: string;
  phraseId: string;
  phraseData?: Phrase | Word;
}

export function SpeakConversationExercise({
   dialogue,
   dictionary,
   currentIndex,
   onNext,
   onPartialScore
}: {
   dialogue: DialogueLine[],
   dictionary: Word[],
   currentIndex: number,
   onNext: (isSuccess: boolean, isAbandoned?: boolean, partialScore?: number) => void,
   onPartialScore?: (score: number) => void
}) {
   const { language, speakingConfig } = useProgressStore();
   const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'timeup'>('idle');
   const [spokenHistory, setSpokenHistory] = useState("");
   const [micAttempts, setMicAttempts] = useState(0);
   const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);
   const scrollRef = useRef<HTMLDivElement>(null);

   const currentLine = dialogue[currentIndex];
   const currentItem = currentLine?.phraseData;
   const requiredAccuracy = speakingConfig.requiredAccuracy || 50;

   // Determine sides dynamically based on the first speaker
   const firstSpeaker = dialogue.length > 0 ? dialogue[0].speaker : null;

   // Refs for auto-scrolling
   const activeItemRef = useRef<HTMLDivElement>(null);

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

   const [placedIndices, setPlacedIndices] = useState<number[]>([]);
   const [placedScores, setPlacedScores] = useState<Record<number, number>>({});

   const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition
   } = useSpeechRecognition();

   const currentFullTranscript = (spokenHistory + (transcript ? (spokenHistory.endsWith(' ; ') ? transcript : (spokenHistory ? ' ' + transcript : transcript)) : '')).trim();

   // Reset when changing line
   useEffect(() => {
      resetTranscript();
      setSpokenHistory("");
      setStatus('idle');
      setMicAttempts(0);
      setPlacedIndices([]);
      setPlacedScores({});

      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);

      // Auto-scroll to center the active item
      setTimeout(() => {
         if (activeItemRef.current) {
             activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      }, 150);
   }, [currentIndex, resetTranscript]);

   const evaluateTranscript = (text: string) => {
      if (!text || targetWords.length === 0) return;

      let remainingTranscript = normalizeThai(replaceNumbersWithThai(text));
      let calculatedIndices: number[] = [];
      let calculatedScores: Record<number, number> = {};

      const targets = targetWords
         .map((w, i) => ({ word: w, index: i }))
         .sort((a, b) => b.word.th.length - a.word.th.length);

      for (const target of targets) {
         if (target.word.id === 'w_dots') continue;

         const targetNorm = normalizeThai(target.word.th);
         if (!targetNorm) continue;

         const variants = speakingConfig.strictMode ? [targetNorm] : [targetNorm, ...getAliases(targetNorm)];

         let matchedExact = false;
         let matchStart = -1;
         let matchLen = 0;

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

         let bestSimilarity = 0;
         let bestMatchStart = -1;
         let bestMatchLen = 0;

         for (const variant of variants) {
            const vLen = variant.length;
            for (let len = Math.max(1, vLen - 1); len <= vLen + 1; len++) {
               for (let i = 0; i <= remainingTranscript.length - len; i++) {
                  const sub = remainingTranscript.substring(i, i + len);
                  if (sub.includes('#')) continue;

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

         let adjustedAccuracy = requiredAccuracy;
         if (targetNorm.length <= 3 && requiredAccuracy > 60 && !speakingConfig.strictMode) {
            adjustedAccuracy = 60;
         }

         if (bestSimilarity >= adjustedAccuracy) {
            calculatedIndices.push(target.index);
            calculatedScores[target.index] = bestSimilarity;
            remainingTranscript = remainingTranscript.slice(0, bestMatchStart) + "###" + remainingTranscript.slice(bestMatchStart + bestMatchLen);
         }
      }

      let newPlacedIndices = [...placedIndices];
      let newPlacedScores = { ...placedScores };
      let newlyAdded = false;

      for (const idx of calculatedIndices) {
         if (!newPlacedIndices.includes(idx)) {
            newPlacedIndices.push(idx);
            newPlacedScores[idx] = calculatedScores[idx];
            newlyAdded = true;
         } else {
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
      
      const realTargetsCount = targetWords.filter(w => w.id !== 'w_dots').length;

      if (newPlacedIndices.length >= realTargetsCount && realTargetsCount > 0) {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         setStatus('success');
         SpeechRecognition.stopListening();
         setTimeout(() => {
            SpeechRecognition.abortListening();
         }, 50);
      }
   };

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

   useEffect(() => {
      if (status === 'listening') {
         listeningTimerRef.current = setTimeout(() => {
            stopAndEvaluate();
         }, 8000);
      } else if (status === 'idle' || status === 'timeup') {
         SpeechRecognition.stopListening();
         if (status === 'timeup') {
            setMicAttempts(prev => prev + 1);
         }
      } else if (status === 'success') {
         SpeechRecognition.stopListening();
         setTimeout(() => SpeechRecognition.abortListening(), 50);
      }
      return () => {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      };
   }, [status]);

   useEffect(() => {
      return () => {
         SpeechRecognition.abortListening();
      };
   }, []);

   const playTTS = () => {
      if (!currentItem?.th) return;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
         const utterance = new SpeechSynthesisUtterance(currentItem.th);
         utterance.lang = 'th-TH';
         window.speechSynthesis.speak(utterance);
      } else {
         playThaiTTS(currentItem.th);
      }
   };

   const startListening = () => {
      stopTTS();
      SpeechRecognition.abortListening();
      if (transcript) setSpokenHistory(currentFullTranscript + " ");
      resetTranscript();
      setStatus('listening');
      SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
   };

   const nextWord = (forceSkip = false) => {
      const isSuccess = status === 'success';
      const realTargetsCount = targetWords.filter(w => w.id !== 'w_dots').length;
      const score = Math.min(100, Math.round((placedIndices.length / realTargetsCount) * 100)) || 0;
      onNext(isSuccess, forceSkip, score);
   };
   
   // Auto skip if 3 attempts failed
   useEffect(() => {
       if (micAttempts >= 3 && status !== 'success') {
           nextWord(true);
       }
   }, [micAttempts]);

   if (!browserSupportsSpeechRecognition) {
      return (
         <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            {getTranslation('auto.your_browser_doesn_t_support_s', language)}
         </div>
      );
   }

   return (
      <div className="w-full flex flex-col items-center justify-start min-h-[60vh] pb-32 pt-4 relative">
         <div className="w-full max-w-2xl flex flex-col gap-4 mb-20 px-4">
             {dialogue.map((line, index) => {
                 const isVisible = index <= currentIndex;
                 if (!isVisible) return null;
                 
                 const speakerAvatar = line.speaker === 'Kanya' ? '/deedee-no-bg.png' : '/tom.png';
                 const isRight = line.speaker !== firstSpeaker;
                 const isCurrent = index === currentIndex;
                 const phrase = line.phraseData as Phrase;
                 
                 return (
                     <motion.div 
                         key={index}
                         ref={isCurrent ? activeItemRef : null}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={`flex w-full gap-3 py-1 ${isRight ? 'flex-row-reverse justify-start' : 'justify-start'}`}
                     >
                         <div className="flex-shrink-0 mt-6">
                            <IconImage 
                              src={speakerAvatar} 
                              alt={line.speaker} 
                              width={50} 
                              height={50} 
                              className={`rounded-full border object-cover bg-white shadow-sm ${isRight ? 'border-blue-200' : 'border-slate-200'}`}
                            />
                         </div>
                         
                         <div className={`relative max-w-[80%] flex flex-col gap-1 ${isRight ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wide">
                                {line.speaker}
                            </span>
                            
                            <div className={`p-4 rounded-3xl shadow-sm border-2 transition-all duration-300
                                ${isCurrent && !isRight ? 'bg-orange-50 border-orange-200 text-orange-900 rounded-tl-sm' : 
                                  isCurrent && isRight ? 'bg-blue-50 border-blue-200 text-blue-900 rounded-tr-sm' :
                                  isRight ? 'bg-slate-100 border-slate-200 text-slate-500 rounded-tr-sm' : 'bg-white border-slate-200 text-slate-500 rounded-tl-sm'}
                                ${isCurrent ? 'ring-4 ring-orange-400 ring-opacity-20 border-orange-300' : ''}
                            `}>
                                <div className="text-2xl font-medium font-thai leading-relaxed">
                                   {phrase?.th}
                                </div>
                            </div>
                            
                            {(!isCurrent || status === 'success') && phrase && (
                                <div className={`px-2 flex flex-col gap-1 ${isRight ? 'text-right' : 'text-left'}`}>
                                    <span className="text-sm font-medium text-slate-500">
                                        {getLocalizedField(phrase, '', language)}
                                    </span>
                                </div>
                            )}
                            
                            {isCurrent && status !== 'success' && (
                                <div className="flex flex-wrap gap-1 mt-2 p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                                   {targetWords.map((word, wIdx) => {
                                       if (word.id === 'w_dots') return null;
                                       const isPlaced = placedIndices.includes(wIdx);
                                       return (
                                           <span key={wIdx} className={`px-2 py-1 rounded-lg text-lg font-thai transition-colors ${isPlaced ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                               {word.th}
                                           </span>
                                       );
                                   })}
                                </div>
                            )}
                         </div>
                     </motion.div>
                 );
             })}
         </div>

         {/* Controls */}
         <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent flex flex-col items-center gap-3 z-50 pointer-events-none">
            {status === 'timeup' && placedIndices.length < targetWords.length && (
               <p className="text-amber-600 font-bold animate-pulse text-center bg-white/80 px-4 py-1 rounded-full shadow-sm text-sm pointer-events-auto">
                  {language === 'en' ? 'Timeout! Retry?' : 'Temps écoulé !'} ({micAttempts}/3)
               </p>
            )}

            <div className="relative flex items-center justify-center w-full h-24 pointer-events-auto">
               <div className="absolute left-[calc(50%-7rem)] md:left-[calc(50%-8rem)] flex items-center">
                  {status !== 'success' && (
                     <button
                        onClick={() => {
                           if (status === 'listening' || status === 'evaluating') {
                              SpeechRecognition.abortListening();
                              if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
                              setStatus('idle');
                           }
                           playTTS();
                        }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 shadow-[0_6px_0_rgb(203,213,225)] active:shadow-[0_0px_0_rgb(203,213,225)] active:translate-y-1.5 transition-all"
                        title={getTranslation('auto.listen', language)}
                     >
                        <Volume2 size={24} />
                     </button>
                  )}
               </div>

               {status !== 'listening' && status !== 'success' && (
                  <button
                     onClick={startListening}
                     className="w-20 h-20 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2 transition-all group z-10"
                  >
                     {status === 'evaluating' ? <Loader2 size={32} className="animate-spin" /> : <Mic size={32} className="group-hover:scale-110 transition-transform" />}
                  </button>
               )}

               {status === 'success' && (
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center z-10 shadow-[0_8px_0_rgb(16,185,129)] active:shadow-[0_0px_0_rgb(16,185,129)] active:translate-y-2 cursor-pointer transition-all" onClick={() => nextWord(false)}>
                     <ArrowRight size={32} />
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
                     >
                        <Square size={32} className="fill-current group-hover:scale-110 transition-transform" />
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
