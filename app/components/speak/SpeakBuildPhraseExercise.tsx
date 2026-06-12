'use client';

import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from '../../types';
import { Mic, ArrowRight, Loader2, Square, Trash2, Zap } from 'lucide-react';
import { useProgressStore } from '../../lib/store';
import { stopTTS, playThaiTTS } from '../../lib/tts';
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
   for (const num of ['100', '20', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0']) {
      const re = new RegExp(`(?<!\\d)${num}(?!\\d)`, 'g');
      res = res.replace(re, map[num]);
   }
   return res;
};

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
   const arr = [...array];
   for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
   }
   return arr;
};

export function SpeakBuildPhraseExercise({
   phrases,
   completedPhraseIds,
   dictionary,
   language,
   onCompletePhrase,
   onLoseStar
}: {
   phrases: Phrase[],
   completedPhraseIds: string[],
   dictionary: Word[],
   language: string,
   onCompletePhrase: (phraseId: string, mistakes: number, isAbandoned?: boolean) => void,
   onLoseStar?: () => void
}) {
   const { speakingConfig } = useProgressStore();
   const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'timeup'>('idle');
   const [spokenHistory, setSpokenHistory] = useState("");
   const [micAttempts, setMicAttempts] = useState(0);
   const [isAutoMicEnabled, setIsAutoMicEnabled] = useState(false);
   
   const [lockedPhraseId, setLockedPhraseId] = useState<string | null>(null);
   const [step, setStep] = useState(0);
   const [options, setOptions] = useState<Word[]>([]);
   const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
   const [mistakes, setMistakes] = useState(0);

   const autoStartNextRef = useRef(false);
   const lastNotifiedAttemptRef = useRef(0);
   const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

   const requiredAccuracy = speakingConfig.requiredAccuracy || 50;

   const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition
   } = useSpeechRecognition();

   const currentFullTranscript = (spokenHistory + (transcript ? (spokenHistory.endsWith(' ; ') ? transcript : (spokenHistory ? ' ' + transcript : transcript)) : '')).trim();

   const lockedPhrase = useMemo(() => {
      return phrases.find(p => p.id === lockedPhraseId) || null;
   }, [lockedPhraseId, phrases]);

   // Build target components for locked phrase
   const targetWords = useMemo(() => {
      if (!lockedPhrase) return [];
      return lockedPhrase.components.map(id => {
         if (id === 'w_dots') return { id: 'w_dots', th: '...', fr: '', phonetic: '' } as Word;
         return dictionary.find(d => d.id === id) || { id, th: '???', fr: '', phonetic: '' } as Word;
      });
   }, [lockedPhrase, dictionary]);

   // Generate options
   useEffect(() => {
      if (status === 'success') return; // wait for transition

      if (lockedPhraseId === null) {
         // Start state: pick up to 3 uncompleted phrases with UNIQUE first words
         const available = phrases.filter(p => !completedPhraseIds.includes(p.id));
         const shuffledAvailable = shuffle(available);
         
         const selectedPhrases: Phrase[] = [];
         const seenFirstWords = new Set<string>();
         
         for (const p of shuffledAvailable) {
            const firstWordId = p.components.find(c => c !== 'w_dots');
            const wordObj = dictionary.find(w => w.id === firstWordId);
            const wordTh = wordObj ? normalizeThai(wordObj.th) : firstWordId;
            
            if (firstWordId && !seenFirstWords.has(wordTh || '')) {
               seenFirstWords.add(wordTh || '');
               selectedPhrases.push(p);
               if (selectedPhrases.length === 3) break;
            }
         }
         
         const startWords = selectedPhrases.map(p => {
            const firstWordId = p.components.find(c => c !== 'w_dots');
            return dictionary.find(w => w.id === firstWordId) || { id: firstWordId || 'unknown', th: '???', fr: '', phonetic: '' } as Word;
         });
         
         setOptions(startWords);
         setWrongOptionIds([]);
      } else if (lockedPhrase && targetWords.length > 0) {
         // Skip dots automatically
         if (targetWords[step]?.id === 'w_dots') {
            if (step + 1 >= targetWords.length) {
               handlePhraseFinish();
            } else {
               setStep(s => s + 1);
            }
            return;
         }

         const targetWord = targetWords[step];
         if (!targetWord) return;

         // Pick 2 random words from dictionary that are not the target word
         const targetNorm = normalizeThai(targetWord.th);
         const others = dictionary.filter(w => 
            w.id !== targetWord.id && 
            w.id !== 'w_dots' && 
            w.th && 
            w.th.trim().length > 0 &&
            normalizeThai(w.th) !== targetNorm
         );
         const randomOthers = shuffle(others).slice(0, 2);
         const newOptions = shuffle([targetWord, ...randomOthers]);
         
         setOptions(newOptions);
         // Do not clear wrongOptionIds here if we want to keep them until correct? 
         // Actually we should clear them on new step.
         setWrongOptionIds([]);
      }
   }, [lockedPhraseId, step, phrases, completedPhraseIds, dictionary, targetWords]);

   const handlePhraseFinish = () => {
      setStatus('success');
      SpeechRecognition.stopListening();
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      
      setTimeout(() => {
         onCompletePhrase(lockedPhraseId!, mistakes);
      }, 1500);
   };

   const evaluateTranscript = (text: string) => {
      if (!text || options.length === 0) return;

      let remainingTranscript = normalizeThai(replaceNumbersWithThai(text));
      
      let matchedWord: Word | null = null;
      let bestSimGlob = 0;

      for (const option of options) {
         const targetNorm = normalizeThai(option.th);
         if (!targetNorm) continue;

         const variants = speakingConfig.strictMode ? [targetNorm] : [targetNorm, ...getAliases(targetNorm)];
         
         let isMatch = false;
         let bestSimForOption = 0;

         // Exact match
         for (const variant of variants) {
            if (remainingTranscript.includes(variant)) {
               isMatch = true;
               bestSimForOption = 100;
               break;
            }
         }

         // Fuzzy match
         if (!isMatch) {
            for (const variant of variants) {
               const vLen = variant.length;
               for (let len = Math.max(1, vLen - 1); len <= vLen + 1; len++) {
                  for (let i = 0; i <= remainingTranscript.length - len; i++) {
                     const sub = remainingTranscript.substring(i, i + len);
                     const dist = levenshtein.get(sub, variant);
                     const maxL = Math.max(sub.length, variant.length);
                     const sim = Math.max(0, Math.round(((maxL - dist) / maxL) * 100));

                     let adjustedAccuracy = requiredAccuracy;
                     if (targetNorm.length <= 3 && requiredAccuracy > 60 && !speakingConfig.strictMode) {
                        adjustedAccuracy = 60;
                     }

                     if (sim >= adjustedAccuracy && sim > bestSimForOption) {
                        isMatch = true;
                        bestSimForOption = sim;
                     }
                  }
               }
            }
         }

         if (isMatch && bestSimForOption > bestSimGlob) {
            bestSimGlob = bestSimForOption;
            matchedWord = option;
         }
      }

      if (matchedWord) {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         SpeechRecognition.stopListening();
         
         if (lockedPhraseId === null) {
            // Find which phrase this word belongs to (as first word)
            const available = phrases.filter(p => !completedPhraseIds.includes(p.id));
            const selectedPhrase = available.find(p => p.components.find(c => c !== 'w_dots') === matchedWord?.id);
            
            if (selectedPhrase) {
               setLockedPhraseId(selectedPhrase.id);
               const firstWordIndex = selectedPhrase.components.findIndex(c => c !== 'w_dots');
               setStep(firstWordIndex + 1);
               resetListeningContext(true); // Auto-start next word
               if (isAutoMicEnabled) autoStartNextRef.current = true;
            }
         } else {
            // Building phrase
            const targetWord = targetWords[step];
            if (matchedWord.id === targetWord.id) {
               // Correct!
               if (step + 1 >= targetWords.length) {
                  handlePhraseFinish();
               } else {
                  setStep(s => s + 1);
                  resetListeningContext(true); // ALWAYS auto-start for the next word in the phrase
                  if (isAutoMicEnabled) autoStartNextRef.current = true;
               }
            } else {
               // Wrong choice
               if (!wrongOptionIds.includes(matchedWord.id)) {
                  setWrongOptionIds(prev => [...prev, matchedWord!.id]);
                  setMistakes(m => m + 1);
               }
               // reset transcript to try again
               resetListeningContext(false); // don't start auto, let them see mistake
               setStatus('idle');
            }
         }
      }
   };

   const resetListeningContext = (autoStart = false) => {
      resetTranscript();
      setSpokenHistory("");
      setStatus('idle');
      if (autoStartNextRef.current || autoStart) {
         setTimeout(() => startListening(true), 300);
         autoStartNextRef.current = false;
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
         setStatus(prev => prev === 'evaluating' ? 'timeup' : prev);
      }, 500);
   };

   useEffect(() => {
      if (status === 'listening') {
         listeningTimerRef.current = setTimeout(() => stopAndEvaluate(), 5000);
      } else if (status === 'idle' || status === 'timeup') {
         SpeechRecognition.stopListening();
         if (status === 'timeup') setMicAttempts(prev => prev + 1);
      }
      return () => { if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current); };
   }, [status]);

   useEffect(() => {
      if (mistakes > 0 && mistakes % 2 === 0 && mistakes !== lastNotifiedAttemptRef.current) {
         lastNotifiedAttemptRef.current = mistakes;
         if (onLoseStar) onLoseStar();
      }
   }, [mistakes, onLoseStar]);

   useEffect(() => {
      return () => { SpeechRecognition.abortListening(); };
   }, []);

   const startListening = (clearHistory = true) => {
      stopTTS();
      SpeechRecognition.abortListening();
      if (!clearHistory && transcript) setSpokenHistory(currentFullTranscript + " ");
      if (clearHistory) setSpokenHistory("");
      resetTranscript();
      setStatus('listening');
      SpeechRecognition.startListening({ language: 'th-TH', continuous: true });
   };

   const playTTS = (wordTh: string) => {
      if (status === 'listening' || status === 'evaluating') {
         SpeechRecognition.abortListening();
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         setStatus('idle');
      }
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
         const utterance = new SpeechSynthesisUtterance(wordTh);
         utterance.lang = 'th-TH';
         window.speechSynthesis.speak(utterance);
      } else {
         playThaiTTS(wordTh);
      }
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
         {/* Prompt */}
         <div className="text-center mb-8 relative w-full max-w-2xl mt-4 min-h-[4rem]">
            {lockedPhrase ? (
               <h2 className="text-3xl font-bold text-slate-800 leading-relaxed animate-in fade-in">
                  {getLocalizedField(lockedPhrase, '', language)}
               </h2>
            ) : (
               <h2 className="text-xl font-bold text-slate-500 leading-relaxed animate-in fade-in">
                  {getTranslation('auto.choose_first_word', language) || "Prononcez le premier mot pour commencer :"}
               </h2>
            )}
         </div>

         {/* Build Zone */}
         <div className="min-h-[120px] w-full max-w-2xl border-y-2 border-slate-200 py-6 flex flex-wrap gap-3 items-center justify-center mb-8">
            {lockedPhraseId !== null ? targetWords.map((word, index) => {
               const isPlaced = index < step;
               
               if (word.id === 'w_dots') {
                  return (
                     <div key={`fixed-${index}`} className="bg-transparent border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-medium font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-14">
                        <span className="leading-none text-2xl sm:text-3xl">...</span>
                     </div>
                  );
               }

               if (isPlaced) {
                  return (
                     <motion.div
                        layoutId={`word-${word.id}`}
                        key={`placed-${index}`}
                        className={`flex flex-col items-center justify-center px-4 py-2 border-2 rounded-xl shadow-sm font-thai min-w-[4rem] h-14 text-emerald-700 border-emerald-300 bg-emerald-50`}
                     >
                        <span className="text-3xl font-medium leading-none">{word.th}</span>
                     </motion.div>
                  );
               } else {
                  return (
                     <div key={`empty-${index}`} className="border-2 border-dashed border-slate-300 bg-transparent rounded-xl px-4 py-2 flex items-center justify-center min-w-[4rem] h-14 opacity-50">
                        <span className="text-2xl text-slate-400 font-medium">...</span>
                     </div>
                  );
               }
            }) : (
               <div className="text-slate-400 italic">
                  {getTranslation('auto.waiting_selection', language) || "En attente de sélection..."}
               </div>
            )}
         </div>

         {/* Options Bank */}
         <div className="w-full max-w-2xl flex flex-wrap gap-4 items-center justify-center mb-10 min-h-[4rem]">
            <AnimatePresence mode="popLayout">
               {options.map((word, index) => {
                  const isWrong = wrongOptionIds.includes(word.id);
                  return (
                     <motion.button
                        key={`bank-${word.id}-${step}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isWrong ? 0.3 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => playTTS(word.th)}
                        disabled={isWrong}
                        className={`bg-white text-slate-700 border-2 border-slate-200 border-b-4 rounded-xl px-6 py-3 shadow-sm font-thai flex items-center justify-center min-w-[5rem] h-16 transition-colors hover:bg-slate-50 cursor-pointer ${isWrong ? 'grayscale' : ''}`}
                     >
                        <span className="text-3xl font-medium leading-none">{word.th}</span>
                     </motion.button>
                  );
               })}
            </AnimatePresence>
         </div>

         {/* Controls */}
         <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent flex flex-col items-center gap-3 z-50 pointer-events-none">
            {status === 'timeup' && lockedPhraseId !== null && (
               <p className="text-amber-600 font-bold animate-pulse text-center bg-white/80 px-4 py-1 rounded-full shadow-sm text-sm pointer-events-auto">
                  {getTranslation('auto.time_s_up', language) || 'Temps écoulé !'}
               </p>
            )}

            <div className="relative flex items-center justify-center w-full h-24 pointer-events-auto">


               <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <button
                     onClick={() => setIsAutoMicEnabled(!isAutoMicEnabled)}
                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isAutoMicEnabled ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                  >
                     <Zap size={20} className={isAutoMicEnabled ? 'fill-emerald-500' : ''} />
                  </button>
               </div>

               {status !== 'listening' && status !== 'success' && (
                  <button
                     onClick={() => startListening(true)}
                     className="w-20 h-20 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2 transition-all group z-10"
                  >
                     {status === 'evaluating' ? <Loader2 size={32} className="animate-spin" /> : <Mic size={32} className="group-hover:scale-110" />}
                  </button>
               )}

               {status === 'success' && (
                  <div className="w-20 h-20 bg-emerald-500/50 text-white rounded-full flex items-center justify-center z-10 opacity-60">
                     <Mic size={32} />
                  </div>
               )}

               {status === 'listening' && (
                  <>
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex items-center z-10">
                        <span className="text-lg font-thai text-slate-600 bg-white/90 backdrop-blur px-6 py-3 rounded-full border border-orange-200 shadow-sm flex items-center gap-2">
                           <Loader2 size={18} className="animate-spin text-orange-500" />
                           <span className="truncate">{currentFullTranscript || <span className="text-slate-400 italic text-sm">{getTranslation('auto.speak_now', language)}</span>}</span>
                        </span>
                     </motion.div>
                     <button onClick={stopAndEvaluate} className="w-20 h-20 bg-rose-500 hover:bg-rose-400 text-white rounded-3xl flex items-center justify-center shadow-[0_8px_0_rgb(225,29,72)] transition-all">
                        <Square size={32} className="fill-current" />
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
