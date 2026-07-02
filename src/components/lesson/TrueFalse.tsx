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
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4">

      {/* Contenu principal : carte en haut, éléments empilés */}
      <div className="flex flex-col items-center h-[80vh] gap-6 justify-evenly">

        {/* Carte Principale Unifiée (Style Flashcard) */}
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-[1rem] flex flex-col w-full min-w-[280px] max-w-[360px] overflow-hidden"
        >
          <div className="flex flex-col p-6 w-full">
            {/* Tag "mot" */}
            <div className="w-full flex justify-start mb-10">
              <span className="text-slate-500 border border-slate-200 rounded px-3 py-1 text-sm">
                mot
              </span>
            </div>

            {/* Mot thaï */}
            <div className="text-7xl md:text-8xl font-bold font-thai text-slate-900 leading-none text-center mb-14">
              {exercise.displayWord || exercise.originalWord || "???"}
            </div>

            {/* Traduction et Phonétique */}
            {(exercise.translation || exercise.phonetic) && (
              <div className="flex flex-col items-center mb-10 text-center">
                {exercise.translation && (
                  <span className="text-[1.35rem] font-medium text-slate-900 mb-2">
                    {exercise.translation}
                  </span>
                )}
                {exercise.phonetic && (
                  <span className="text-lg text-slate-400 font-light">
                    [{exercise.phonetic}]
                  </span>
                )}
              </div>
            )}

            {/* Bouton icône son */}
            {(exercise.translation || exercise.phonetic) && (
              <button
                onClick={() => playThaiTTS(exercise.originalWord || "")}
                className="mx-auto bg-emerald-50 text-emerald-600 p-4 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors mb-2"
                aria-label="Écouter la prononciation"
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
            )}
          </div>

          {/* Barre de progression verte en bas de la carte */}
          <div className="w-full h-1.5 bg-slate-100 mt-auto flex">
            <div className="h-full bg-emerald-400 w-full rounded-bl-[1rem]"></div>
          </div>
        </m.div>

        {/* Consigne */}
        <h2 className="font-semibold text-center leading-snug max-w-xs p-[29px] text-[25px] bg-[wheat] rounded-[7px] border-b-[5px] border-[#825500] text-[#825500]">
          {getTranslation(exercise.question, language)}
        </h2>
      </div>

      {/* Boutons Vrai/Faux */}
      <div className="mt-auto grid grid-cols-2 gap-3 max-w-sm mx-auto w-full lg:pb-[110px] pb-2">
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
              className="w-full h-full flex flex-col items-center justify-center relative pb-1 gap-2 text-xl font-semibold"
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