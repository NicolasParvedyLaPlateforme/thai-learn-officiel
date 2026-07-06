import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/Button";
import { Exercise } from "@/types";
import { playThaiTTS } from "@/lib/tts";
import { formatCombiningChar } from "@/lib/alphabet-utils";

import { Volume2, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { OptionCardButton } from "@/components/ui/OptionCardButton";

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


export default React.memo(function WordMatch({ exercise, selected, onChange, disabled, onAutoCheck, isChecking, isCorrect, language = 'fr', onAddMistake }: Props) {
  const isDense = exercise.options.length > 6;
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
        {localErrors.length > 0 && !(isChecking && isCorrect === false) && (
          <div className="text-rose-500 font-bold animate-pulse text-base sm:text-lg py-0.5 sm:py-1 px-3 sm:px-4 bg-rose-50 rounded-full border border-rose-200 shadow-sm">
            Incorrect
          </div>
        )}
      </div>
      <div className={`grid gap-2 sm:gap-3 ${isDense ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} w-full max-w-2xl mx-auto`}>
        {exercise.options.map((opt) => {
          const isSelected = selected === opt.th;
          const isLocalError = localErrors.includes(opt.th);
          const isFailedState = isChecking && isCorrect === false;
          const isActualAnswer = opt.th === exercise.answer;

          let buttonClass = 'bg-white border-slate-200 border-b-4 text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5';
          let textClass = '';

          if (isFailedState) {
            if (isActualAnswer) {
              buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-700 border-b-4 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]';
            } else {
              buttonClass = 'bg-rose-50 border-rose-300 text-rose-400 opacity-70 translate-y-0.5 border-b-2';
              textClass = 'line-through decoration-rose-300';
            }
          } else {
            if (isSelected) {
              buttonClass = 'bg-indigo-50 border-indigo-500 text-indigo-700 border-b-2 translate-y-0.5 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]';
            } else if (isLocalError) {
              buttonClass = 'bg-rose-50 border-rose-200 text-rose-300 opacity-50 translate-y-0.5 border-b-2';
              textClass = 'line-through decoration-rose-300';
            }
          }

          const displayValue = exercise.reverse
            ? getLocalizedField(opt, '', language) || opt.th
            : formatCombiningChar(opt.th);

          return (
            <Button
              key={opt.id}
              variant="outline"
              onClick={() => {
                if (!disabled) {
                  if (!exercise.reverse) {
                    playThaiTTS(opt.th);
                  }
                  onChange(opt.th);
                  if (onAutoCheck) {
                    onAutoCheck(opt.th);
                  }
                }
              }}
              disabled={disabled || isLocalError}
              className={`!w-full !h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-5 flex-col ${isFailedState && !isActualAnswer ? "opacity-70" : ""} ${isSelected ? "border-b-0 translate-y-1" : ""}`}
            >
              <div className="w-full flex items-center justify-center relative">
                <span className={`${!exercise.reverse ? 'font-thai' : ''} font-normal ${exercise.reverse
                  ? (isDense ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl')
                  : (isDense ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl')
                  } ${textClass}`}>{displayValue}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
});
