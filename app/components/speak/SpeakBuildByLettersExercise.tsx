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
   const [successScore, setSuccessScore] = useState<number>(0);

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
                  setSuccessScore(similarity);
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
         } else {
            // Phase 2: Letter matching
            const spokenText = normalizeThai(transcript);
            const expectedChar = targetChars[step];

            // Calculate similarity for ALL options
            const similarities = currentOptions.map(opt => {
               if (opt.isWrong) return 0;

               const optName = normalizeThai(getLetterSpokenName(opt.char));
               const dist = levenshtein.get(spokenText, optName);
               const maxL = Math.max(spokenText.length, optName.length);
               let similarity = Math.max(0, Math.round(((maxL - dist) / maxL) * 100));

               // Fallback: Dictation engines often spell rare letters phonetically.
               const DICTATION_ALIASES: Record<string, string[]> = {
                  'ณ': ['นอเนน', 'เนน', 'นอเณร', 'โนน', 'โนนี่', 'โดเนอะ', 'โนเน'],
                  'ญ': ['ยอหยิง', 'ยอหญิง', 'หยิง'],
                  'ฒ': ['ทอผู้เฒ่า', 'ทอพูเทา', 'พูเทา', 'ผู้เฒ่า'],
                  'ฬ': ['ลอจุลา', 'จุลา'],
                  'ฆ': ['คอระคัง', 'ระคัง'],
                  'ฌ': ['ชอเชอ', 'เชอ'],
                  'ฎ': ['ดอชะดา', 'ชะดา'],
                  'ฏ': ['ตอปะตัก', 'ปะตัก'],
                  'ฐ': ['ถอสันทาน', 'สันทาน'],
                  'ฑ': ['ทอมนโท', 'มนโท'],
                  'ธ': ['ทอทง', 'ทง'],
                  'า': ['อา', 'อ้า', 'อ๋า', 'ซาร่าอา'],
                  'ะ': ['อะ', 'อ๊ะ', 'ซาร่าอะ'],
                  'ิ': ['อิ', 'อิ๊', 'ซาร่าอิ'],
                  'ี': ['อี', 'อี๊', 'ซาร่าอี'],
                  'ึ': ['อึ', 'อึ๊', 'ซาร่าอึ'],
                  'ื': ['อือ', 'อื๊อ', 'ซาร่าอือ'],
                  'ุ': ['อุ', 'อุ๊', 'ซาร่าอุ'],
                  'ู': ['อู', 'อู๊', 'ซาร่าอู'],
                  'เ': ['เอ', 'ซาร่าเอ'],
                  'แ': ['แอ', 'ซาร่าแอ'],
                  'โ': ['โอ', 'ซาร่าโอ'],
                  'ใ': ['ไม้ม้วน', 'ไมม้วน', 'ม้วน'],
                  'ไ': ['ไม้มลาย', 'ไมมลาย', 'มลาย'],
                  'ั': ['ไม้หันอากาศ', 'ไมหันอากาศ', 'หันอากาศ'],
                  '์': ['การันต์', 'การัน', 'ไม้ทัณฑฆาต', 'ทัณฑฆาต']
               };

               // Instant match if the speech API correctly recognized and returned the Thai character itself!
               if (spokenText.includes(opt.char)) {
                  similarity = 100;
               } else if (DICTATION_ALIASES[opt.char]) {
                  if (DICTATION_ALIASES[opt.char].some(alias => spokenText.includes(alias))) {
                     similarity = 100;
                  }
               }

               return similarity;
            });

            // Find the expected option's index and similarity
            const expectedIndex = currentOptions.findIndex(o => o.char === expectedChar);
            const expectedSim = expectedIndex >= 0 ? similarities[expectedIndex] : 0;

            let matchedOptionIndex = -1;
            let highestSim = 0;

            // Leniency rule: If the expected char scores at least 70%, we assume the user intended to say it.
            // This fixes dictation engines frequently confusing long/short vowels (e.g. สระอา vs สระอะ) in isolation.
            if (expectedSim >= 70) {
               matchedOptionIndex = expectedIndex;
               highestSim = expectedSim;
            } else {
               // Otherwise, just pick the highest scoring option
               for (let i = 0; i < similarities.length; i++) {
                  if (similarities[i] > highestSim) {
                     highestSim = similarities[i];
                     matchedOptionIndex = i;
                  }
               }
            }

            if (highestSim >= requiredAccuracy) {
               stopMic();
               setStatus('evaluating');

               const matchedChar = currentOptions[matchedOptionIndex].char;

               if (matchedChar === expectedChar) {
                  // Correct
                  setStatus('success');
                  setSuccessScore(highestSim);
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
                     let colorClass = "bg-white border-2 border-slate-200 hover:border-orange-300";
                     if (isSuccess) {
                        if (successScore < 100) colorClass = "text-amber-700 border-2 border-amber-300 bg-amber-50 shadow-sm shadow-amber-100";
                        else colorClass = "text-emerald-700 border-2 border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100";
                     }
                     return (
                        <motion.div
                           key={idx}
                           animate={isSuccess ? { scale: [1, 1.05, 1], y: [0, -5, 5, 0] } : {}}
                           transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 10 }}
                           className={`rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${colorClass}`}
                           onClick={() => playTTS(phrase.th)}
                        >
                           <span className={`text-2xl font-thai mb-1 ${isSuccess ? '' : 'text-slate-700'}`}>{phrase.th}</span>
                           <div className="flex gap-2 items-center">
                              <span className={`text-sm ${isSuccess ? 'opacity-80' : 'text-slate-500'}`}>{phrase.phonetic}</span>
                              {isSuccess && successScore < 100 && (
                                 <span className="text-[11px] font-bold opacity-80">{successScore}%</span>
                              )}
                           </div>
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

                        let colorClass = opt.isWrong
                           ? 'bg-slate-100 border-2 border-slate-200 text-slate-300 pointer-events-none'
                           : 'bg-white border-2 border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:translate-y-0.5 active:border-b-2';

                        if (isSuccess) {
                           if (successScore < 100) colorClass = "text-amber-700 border-amber-300 bg-amber-50 border-2 border-b-4 pointer-events-none shadow-sm";
                           else colorClass = "text-emerald-700 border-emerald-300 bg-emerald-50 border-2 border-b-4 pointer-events-none shadow-sm";
                        }

                        return (
                           <motion.button
                              key={`key-${idx}`}
                              animate={isSuccess ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                              transition={{ duration: 0.5, type: 'spring' }}
                              onClick={() => playTTS(getLetterTTSName(opt.char))}
                              className={`
                                 rounded-xl font-medium font-thai select-none transition-all
                                 text-4xl sm:text-5xl flex flex-col items-center justify-center h-20 sm:h-24
                                 ${colorClass}
                              `}
                           >
                              <span className="leading-none pt-1">{displayStr}</span>
                              {isSuccess && successScore < 100 && (
                                 <span className="text-[11px] font-bold font-sans mt-1 opacity-80">{successScore}%</span>
                              )}
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
