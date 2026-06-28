import { getTranslation } from "@/hooks/useTranslation";
import React, { useMemo } from 'react';
import { Exercise } from "@/types";
import { playThaiTTS } from "@/lib/tts";
import { Volume2 } from 'lucide-react';
import { OptionCardButton } from "@/components/ui/OptionCardButton";
import { m, AnimatePresence } from "framer-motion";

interface Props {
  exercise: Exercise;
  selected: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isChecking?: boolean;
  isCorrect?: boolean | null;
  onAutoCheck?: (val?: string) => void;
  language?: string;
  onAddMistake?: () => void;
}

export default React.memo(function MissingLetter({ exercise, selected, onChange, disabled, onAutoCheck, isChecking, isCorrect, language = 'fr', onAddMistake }: Props) {

  // Remplacer le tiret par la lettre sélectionnée, ou le laisser tel quel
  const displayText = useMemo(() => {
    if (!exercise.missingLetterText) return "";
    if (selected) {
      return exercise.missingLetterText.replace('_', selected);
    }
    return exercise.missingLetterText;
  }, [exercise.missingLetterText, selected]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    if (onAutoCheck) {
      onAutoCheck(val);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Display Text */}
      <div className="w-full max-w-2xl mx-auto mb-8 bg-white rounded-2xl p-6 border-2 border-slate-100 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
        <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center">
          {displayText.split('').map((char, index) => (
            <span key={index} className={char === '_' ? 'text-slate-300 mx-1' : (char === selected ? 'text-amber-500 font-bold animate-in zoom-in duration-300' : '')}>
              {char}
            </span>
          ))}
        </div>

        {/* Hint for missing letter (Phonetic & Audio) */}
        <div className="flex flex-col items-center gap-2 mt-2">
          {exercise.showPhoneticHint !== false && exercise.targetLetterPhonetic && (
            <div className="text-lg font-medium text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
              {exercise.targetLetterPhonetic}
            </div>
          )}
          {exercise.targetLetter && (
            <button
              onClick={() => playThaiTTS(exercise.targetLetter!)}
              className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition-colors border border-indigo-100 shadow-sm"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {exercise.options.map((opt: any, index: number) => {
            const isSelected = selected === opt.id;
            // On gère l'état d'erreur visuelle si isChecking et que c'est sélectionné et faux
            const isWrong = isChecking && isSelected && !isCorrect;
            const isRight = isChecking && isSelected && isCorrect;

            return (
              <m.div
                key={opt.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <OptionCardButton
                  isSelected={isSelected}
                  isSuccess={isChecking ? (opt.id === exercise.answer) : undefined}
                  isError={isWrong}
                  disabled={disabled}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full h-full "
                >
                  <div className="flex items-center justify-center relative pb-1">
                    <span className="font-thai text-4xl leading-none font-normal w-full block text-center">{opt.th}</span>
                  </div>
                </OptionCardButton>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});
