import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'motion/react';
import { Exercise, Word } from '@/types';
import { getTranslation } from '@/hooks/useTranslation';
import { Volume2, CheckCircle2, XCircle, ArrowRightLeft } from 'lucide-react';
import { playThaiTTS } from '@/lib/tts';

interface Props {
  exercise: Exercise;
  selected: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onAutoCheck?: (value: string) => void;
  isChecking?: boolean;
  isCorrect?: boolean | null;
  language?: string;
  onAddMistake?: () => void;
}

export default React.memo(function PhraseOrder({
  exercise,
  selected,
  onChange,
  disabled,
  onAutoCheck,
  isChecking,
  isCorrect,
  language = 'fr',
  onAddMistake
}: Props) {
  const [phase, setPhase] = useState<'true-false' | 'reorder'>('true-false');
  const [currentOrder, setCurrentOrder] = useState<string[]>(exercise.presentedOrder || []);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [localErrors, setLocalErrors] = useState<number>(0);

  // Initialize order when exercise changes
  useEffect(() => {
    setPhase('true-false');
    setCurrentOrder(exercise.presentedOrder || []);
    setSelectedCardIndex(null);
    setLocalErrors(0);
  }, [exercise.id]);

  const handleTrueFalseClick = (isTrue: boolean) => {
    if (disabled || isChecking) return;
    
    if (isTrue === exercise.isCorrectOrder) {
      if (isTrue) {
        // Sentence was already correct, they said True -> Done!
        if (onAutoCheck) onAutoCheck("true");
      } else {
        // Sentence was incorrect, they said False -> Correct! Now reorder.
        setPhase('reorder');
      }
    } else {
      // Wrong answer
      setLocalErrors(prev => prev + 1);
      if (onAddMistake) onAddMistake();
    }
  };

  const handleCardClick = (index: number) => {
    if (phase !== 'reorder' || disabled || isChecking) return;

    if (selectedCardIndex === null) {
      setSelectedCardIndex(index);
    } else {
      if (selectedCardIndex === index) {
        // Deselect
        setSelectedCardIndex(null);
        return;
      }
      
      // Swap
      const newOrder = [...currentOrder];
      const temp = newOrder[selectedCardIndex];
      newOrder[selectedCardIndex] = newOrder[index];
      newOrder[index] = temp;
      
      setCurrentOrder(newOrder);
      setSelectedCardIndex(null);

      // Check if correct
      if (exercise.correctOrder && newOrder.join(',') === exercise.correctOrder.join(',')) {
        if (onAutoCheck) onAutoCheck("true");
      }
    }
  };

  const getWordDetails = (id: string) => {
    return (exercise.options as Word[]).find(w => w.id === id);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-3xl mx-auto shrink min-h-0">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 min-h-0 shrink">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <div className="text-center mb-2 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
              {exercise.question}
            </h2>
            <div className="text-sm text-slate-500 font-medium">
               {phase === 'true-false' 
                  ? "Cette phrase est-elle dans le bon ordre ?" 
                  : "Cliquez sur deux cartes pour les inverser et remettre la phrase dans le bon ordre."}
            </div>
          </div>

          <button
            onClick={() => exercise.targetSound && playThaiTTS(exercise.targetSound)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EEF2EE] flex items-center justify-center text-[#063b2f] hover:bg-[#E2EBE4] hover:scale-105 active:scale-95 transition-all group shrink-0"
          >
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 transition-colors fill-current" />
          </button>

          {/* Cards Display */}
          <div className="flex flex-wrap justify-center gap-2 px-2 mt-4 w-full">
            <AnimatePresence>
              {currentOrder.map((wordId, index) => {
                const word = getWordDetails(wordId);
                if (!word) return null;
                const isSelected = selectedCardIndex === index;
                
                return (
                  <motion.div
                    key={wordId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => handleCardClick(index)}
                    className={`flex items-center justify-center min-w-[3.5rem] px-4 py-3 md:py-4 rounded-xl border transition-all select-none
                      ${phase === 'reorder' ? 'cursor-pointer hover:bg-slate-50 active:scale-95' : 'cursor-default'}
                      ${isSelected ? '!bg-[#EEF2EF] !border-transparent scale-105' : 'bg-white border-slate-200'}
                    `}
                  >
                    <span className={`text-3xl md:text-4xl font-thai ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {word.th}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="min-h-[2rem] flex items-center justify-center mb-2">
        {localErrors > 0 && phase === 'true-false' && !(isChecking && isCorrect === false) && (
          <div className="text-rose-500 font-bold animate-pulse text-sm sm:text-base py-0.5 sm:py-1 px-3 sm:px-4 bg-rose-50 rounded-full border border-rose-200">
            Incorrect
          </div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="w-full flex justify-center pb-4 min-h-[5rem] shrink-0">
        {phase === 'true-false' ? (
          <div className="flex gap-4 w-full max-w-md px-4">
            <motion.button
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              onClick={() => handleTrueFalseClick(true)}
              disabled={disabled}
              className="flex-1 py-4 flex flex-col items-center justify-center gap-2 bg-[#E2E8E4] hover:bg-[#d5ded8] text-emerald-700 rounded-[2rem] font-bold transition-all active:scale-95"
            >
              <CheckCircle2 className="w-7 h-7" />
              <span className="text-lg">Vrai</span>
            </motion.button>
            
            <motion.button
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              onClick={() => handleTrueFalseClick(false)}
              disabled={disabled}
              className="flex-1 py-4 flex flex-col items-center justify-center gap-2 bg-[#F2E8E8] hover:bg-[#EBD5D5] text-rose-600 rounded-[2rem] font-bold transition-all active:scale-95"
            >
              <XCircle className="w-7 h-7" />
              <span className="text-lg">Faux</span>
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 animate-pulse">
            <ArrowRightLeft className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Mode réorganisation</span>
          </div>
        )}
      </div>
    </div>
  );
});
