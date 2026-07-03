import React, { useState } from 'react';
import { m as motion } from 'motion/react';
import { Exercise } from '@/types';
import { getTranslation } from '@/hooks/useTranslation';
import { Volume2 } from 'lucide-react';
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

export default React.memo(function WordPosition({
  exercise,
  selected,
  onChange,
  disabled,
  onAutoCheck,
  isChecking,
  isCorrect,
  language = 'fr'
}: Props) {
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  
  const handleSelect = (id: string, thValue: string) => {
    if (disabled || isChecking) return;
    
    onChange(thValue);
    if (onAutoCheck) {
      if (thValue !== exercise.answer) {
        setLocalErrors(prev => [...prev, id]);
        if (onAddMistake) onAddMistake();
      }
      onAutoCheck(thValue);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto">
      {/* Top Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[40vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <div className="text-center mb-2 flex flex-col items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-500">
              {exercise.question}
            </h2>
            {exercise.displayWord && (
              <div className="text-5xl md:text-6xl font-bold font-thai text-emerald-600">
                {exercise.displayWord}
              </div>
            )}
          </div>

          <button
            onClick={() => exercise.targetSound && playThaiTTS(exercise.targetSound)}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all shadow-sm group"
          >
            <Volume2 className="w-16 h-16 md:w-20 md:h-20 group-hover:text-emerald-600 transition-colors" />
          </button>

          <div className="text-center mt-4 px-4">
             <div className="text-lg font-bold text-slate-700 mb-1">
               {getTranslation('auto.find_word_position', language) || "Trouvez la position de ce mot"}
             </div>
             <div className="text-sm text-slate-500 font-medium">
               {getTranslation('auto.listen_and_select_position', language) || "Écoutez la phrase et sélectionnez le numéro de sa position."}
             </div>
          </div>
        </motion.div>
      </div>

      <div className="min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center mb-4">
        {localErrors.length > 0 && !(isChecking && isCorrect === false) && (
          <div className="text-rose-500 font-bold animate-pulse text-base sm:text-lg py-0.5 sm:py-1 px-3 sm:px-4 bg-rose-50 rounded-full border border-rose-200 shadow-sm">
            Incorrect
          </div>
        )}
      </div>

      {/* Bottom Options Area */}
      <div className={`flex flex-wrap justify-center gap-3 md:gap-6 w-full`}>
        {exercise.options.map((opt: any, index: number) => {
          const isSelected = selected === opt.th;
          const isError = localErrors.includes(opt.id);
          const showAsCorrect = isChecking && isCorrect && isSelected;
          const showAsWrong = isChecking && isCorrect === false && isSelected;

          let btnClass = "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700";
          
          if (showAsCorrect) {
            btnClass = "bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105";
          } else if (showAsWrong || isError) {
            btnClass = "bg-rose-100 border-rose-300 text-rose-600 opacity-50 scale-95";
          } else if (isSelected) {
            btnClass = "bg-emerald-100 border-emerald-400 text-emerald-700 scale-105";
          }

          return (
            <motion.button
              key={opt.id}
              whileHover={disabled ? {} : { scale: 1.05 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              onClick={() => handleSelect(opt.id, opt.th)}
              disabled={disabled || isError}
              className={`relative flex items-center justify-center w-24 h-32 md:w-32 md:h-40 rounded-3xl border-4 transition-all duration-300 shadow-sm overflow-hidden group ${btnClass}`}
            >
              <span className="text-5xl md:text-6xl font-black font-thai opacity-90">
                {opt.th}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
