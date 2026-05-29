import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2 } from 'lucide-react';
import { playThaiTTS } from '../lib/tts';
import { useProgressStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { formatCombiningChar } from '../lib/alphabet-utils';

interface PairMatchProps {
  pairs: Word[];
  mode?: 'normal' | 'audio-only' | 'script-only';
  onComplete: (failed?: boolean) => void;
  forceHideRomanization?: boolean;
  disabled?: boolean;
}

const pairColors = [
  'bg-blue-100 border-blue-300 text-blue-700',
  'bg-emerald-100 border-emerald-300 text-emerald-700',
  'bg-amber-100 border-amber-300 text-amber-700',
  'bg-purple-100 border-purple-300 text-purple-700',
  'bg-pink-100 border-pink-300 text-pink-700',
  'bg-cyan-100 border-cyan-300 text-cyan-700',
];

export default function PairMatch({ pairs, mode = 'normal', onComplete, forceHideRomanization, disabled }: PairMatchProps) {
  const { language, showRomanization } = useProgressStore();
  const [leftCards, setLeftCards] = useState<{id: string, text: string, type: 'left'}[]>([]);
  const [rightCards, setRightCards] = useState<{id: string, text: string, phonetic: string, type: 'right'}[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set()); // IDs that recently failed (format: "type-id")
  const [mistakes, setMistakes] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const lefts = pairs.map(p => ({
      id: p.id,
      text: language === 'en' ? (p.en || p.fr) : p.fr,
      type: 'left' as const
    }));
    const rights = pairs.map(p => ({
      id: p.id,
      text: p.th,
      phonetic: p.phonetic,
      type: 'right' as const
    }));

    const leftsSorted = [...lefts].sort(() => Math.random() - 0.5);
    const rightsSorted = [...rights].sort(() => Math.random() - 0.5);
    setLeftCards(leftsSorted);
    setRightCards(rightsSorted);
  }, [pairs, language]);

  const handleSelectLeft = (id: string) => {
    if (disabled || failed || matchedIds.has(id)) return;
    
    // In audio-only mode, force user to select audio first.
    if (mode === 'audio-only' && !selectedRight) {
      return;
    }

    setSelectedLeft(id);
    checkMatch(id, selectedRight);
  };

  const handleSelectRight = (id: string) => {
    if (disabled || failed || matchedIds.has(id)) return;
    setSelectedRight(id);
    if (mode !== 'script-only') {
      playThaiTTS(pairs.find(p => p.id === id)?.th || '');
    }
    checkMatch(selectedLeft, id);
  };

  const checkMatch = (leftId: string | null, rightId: string | null) => {
    if (!leftId || !rightId) return;

    if (leftId === rightId) {
      // Match!
      playThaiTTS(pairs.find(p => p.id === leftId)?.th || '');
      setMatchedIds(prev => new Set(prev).add(leftId));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Mismatch!
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (newMistakes >= 2) {
        setFailed(true);
        setSelectedLeft(null);
        setSelectedRight(null);
        onComplete(true);
      } else {
        const errList = new Set([`left-${leftId}`, `right-${rightId}`]);
        setErrorIds(prev => new Set([...prev, ...errList]));
        setSelectedLeft(null);
        setSelectedRight(null);
        setTimeout(() => {
          setErrorIds(prev => {
            const newErr = new Set(prev);
            newErr.delete(`left-${leftId}`);
            newErr.delete(`right-${rightId}`);
            return newErr;
          });
        }, 600);
      }
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!failed && matchedIds.size > 0 && matchedIds.size === pairs.length) {
      timeout = setTimeout(() => {
        onComplete(false);
      }, 1000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [matchedIds.size, pairs.length, failed]);

  const isAllMatched = !failed && matchedIds.size > 0 && matchedIds.size === pairs.length;

  return (
    <div className="relative w-full max-w-lg mx-auto py-2 sm:py-8 flex flex-col justify-center">
      <div className={`w-full flex justify-between gap-4 transition-opacity duration-500 ${isAllMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Left Column (FR/EN) */}
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {leftCards.map(card => {
            const isMatched = matchedIds.has(card.id);
            const isSelected = selectedLeft === card.id;
            const isError = errorIds.has(`left-${card.id}`);
            const isDisabled = disabled || isMatched || (mode === 'audio-only' && !selectedRight && !selectedLeft);
            let colorClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

            if (failed) {
              const pairIndex = pairs.findIndex(p => p.id === card.id);
              colorClass = pairColors[pairIndex % pairColors.length];
            } else if (isError) {
              colorClass = 'bg-rose-100 border-rose-300 text-rose-700';
            } else if (isSelected) {
              colorClass = 'bg-indigo-100 border-indigo-300 text-indigo-700';
            }

            return (
              <motion.button
                key={`L-${card.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isMatched ? 0.3 : (mode === 'audio-only' && !selectedRight && !selectedLeft) ? 0.6 : 1, scale: isMatched ? 0.95 : 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => handleSelectLeft(card.id)}
                disabled={isDisabled || failed}
                style={{ WebkitTapHighlightColor: 'transparent', willChange: 'opacity, transform' }}
                className={`px-2 py-4 rounded-xl text-base sm:text-lg font-medium border-b-4 transition-colors h-24 sm:h-32 flex items-center justify-center text-center leading-tight transform-gpu backface-hidden
                  ${(isMatched || isDisabled || failed) ? 'pointer-events-none' : ''}
                  ${colorClass}
                `}
              >
                {card.text}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column (TH) */}
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {rightCards.map((card, index) => {
            const isMatched = matchedIds.has(card.id);
            const isSelected = selectedRight === card.id;
            const isError = errorIds.has(`right-${card.id}`);
            let colorClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

            if (failed) {
              const pairIndex = pairs.findIndex(p => p.id === card.id);
              colorClass = pairColors[pairIndex % pairColors.length];
            } else if (isError) {
              colorClass = 'bg-rose-100 border-rose-300 text-rose-700';
            } else if (isSelected) {
              colorClass = 'bg-indigo-100 border-indigo-300 text-indigo-700';
            }

            return (
              <motion.button
                key={`R-${card.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isMatched ? 0.3 : 1, scale: isMatched ? 0.95 : 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => handleSelectRight(card.id)}
                disabled={disabled || isMatched || failed}
                style={{ WebkitTapHighlightColor: 'transparent', willChange: 'opacity, transform' }}
                className={`px-2 py-4 rounded-xl text-base sm:text-lg font-medium border-b-4 transition-colors h-24 sm:h-32 flex items-center justify-center text-center leading-tight transform-gpu backface-hidden
                  ${(isMatched || disabled || failed) ? 'pointer-events-none' : ''}
                  ${colorClass}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {mode === 'audio-only' ? (
                    <Volume2 className={`w-8 h-8 sm:w-10 sm:h-10 ${isSelected || isMatched || failed ? 'text-indigo-600' : 'text-slate-400'}`} />
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl">{formatCombiningChar(card.text)}</span>
                      {mode !== 'script-only' && (!forceHideRomanization && showRomanization || isMatched || failed) && (
                        <span className="text-xs sm:text-sm opacity-60 font-mono mt-1 text-slate-500">[{card.phonetic}]</span>
                      )}
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isAllMatched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="bg-emerald-500 text-white font-black text-3xl md:text-5xl px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-[6px] border-emerald-700">
              <span className="text-4xl md:text-5xl">✨</span>
              {language === 'en' ? 'Excellent!' : 'Bravo !'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
