import React from 'react';
import { m } from "framer-motion";
import { playThaiTTS } from "@/lib/tts";
import { getTranslation } from "@/hooks/useTranslation";
import { Exercise } from "@/types";
import { Button } from '../ui';

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

  const getButtonVariant = (val: string) => {
    const isSelected = selected === val;

    if (isChecking && isSelected) {
      return isCorrect ? "gamified" : "dangerGamified";
    }

    if (isChecking && exercise.answer === val) {
      return "gamified"; // Montre la bonne réponse en vert
    }

    if (isSelected) {
      return "indigoGamified"; // État sélectionné avant vérification
    }

    return "gamifiedSecondary"; // État par défaut
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4 py-6">

      {/* Carte centrale : mot thaï + icône son */}
      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-10 py-12 rounded-[2rem] shadow-sm border border-slate-100 text-center relative flex flex-col items-center justify-center gap-6 w-full min-w-[280px] max-w-[360px]"
        >
          <div className="text-7xl md:text-8xl font-thai text-slate-900 leading-none">
            {exercise.displayWord || exercise.originalWord || "???"}
          </div>

          {/* Icône son — style émeraude unifié */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playThaiTTS(exercise.originalWord || "");
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full transition-transform active:scale-95 flex items-center justify-center"
            aria-label={getTranslation('exercise.listen', language)}
          >
            <svg
              width="22"
              height="22"
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
          </button>
        </m.div>

        {/* Mot français / phonétique sous la carte */}
        {(exercise.translation || exercise.phonetic) && (
          <div className="flex flex-col items-center gap-1 mt-5 text-slate-600">
            {exercise.translation && (
              <span className="text-2xl font-medium text-slate-700">{exercise.translation}</span>
            )}
            {exercise.phonetic && (
              <span className="text-base text-slate-500 font-light">[{exercise.phonetic}]</span>
            )}
          </div>
        )}

        {/* Consigne */}
        <h2 className="text-xl font-semibold text-slate-800 text-center mt-5 max-w-xs leading-snug">
          {getTranslation(exercise.question, language)}
        </h2>
      </div>

      {/* Options : Boutons Vrai/Faux */}
      <div className="mt-auto grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
        <Button
          variant={getButtonVariant('true')}
          size="lg"
          onClick={() => handleSelect('true')}
          disabled={disabled}
          className="w-full text-lg"
        >
          {getTranslation('exercise.true', language)}
        </Button>

        <Button
          variant={getButtonVariant('false')}
          size="lg"
          onClick={() => handleSelect('false')}
          disabled={disabled}
          className="w-full text-lg"
        >
          {getTranslation('exercise.false', language)}
        </Button>
      </div>

    </div>
  );
});