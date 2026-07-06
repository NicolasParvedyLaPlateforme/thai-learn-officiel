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
  language = 'fr',
  onAddMistake
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
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto px-4">
      {/* Top Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-6 min-h-[40vh]">

        {/* White Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="w-full max-w-[320px] sm:max-w-sm bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center py-10 px-6 gap-6 mb-10"
        >
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-lg font-medium text-slate-500">
              {exercise.question}
            </h2>
            {exercise.displayWord && (
              <div className="text-5xl font-bold font-thai text-[#00a67d] tracking-wide">
                {exercise.displayWord}
              </div>
            )}
          </div>

          <button
            onClick={() => exercise.targetSound && playThaiTTS(exercise.targetSound)}
            className="w-20 h-20 rounded-full bg-[#EEF2EE] flex items-center justify-center text-[#063b2f] hover:bg-[#E2EBE4] hover:scale-105 active:scale-95 transition-all group"
          >
            <Volume2 className="w-8 h-8 md:w-9 md:h-9 transition-colors fill-current" />
          </button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center w-full px-2"
        >
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {getTranslation('auto.find_word_position', language) || "Trouve la position du mot"}
          </h3>
          <p className="text-base sm:text-lg text-slate-500 font-medium">
            {getTranslation('auto.listen_and_select_position', language) || "Écoute et sélectionne la bonne position"}
          </p>
        </motion.div>
      </div>

      <div className="min-h-[2rem] flex items-center justify-center mb-4">
        {localErrors.length > 0 && !(isChecking && isCorrect === false) && (
          <div className="text-rose-500 font-bold animate-pulse text-base sm:text-lg py-0.5 sm:py-1 px-3 sm:px-4 bg-rose-50 rounded-full border border-rose-200 shadow-sm">
            Incorrect
          </div>
        )}
      </div>

      {/* Bottom Options Area */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full pb-8">
        {exercise.options.map((opt: any) => {
          const isSelected = selected === opt.th;
          const isError = localErrors.includes(opt.id);
          const showAsCorrect = isChecking && isCorrect && isSelected;
          const showAsWrong = isChecking && isCorrect === false && isSelected;

          let btnClass = "bg-[#E2E8E4] hover:bg-[#D5DCD8] text-slate-900";

          if (showAsCorrect) {
            btnClass = "bg-emerald-500 text-white shadow-lg scale-105 border-b-4 border-emerald-600";
          } else if (showAsWrong || isError) {
            btnClass = "bg-rose-100 text-rose-500 opacity-50 scale-95";
          } else if (isSelected) {
            btnClass = "bg-emerald-100 border-4 border-emerald-400 text-emerald-800 scale-105";
          }

          return (
            <motion.button
              key={opt.id}
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              onClick={() => handleSelect(opt.id, opt.th)}
              disabled={disabled || isError}
              className={`relative flex items-center justify-center w-36 h-44 sm:w-40 sm:h-48 rounded-[2rem] transition-all duration-300 overflow-hidden ${btnClass}`}
            >
              <span className="text-6xl font-black opacity-90">
                {opt.th}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
