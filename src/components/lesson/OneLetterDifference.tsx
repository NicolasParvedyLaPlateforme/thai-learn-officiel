import React, { useMemo, useState } from 'react';
import { m as motion } from 'motion/react';
import { Exercise } from '@/types';
import { useTranslation, getTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Volume2 } from 'lucide-react';
import { analyzeDifferences } from '@/lib/utils/diff-utils';
import { playThaiTTS } from '@/lib/tts';
import { formatCombiningChar } from '@/lib/alphabet-utils';

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

export default React.memo(function OneLetterDifference({
  exercise,
  selected,
  onChange,
  disabled,
  onAutoCheck,
  isChecking,
  isCorrect,
  language = 'fr'
}: Props) {
  const { t } = useTranslation();
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  const isDense = exercise.options.length > 6;
  const hintType = exercise.oneLetterHintType || 'sound';
  const showColor = exercise.diffReveal ?? true;

  const diffAnalysis = useMemo(() => {
    return analyzeDifferences(exercise.options.map((o: any) => o.th), exercise.answer);
  }, [exercise]);

  const targetLetter = diffAnalysis?.matchedLetter;

  return (
    <div className="flex flex-col w-full h-full max-w-2xl mx-auto">
      {/* Top Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 min-h-[40vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="text-center mb-2 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-600">
              {exercise.question}
            </h2>
          </div>

          {hintType === 'sound' && (
            <button
              onClick={() => targetLetter && playThaiTTS(targetLetter.letter)}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all shadow-sm group"
            >
              <Volume2 className="w-16 h-16 md:w-20 md:h-20 group-hover:text-indigo-600 transition-colors" />
            </button>
          )}

          {hintType === 'image' && (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-6xl md:text-7xl shadow-sm">
              {targetLetter?.mnemonicEmoji || '🐘'}
            </div>
          )}

          {hintType === 'pronunciation' && (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-4xl md:text-5xl font-bold text-indigo-600 shadow-sm text-center">
              {targetLetter?.pronunciation || '?'}
            </div>
          )}

          <div className="text-center mt-4">
            <div className="text-lg font-bold text-slate-700">
              {getTranslation('auto.only_one_letter_differentiates', language)}
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {hintType === 'sound' && getTranslation('auto.hint_1', language)}
              {hintType === 'image' && getTranslation('auto.hint_2', language)}
              {hintType === 'pronunciation' && getTranslation('auto.hint_3', language)}
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
      <div className={`grid gap-2 sm:gap-3 ${isDense ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} w-full`}>
        {exercise.options.map((opt: any) => {
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

          const displayValue = (diffAnalysis && showColor)
            ? (
              <span className="inline-block whitespace-nowrap">
                {opt.th.substring(0, diffAnalysis.commonPrefixLen)}
                <span className="text-fuchsia-600 font-bold bg-fuchsia-100 rounded px-px shadow-sm inline-block">{opt.th.substring(diffAnalysis.commonPrefixLen, opt.th.length - diffAnalysis.commonSuffixLen)}</span>
                {opt.th.substring(opt.th.length - diffAnalysis.commonSuffixLen)}
              </span>
            )
            : formatCombiningChar(opt.th);

          return (
            <Button
              key={opt.id}
              variant="outline"
              onClick={() => {
                if (!disabled) {
                  playThaiTTS(opt.th);
                  onChange(opt.th);
                  if (onAutoCheck) {
                    onAutoCheck(opt.th);
                  }
                }
              }}
              disabled={disabled || isLocalError}
              className={`!w-full !h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-5 flex-col ${isFailedState && !isActualAnswer ? "opacity-70" : ""} ${isSelected ? "border-b-0 translate-y-1" : ""} ${buttonClass}`}
            >
              <div className="w-full flex items-center justify-center relative">
                <span className={`font-thai font-normal ${isDense ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} ${textClass} leading-tight pb-1`}>
                  {displayValue}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
});
