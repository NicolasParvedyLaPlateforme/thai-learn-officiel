import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, Phrase } from "@/types";
import { Mic, ArrowRight, Play, Loader2, Volume2, Square, X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'motion/react';
import { getTranslation } from "@/hooks/useTranslation";
import { useProgressStore } from "@/lib/store";
import { stopTTS, playThaiTTS } from "@/lib/tts";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';

interface SpeakAnswerMeData {
   promptId: string;
   options: string[];
   correctOptions: string[];
}

interface SpeakAnswerMeProps {
   exercisesData: SpeakAnswerMeData[];
   dictionary: Word[];
   vocabulary: (Word | Phrase)[];
   currentIndex: number;
   onNext: (isSuccess: boolean, isAbandoned?: boolean, scorePercentage?: number) => void;
   language: string;
}

const normalizeThai = (str: string) => {
   if (!str) return '';
   return str.replace(/[\s\u200B-\u200D\uFEFF]/g, '');
};

const getTargetWords = (phrase: Word | Phrase, dict: Word[]) => {
   if (!phrase) return [];
   if ('components' in phrase && Array.isArray(phrase.components) && phrase.components.length > 0) {
      return phrase.components.map(id => {
         const w = dict.find(d => d.id === id);
         return w ? w.th : '';
      }).filter(Boolean);
   }
   return [phrase.th];
};

const getAliases = (phraseId: string) => {
   const aliases: Record<string, string[]> = {
      'p_hello_m': ['สวัสดี', 'สวัสดีครับ'],
      'p_hello_f': ['สวัสดี', 'สวัสดีค่ะ'],
      'p_thanks_m': ['ขอบคุณ', 'ขอบคุณครับ'],
      'p_thanks_f': ['ขอบคุณ', 'ขอบคุณค่ะ']
   };
   return aliases[phraseId] || [];
};

export function SpeakAnswerMeExercise({
   exercisesData,
   dictionary,
   vocabulary,
   currentIndex,
   onNext,
   language
}: SpeakAnswerMeProps) {
   const currentItemData = exercisesData[currentIndex];

   const promptItem = useMemo(() => {
      if (!currentItemData) return null;
      return vocabulary.find(v => v.id === currentItemData.promptId) || dictionary.find(d => d.id === currentItemData.promptId) as Word | Phrase;
   }, [currentItemData, vocabulary, dictionary]);

   const optionItems = useMemo(() => {
      if (!currentItemData) return [];
      return currentItemData.options.map(optId => {
         return vocabulary.find(v => v.id === optId) || dictionary.find(d => d.id === optId) as Word | Phrase;
      }).filter(Boolean);
   }, [currentItemData, vocabulary, dictionary]);

   const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

   const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'failed'>('idle');
   const [spokenHistory, setSpokenHistory] = useState("");
   const [micAttempts, setMicAttempts] = useState(0);
   const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

   const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);
   const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

   // Clear timers on unmount
   useEffect(() => {
      return () => {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
         SpeechRecognition.abortListening();
         stopTTS();
      };
   }, []);

   // Reset when changing word
   useEffect(() => {
      resetTranscript();
      setSpokenHistory("");
      setStatus('idle');
      setMicAttempts(0);
      setSelectedOptionId(null);

      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
   }, [currentIndex, resetTranscript]);

   const currentFullTranscript = (spokenHistory + " " + transcript).trim();

   const playTTS = () => {
      if (!promptItem?.th) return;
      if (status === 'listening' || status === 'evaluating') {
         SpeechRecognition.abortListening();
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
         if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
         setStatus('idle');
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
         const utterance = new SpeechSynthesisUtterance(promptItem.th);
         utterance.lang = 'th-TH';
         window.speechSynthesis.speak(utterance);
      } else {
         playThaiTTS(promptItem.th);
      }
   };

   const startListening = () => {
      stopTTS();
      SpeechRecognition.abortListening();
      setSpokenHistory("");
      resetTranscript();
      setSelectedOptionId(null);
      setStatus('listening');
      SpeechRecognition.startListening({ language: 'th-TH', continuous: true });

      // Failsafe 5 seconds max
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      listeningTimerRef.current = setTimeout(() => {
         handleSilenceCutoff();
      }, 5000);
   };

   // Listen for transcript changes to detect 1s of silence
   useEffect(() => {
      if (status !== 'listening') return;
      if (!transcript) return;

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
         handleSilenceCutoff();
      }, 1000);
   }, [transcript, status]);

   const handleSilenceCutoff = () => {
      SpeechRecognition.stopListening();
      setTimeout(() => SpeechRecognition.abortListening(), 50);
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      setStatus('evaluating');
      // Allow state to settle before evaluating
      setTimeout(() => {
         evaluateTranscription();
      }, 100);
   };

   const evaluateTranscription = () => {
      if (!currentFullTranscript) {
         setStatus('idle');
         return;
      }

      const normalizedSpoken = normalizeThai(currentFullTranscript);
      if (!normalizedSpoken) {
         setStatus('idle');
         return;
      }

      // We need to compare spoken text with ALL correctOptions and ALL options
      // If it matches a correct option with >= 50%, success!
      // If it matches a wrong option with >= 50%, fail!
      // If neither, fail.

      let bestMatch: { optionId: string, percentage: number } | null = null;

      // Combine all possible IDs we can match against
      const allPossibleIds = Array.from(new Set([...currentItemData.options, ...currentItemData.correctOptions]));

      for (const optId of allPossibleIds) {
         const item = vocabulary.find(v => v.id === optId) || dictionary.find(d => d.id === optId) as Word | Phrase;
         if (!item) continue;

         const targetWords = getTargetWords(item, dictionary);
         let matchedWordsCount = 0;
         let currentSpokenIndex = 0;

         const aliases = getAliases(item.id);

         // Very short phrases check (1 or 2 words)
         if (targetWords.length <= 2) {
            const exactMatch = targetWords.join('') === normalizedSpoken ||
               aliases.map(normalizeThai).includes(normalizedSpoken);

            let dist = levenshtein.get(normalizedSpoken, targetWords.join(''));
            let similarity = Math.max(0, 1 - dist / Math.max(normalizedSpoken.length, targetWords.join('').length));

            for (const alias of aliases) {
               const normAlias = normalizeThai(alias);
               let aliasDist = levenshtein.get(normalizedSpoken, normAlias);
               let aliasSim = Math.max(0, 1 - aliasDist / Math.max(normalizedSpoken.length, normAlias.length));
               if (aliasSim > similarity) similarity = aliasSim;
            }

            if (exactMatch || similarity >= 0.5) {
               bestMatch = { optionId: optId, percentage: similarity };
               break; // Very high match
            }
         } else {
            // Word by word comparison
            for (const wordTh of targetWords) {
               const searchArea = normalizedSpoken.substring(currentSpokenIndex);
               if (!searchArea) break;

               const index = searchArea.indexOf(wordTh);
               if (index !== -1) {
                  matchedWordsCount++;
                  currentSpokenIndex += index + wordTh.length;
                  continue;
               }

               // Try Levenshtein
               let bestSim = 0;
               let bestIdx = -1;
               for (let i = 0; i <= searchArea.length - wordTh.length; i++) {
                  const substr = searchArea.substring(i, i + wordTh.length);
                  const dist = levenshtein.get(substr, wordTh);
                  const sim = Math.max(0, 1 - dist / Math.max(substr.length, wordTh.length));
                  if (sim > bestSim) {
                     bestSim = sim;
                     bestIdx = i;
                  }
               }
               if (bestSim >= 0.5 && bestIdx !== -1) {
                  matchedWordsCount++;
                  currentSpokenIndex += bestIdx + wordTh.length;
               }
            }

            const percentage = matchedWordsCount / targetWords.length;
            if (!bestMatch || percentage > bestMatch.percentage) {
               bestMatch = { optionId: optId, percentage: percentage };
            }
         }
      }

      if (bestMatch && bestMatch.percentage >= 0.5) {
         setSelectedOptionId(bestMatch.optionId);

         if (currentItemData.correctOptions.includes(bestMatch.optionId)) {
            setStatus('success');
            setTimeout(() => {
               onNext(true, false, 100);
            }, 2000);
         } else {
            setStatus('failed');
         }
      } else {
         setStatus('idle');
      }
   };

   const handleNext = () => {
      onNext(false, false, 0); // 0% score for failure
   };

   if (!browserSupportsSpeechRecognition) {
      return (
         <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            Votre navigateur ne supporte pas la reconnaissance vocale.
         </div>
      );
   }

   if (!currentItemData || !promptItem) return null;

   return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] pb-32">
         {/* Prompt Question */}
         <div className="text-center mb-8 relative w-full max-w-2xl mt-4">
            <h2 className="text-3xl font-bold text-slate-800 leading-relaxed font-thai">
               {promptItem.th}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
               <button
                  onClick={playTTS}
                  className="w-8 h-8 bg-slate-100 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors shrink-0"
                  title="Écouter"
               >
                  <Play size={16} className="ml-0.5" />
               </button>
            </div>
         </div>

         {/* Options Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-12">
            {optionItems.map((opt) => {
               let btnClass = "bg-white border-2 border-slate-200 text-slate-700 opacity-70"; // Default

               if (status === 'success' || status === 'failed') {
                  if (currentItemData.correctOptions.includes(opt.id)) {
                     btnClass = "bg-emerald-50 border-2 border-emerald-400 text-emerald-700 opacity-100 font-bold";
                  } else if (selectedOptionId === opt.id) {
                     btnClass = "bg-rose-50 border-2 border-rose-400 text-rose-700 opacity-100";
                  }
               }

               return (
                  <div
                     key={opt.id}
                     className={`p-4 rounded-xl text-center text-xl font-thai transition-all ${btnClass}`}
                  >
                     {opt.th}
                  </div>
               );
            })}
         </div>

         {/* Action Area */}
         <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent flex flex-col items-center gap-3 z-50 pointer-events-none">
            <div className="relative flex items-center justify-center w-full h-24 pointer-events-auto">
               {status !== 'listening' && status !== 'success' && status !== 'failed' && (
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
                           <span className="truncate">{currentFullTranscript || <span className="text-slate-400 font-sans italic text-sm">{getTranslation('auto.speak_now', language) || 'Parlez...'}</span>}</span>
                        </span>
                     </motion.div>

                     <button
                        onClick={() => {
                           SpeechRecognition.stopListening();
                           setTimeout(() => SpeechRecognition.abortListening(), 50);
                           handleSilenceCutoff();
                        }}
                        className="w-20 h-20 bg-rose-500 hover:bg-rose-400 text-white rounded-3xl flex items-center justify-center shadow-[0_8px_0_rgb(225,29,72)] active:shadow-[0_0px_0_rgb(225,29,72)] active:translate-y-2 transition-all group z-10"
                        title="Stop"
                     >
                        <Square size={32} className="fill-current group-hover:scale-110 transition-transform" />
                     </button>
                  </>
               )}
            </div>
         </div>

         {/* Validation Footer (replaces the old error overlay) */}
         <AnimatePresence>
            {status === 'failed' && (
               <motion.footer
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed bottom-0 left-0 right-0 w-full min-h-[100px] md:min-h-[128px] py-4 md:py-0 border-t-2 items-center justify-center flex transition-colors duration-300 z-[60] bg-rose-50 border-rose-200 shadow-[0_-10px_40px_rgba(244,63,94,0.1)]"
               >
                  <div className="w-full max-w-2xl px-4 flex sm:flex-row flex-col items-center justify-between gap-4">
                     <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-col text-rose-600 font-extrabold text-xl gap-1 items-center sm:items-start">
                           <div className="flex items-center gap-3">
                              <div className="bg-white text-rose-500 rounded-full p-1">
                                 <X size={24} strokeWidth={3} />
                              </div>
                              {getTranslation('auto.incorrect', language) || 'Incorrect'}
                           </div>
                           <div className="text-rose-800 text-sm mt-1 uppercase tracking-widest">
                              {getTranslation('auto.correct_answer', language) || 'Réponse correcte'}
                           </div>
                           <div className="font-medium font-thai text-xl md:text-2xl mt-1 sm:mt-0 text-rose-900">
                              {optionItems.find(o => currentItemData.correctOptions.includes(o.id))?.th || ''}
                           </div>
                        </div>
                     </div>

                     <button
                        onClick={handleNext}
                        className="w-full sm:w-auto px-12 py-3 rounded-xl border-b-4 font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest bg-rose-500 border-rose-700 text-white hover:bg-rose-400"
                     >
                        {getTranslation('auto.continue', language) || 'Continuer'}
                     </button>
                  </div>
               </motion.footer>
            )}
         </AnimatePresence>
      </div>
   );
}
