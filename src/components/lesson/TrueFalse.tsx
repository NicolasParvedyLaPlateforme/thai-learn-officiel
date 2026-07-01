import React from 'react';
import { m } from "framer-motion";
import { playThaiTTS } from "@/lib/tts";
import { getTranslation } from "@/hooks/useTranslation";
import { Exercise } from "@/types";
import { OptionCardButton } from '../ui/OptionCardButton';

interface Props {
  exercise: Exercise;
  selected: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isChecking?: boolean;
  isCorrect?: boolean | null;
  language?: string;
  onAutoCheck?: (val: string) => void;
}

export default React.memo(function TrueFalse({
  exercise,
  selected,
  onChange,
  disabled,
  isChecking,
  isCorrect,
  language = 'fr',
  onAutoCheck
}: Props) {

  const handleSelect = (val: string) => {
    if (!disabled) {
      onChange(val);
      if (onAutoCheck) {
        onAutoCheck(val);
      }
    }
  };

  const getState = (val: string): { isSelected: boolean; isSuccess?: boolean; isError?: boolean } => {
    const isSelected = selected === val;
    const isAnswer = exercise.answer === val;

    if (isChecking) {
      if (isSelected) {
        return { isSelected: true, isSuccess: !!isCorrect, isError: !isCorrect };
      }
      if (isAnswer) {
        return { isSelected: false, isSuccess: true };
      }
    }

    return { isSelected };
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4 py-6">

      {/* Zone centrale : carte + pill traduction + consigne */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">

        {/* Carte : mot thaï */}
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-10 py-10 rounded-[2rem] shadow-sm border border-slate-100 text-center flex items-center justify-center w-full min-w-[280px] max-w-[360px]"
        >
          <div className="text-7xl md:text-8xl font-thai text-slate-900 leading-none">
            {exercise.displayWord || exercise.originalWord || "???"}
          </div>
        </m.div>

        {/* Pill : mot français + icône son côte à côte */}
        {(exercise.translation || exercise.phonetic) && (
          <button
            onClick={() => playThaiTTS(exercise.originalWord || "")}
            className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col items-start">
              {exercise.translation && (
                <span className="text-2xl font-semibold text-slate-800">{exercise.translation}</span>
              )}
              {exercise.phonetic && (
                <span className="text-sm text-slate-400 font-light">[{exercise.phonetic}]</span>
              )}
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-full shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </div>
          </button>
        )}

        {/* Consigne */}
        <h2 className="text-xl font-semibold text-slate-800 text-center leading-snug max-w-xs">
          {getTranslation(exercise.question, language)}
        </h2>
      </div>

      {/* Boutons Vrai/Faux — collés en bas, même style OptionCardButton */}
      <div className="mt-auto grid grid-cols-2 gap-3 max-w-sm mx-auto w-full pb-2">
        {(['true', 'false'] as const).map((val) => {
          const { isSelected, isSuccess, isError } = getState(val);
          return (
            <OptionCardButton
              key={val}
              isSelected={isSelected}
              isSuccess={isSuccess}
              isError={isError}
              disabled={disabled}
              onClick={() => handleSelect(val)}
              className="w-full text-lg font-semibold"
            >
              {val === 'true'
                ? getTranslation('exercise.true', language)
                : getTranslation('exercise.false', language)}
            </OptionCardButton>
          );
        })}
      </div>

    </div>
  );
});