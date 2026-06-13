'use client';

import { getTranslation } from '../../hooks/useTranslation';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Phrase } from '../../types';
import { Mic, ArrowRight, Loader2, Square, Volume2 } from 'lucide-react';
import { useProgressStore } from '../../lib/store';
import { stopTTS, playThaiTTS } from '../../lib/tts';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { m as motion, AnimatePresence } from "motion/react";
import { getWritingClustersAndGroups } from '../../lib/exercise-generator';
import { THAI_ALPHABET, AlphabetItem } from '../../lib/alphabet-data';
import { formatCombiningChar } from '../../lib/alphabet-utils';

const normalizeThai = (str: string) => {
   return str.replace(/[\s\.\?!,ๆ;]/g, '').toLowerCase();
};

const shuffle = <T,>(array: T[]): T[] => {
   const arr = [...array];
   for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
   }
   return arr;
};

// Map character to its alphabet data
const getLetterData = (char: string): AlphabetItem | undefined => {
   return THAI_ALPHABET.find(a => a.letter === char);
};

const getLetterSpokenName = (char: string): string => {
   const data = getLetterData(char);
   if (data) return data.exampleWord;
   return char;
};

const getLetterTTSName = (char: string): string => {
   const data = getLetterData(char);
   if (data) {
      if (data.type === 'vowel' && data.exampleWord.includes('สระ')) {
         // Force exact separated pronunciation for vowels so iOS doesn't shorten them
         return "สะ ระ " + data.exampleWord.replace('สระ', '').trim();
      }
      return data.exampleWord;
   }
   return char;
};

