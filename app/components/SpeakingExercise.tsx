'use client';

import React, { useState, useEffect } from 'react';
import { Word, Phrase } from '../types';
import { Mic, MicOff, CheckCircle, XCircle, ArrowRight, Play, Loader2, RefreshCw } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import levenshtein from 'fast-levenshtein';
import { motion, AnimatePresence } from 'motion/react';

// Normalize string for comparison (removes spaces, punctuation, special chars)
const normalizeThai = (str: string) => {
  return str.replace(/[\s\.\?!,ๆ]/g, '').toLowerCase();
};

export function SpeakingExercise({ vocabulary, onComplete }: { vocabulary: (Word | Phrase)[], onComplete: () => void }) {
  const { language } = useProgressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'success' | 'failed' | 'partial_fail'>('idle');
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  const currentItem = vocabulary[currentIndex];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening) {
      setStatus('listening');
    } else if (status === 'listening' && transcript) {
       handleTranscriptComplete(transcript);
    }
  }, [listening, transcript]);

  // Reset when changing word
  useEffect(() => {
    resetTranscript();
    setAttempts(0);
    setStatus('idle');
    setSimilarityScore(null);
  }, [currentIndex]);

  const handleTranscriptComplete = (spokenText: string) => {
    if (!spokenText) {
      setStatus('idle');
      return;
    }

    const normalizedSpoken = normalizeThai(spokenText);
    const normalizedTarget = normalizeThai(currentItem.th);

    if (normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget)) {
      setStatus('success');
      playSuccessSound();
    } else {
      const currentAttempts = attempts + 1;
      setAttempts(currentAttempts);
      
      if (currentAttempts >= 3) {
        // Calculate similarity using levenshtein
        const distance = levenshtein.get(normalizedSpoken, normalizedTarget);
        const maxLength = Math.max(normalizedSpoken.length, normalizedTarget.length);
        const similarity = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
        
        setSimilarityScore(similarity);
        setStatus('failed');
        playFailSound();
      } else {
        setStatus('partial_fail');
        // Auto reset to try again
        setTimeout(() => {
          setStatus(prev => {
             if (prev === 'partial_fail') {
                resetTranscript();
                return 'idle';
             }
             return prev;
          });
        }, 2500);
      }
    }
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/correct.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch(e) {}
  };

  const playFailSound = () => {
    try {
      const audio = new Audio('/sounds/wrong.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch(e) {}
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
    setStatus('listening');
    SpeechRecognition.startListening({ language: 'th-TH', continuous: false });
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
       <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 w-full max-w-md text-center shadow-lg mb-8 relative">
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

       {/* Status Messages */}
       <div className="h-20 flex items-center justify-center w-full max-w-md">
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
                   className="text-amber-600 font-bold flex items-center gap-2 text-lg bg-amber-50 px-6 py-3 rounded-full border border-amber-200"
                >
                   <XCircle /> 
                   <span>
                      {language === 'en' ? "Not quite, try again!" : "Pas tout à fait, réessaie !"}
                      <span className="block text-sm font-normal text-amber-700/80 mt-0.5">
                        {transcript ? `Entendu : ${transcript}` : ''}
                      </span>
                   </span>
                </motion.div>
             )}

             {status === 'failed' && (
                <motion.div 
                   key="failed"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="text-red-500 font-bold flex items-center gap-2 text-lg bg-red-50 px-6 py-3 rounded-full border border-red-200"
                >
                   <XCircle /> 
                   <span>
                     {language === 'en' ? 'Failed.' : 'Échec.'} 
                     {similarityScore !== null && ` Précision : ${similarityScore}%`}
                     <span className="block text-sm font-normal text-red-700/80 mt-0.5">
                        {transcript ? `Entendu : ${transcript}` : ''}
                     </span>
                   </span>
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
       <div className="mt-8 flex items-center gap-4">
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