export function SpeakBuildByLettersExercise({
   phrases,
   completedPhraseIds,
   language,
   onCompletePhrase,
   onLoseStar
}: {
   phrases: Phrase[],
   completedPhraseIds: string[],
   language: string,
   onCompletePhrase: (phraseId: string, mistakes: number, isAbandoned?: boolean) => void,
   onLoseStar?: () => void
}) {
   const { speakingConfig } = useProgressStore();
   const [status, setStatus] = useState<'idle' | 'listening' | 'evaluating' | 'success' | 'timeup'>('idle');
   const [spokenHistory, setSpokenHistory] = useState("");
   const [micAttempts, setMicAttempts] = useState(0);
   
   // Phase 1: Selection
   const [lockedPhraseId, setLockedPhraseId] = useState<string | null>(null);
   const [availablePhrases, setAvailablePhrases] = useState<Phrase[]>([]);

   // Phase 2: Building
   const [targetChars, setTargetChars] = useState<string[]>([]);
   const [step, setStep] = useState(0); // Current character index
   const [currentOptions, setCurrentOptions] = useState<{ char: string, isWrong: boolean }[]>([]);
   const [mistakes, setMistakes] = useState(0);
   const [hintCount, setHintCount] = useState(0);
   const [hintRomanization, setHintRomanization] = useState<string | null>(null);
   const [successPhraseId, setSuccessPhraseId] = useState<string | null>(null);
   const [successChar, setSuccessChar] = useState<string | null>(null);

   const autoStartNextRef = useRef(false);
   const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

   const requiredAccuracy = speakingConfig.requiredAccuracy || 50;

   const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition
   } = useSpeechRecognition();

   // Initialize available phrases
   useEffect(() => {
      const remaining = phrases.filter(p => !completedPhraseIds.includes(p.id));
      setAvailablePhrases(shuffle(remaining).slice(0, 3));
      setLockedPhraseId(null);
      setStep(0);
      setTargetChars([]);
   }, [phrases, completedPhraseIds]);

   // When a phrase is locked, initialize its characters
   useEffect(() => {
      if (lockedPhraseId) {
         const phrase = phrases.find(p => p.id === lockedPhraseId);
         if (phrase) {
            const { characters } = getWritingClustersAndGroups(phrase.th.replace(/\s+/g, ''));
            setTargetChars(characters);
            setStep(0);
            setMistakes(0);
            setHintCount(0);
            setHintRomanization(null);
         }
      }
   }, [lockedPhraseId, phrases]);

   // Generate options for the current step
   useEffect(() => {
      if (lockedPhraseId && targetChars.length > 0 && step < targetChars.length) {
         const expectedChar = targetChars[step];
         
         const isConsonant = (charStr: string) => {
            const code = charStr.charCodeAt(0);
            return code >= 0x0E01 && code <= 0x0E2E;
         };
         const expectedIsConsonant = isConsonant(expectedChar);

         // Find distractors from the alphabet
         let distractors = THAI_ALPHABET.filter(a => a.letter !== expectedChar);
         // Prioritize same type
         distractors.sort((a, b) => {
            const aSame = isConsonant(a.letter) === expectedIsConsonant ? 1 : 0;
            const bSame = isConsonant(b.letter) === expectedIsConsonant ? 1 : 0;
            return bSame - aSame;
         });
         
         distractors = shuffle(distractors.slice(0, 15)).slice(0, 2); // Random 2 from top 15

         const options = shuffle([
            { char: expectedChar, isWrong: false },
            ...distractors.map(d => ({ char: d.letter, isWrong: false }))
         ]);
         
         setCurrentOptions(options);
         setStatus('idle');
         setSpokenHistory("");
         setHintRomanization(null);
         resetTranscript();
      }
   }, [lockedPhraseId, targetChars, step]);

   // Audio matching logic
   useEffect(() => {
      if (status === 'listening' && transcript) {
         setSpokenHistory(transcript);

         // Phase 1: Selection matching
         if (!lockedPhraseId) {
            const spokenText = normalizeThai(transcript);
            for (const phrase of availablePhrases) {
               const targetText = normalizeThai(phrase.th);
               const distance = levenshtein.get(spokenText, targetText);
               const maxLen = Math.max(spokenText.length, targetText.length);
               const similarity = maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100;
               
               if (similarity >= requiredAccuracy) {
                  stopMic();
                  setStatus('success');
                  setSuccessPhraseId(phrase.id);
                  playTTS(phrase.th);
                  setTimeout(() => {
                     setLockedPhraseId(phrase.id);
                     setSuccessPhraseId(null);
                     resetTranscript();
                  }, 1000);
                  return;
               }
            }
         } 
         // Phase 2: Letter matching
         else {
            const spokenText = normalizeThai(transcript);
            const expectedChar = targetChars[step];
            
            // Check against options
            let matchedOptionIndex = -1;
            let highestSim = 0;

            for (let i = 0; i < currentOptions.length; i++) {
               const opt = currentOptions[i];
               if (opt.isWrong) continue; // Skip already failed options
               
               const optName = normalizeThai(getLetterSpokenName(opt.char));
               const dist = levenshtein.get(spokenText, optName);
               const maxL = Math.max(spokenText.length, optName.length);
               let similarity = Math.max(0, Math.round(((maxL - dist) / maxL) * 100));

               // Instant match if the speech API correctly recognized and returned the Thai character itself!
               if (spokenText.includes(opt.char)) {
                  similarity = 100;
               }

               if (similarity > highestSim) {
                  highestSim = similarity;
                  matchedOptionIndex = i;
                  
                  if (similarity === 100) break; // Perfect match found, stop looking
               }
            }

            if (highestSim >= requiredAccuracy) {
               stopMic();
               setStatus('evaluating');
               
               const matchedChar = currentOptions[matchedOptionIndex].char;
               
               if (matchedChar === expectedChar) {
                  // Correct
                  setStatus('success');
                  setSuccessChar(matchedChar);
                  setTimeout(() => {
                     setSuccessChar(null);
                     if (step + 1 >= targetChars.length) {
                        // Finished phrase
                        onCompletePhrase(lockedPhraseId, mistakes);
                     } else {
                        setStep(step + 1);
                     }
                  }, 1000);
               } else {
                  // Wrong
                  setMistakes(m => m + 1);
                  setCurrentOptions(prev => prev.map((o, idx) => idx === matchedOptionIndex ? { ...o, isWrong: true } : o));
                  setTimeout(() => {
                     setStatus('idle');
                     setSpokenHistory("");
                     resetTranscript();
                  }, 1000);
               }
            }
         }
      }
   }, [transcript]);

   // Handle mic timeout
   useEffect(() => {
      if (status === 'listening') {
         listeningTimerRef.current = setTimeout(() => {
            stopMic();
            setStatus('timeup');
         }, 5000);
      }
      return () => {
         if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
      };
   }, [status, micAttempts]);

   const startMic = async () => {
      if (!browserSupportsSpeechRecognition) {
         alert("Speech recognition not supported");
         return;
      }
      try {
         await SpeechRecognition.startListening({ continuous: true, language: 'th-TH' });
         setStatus('listening');
         setSpokenHistory("");
         resetTranscript();
         setMicAttempts(a => a + 1);
      } catch (e) {
         console.error(e);
      }
   };

   const stopMic = () => {
      SpeechRecognition.stopListening();
      if (status === 'listening') setStatus('evaluating');
   };

   const playTTS = (text: string) => {
      if (status === 'listening' || status === 'evaluating') {
         stopMic();
         setStatus('idle');
      }
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
         const utterance = new SpeechSynthesisUtterance(text);
         utterance.lang = 'th-TH';
         window.speechSynthesis.speak(utterance);
      } else {
         playThaiTTS(text);
      }
   };

   const toggleMic = () => {
      if (status === 'listening') {
         stopMic();
      } else {
         startMic();
      }
   };

   const isCombining = (charStr: string) => {
      const code = charStr.charCodeAt(0);
      return code === 0x0E31 || (code >= 0x0E34 && code <= 0x0E3A) || (code >= 0x0E47 && code <= 0x0E4E);
   };

   return (
      <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-4xl mx-auto w-full relative">
         {/* Phase 1: Selection */}
         {!lockedPhraseId && (
            <div className="flex flex-col gap-6 w-full items-center">
               <h2 className="text-xl sm:text-2xl font-bold text-slate-700 text-center">
                  {getTranslation('auto.speak_to_select', language)}
               </h2>
               
               <div className="flex flex-col gap-3 w-full max-w-md">
                  {availablePhrases.map((phrase, idx) => {
                     const isSuccess = successPhraseId === phrase.id;
                     return (
                        <motion.div 
                           key={idx} 
                           animate={isSuccess ? { scale: [1, 1.05, 1] } : {}}
                           transition={{ duration: 0.4 }}
                           className={`rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                              isSuccess ? 'bg-green-50 border-2 border-green-500 shadow-sm shadow-green-100' : 'bg-white border-2 border-slate-200 hover:border-orange-300'
                           }`}
                           onClick={() => playTTS(phrase.th)}
                        >
                           <span className="text-2xl font-thai text-slate-700 mb-1">{phrase.th}</span>
                           <span className="text-slate-500 text-sm">{phrase.phonetic}</span>
                        </motion.div>
                     );
                  })}
               </div>
            </div>
         )}

         {/* Phase 2: Building */}
         {lockedPhraseId && (
            <div className="flex flex-col gap-8 w-full mt-4">
               {/* Selected Area (VirtualKeyboard style) */}
               <div className={`min-h-[100px] border-y-2 border-slate-200 py-4 flex flex-col gap-2`}>
                  <div className="flex gap-3 justify-center items-center">
                     <div className="bg-white border-2 border-b-4 border-slate-200 rounded-xl px-4 py-2 sm:px-5 sm:py-3 shadow-sm text-3xl sm:text-4xl font-thai leading-relaxed text-center break-all min-w-[180px] min-h-[64px] sm:min-h-[76px] flex justify-center items-center">
                        {step === 0 ? (
                           <span className="text-slate-400 p-2 font-medium text-base sm:text-lg font-sans">
                              ...
                           </span>
                        ) : (
                           (() => {
                              const clusters: { chars: string }[] = [];
                              targetChars.slice(0, step).forEach((char) => {
                                 if (clusters.length === 0 || !isCombining(char)) {
                                    clusters.push({ chars: char });
                                 } else {
                                    clusters[clusters.length - 1].chars += char;
                                 }
                              });

                              return clusters.map((cluster, idx) => (
                                 <span key={`sel-cluster-${idx}`} className="text-slate-700">
                                    {cluster.chars}
                                 </span>
                              ));
                           })()
                        )}
                     </div>
                     {step < targetChars.length && (
                        <div className="flex flex-col items-center gap-2">
                           <button 
                              className="flex items-center justify-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-600 p-3 sm:px-4 sm:py-3 rounded-xl sm:text-sm font-semibold hover:bg-indigo-100 transition-colors"
                              onClick={() => {
                                 setHintCount(h => h + 1);
                                 playTTS(getLetterTTSName(targetChars[step]));
                                 
                                 const data = getLetterData(targetChars[step]);
                                 if (data) setHintRomanization(data.pronunciation);

                                 if ((hintCount + 1) % 5 === 0 && onLoseStar) {
                                    onLoseStar();
                                 }
                              }}
                              title="Indice (Son)"
                           >
                              <Volume2 size={24} strokeWidth={2.5} />
                              <span className="font-bold text-lg leading-none">A</span>
                           </button>
                           {hintRomanization && (
                              <span className="text-indigo-600 font-medium text-sm animate-fade-in bg-indigo-50 px-2 py-1 rounded-md">
                                 {hintRomanization}
                              </span>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* Options Area */}
               {step < targetChars.length && (
                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto w-full">
                     {currentOptions.map((opt, idx) => {
                        let displayStr = formatCombiningChar(opt.char);
                        const isSuccess = successChar === opt.char;
                        
                        return (
                           <motion.button
                              key={`key-${idx}`}
                              animate={isSuccess ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                              transition={{ duration: 0.5, type: 'spring' }}
                              onClick={() => playTTS(getLetterTTSName(opt.char))}
                              className={`
                                 rounded-xl font-medium font-thai select-none transition-all
                                 text-4xl sm:text-5xl flex items-center justify-center h-20 sm:h-24
                                 ${isSuccess 
                                    ? 'bg-green-500 border-2 border-green-600 border-b-4 text-white shadow-lg shadow-green-200 pointer-events-none' 
                                    : opt.isWrong 
                                       ? 'bg-slate-100 border-2 border-slate-200 text-slate-300 pointer-events-none' 
                                       : 'bg-white border-2 border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:translate-y-0.5 active:border-b-2'
                                 }
                              `}
                           >
                              <span className="leading-none pt-1">{displayStr}</span>
                           </motion.button>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* Microphone Button at the bottom */}
         {(status !== 'success' || !lockedPhraseId) && (!lockedPhraseId || step < targetChars.length) && (
            <div className="flex flex-col items-center mt-auto pt-12 pb-8">
               <div className="mb-6 min-h-[3rem] text-center px-4 w-full max-w-md">
                  {status === 'listening' ? (
                     <p className="text-lg text-slate-600 font-medium">
                        {spokenHistory || getTranslation('auto.listening', language)}
                     </p>
                  ) : status === 'timeup' ? (
                     <p className="text-rose-500 font-medium">{getTranslation('auto.no_audio_detected', language)}</p>
                  ) : status === 'evaluating' ? (
                     <p className="text-orange-500 font-medium animate-pulse">{getTranslation('auto.checking', language)}</p>
                  ) : (
                     <p className="text-slate-500 font-medium text-lg">
                        {lockedPhraseId 
                           ? getTranslation('auto.speak_letter_name', language) || "Prononcez le nom de la lettre"
                           : getTranslation('auto.speak_phrase_instruction', language) || "Prononcez la phrase que vous souhaitez travailler"}
                     </p>
                  )}
               </div>

               <button
                  onClick={toggleMic}
                  className={`
                     relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                     transition-all duration-300 shadow-lg active:scale-95
                     ${status === 'listening' ? 'bg-rose-500 animate-pulse ring-4 ring-rose-500/30' : 'bg-orange-500 hover:bg-orange-600'}
                  `}
               >
                  {status === 'listening' ? (
                     <Square size={36} className="text-white fill-white" />
                  ) : (
                     <Mic size={40} className="text-white" strokeWidth={2.5} />
                  )}
               </button>
            </div>
         )}
      </div>
   );
}
