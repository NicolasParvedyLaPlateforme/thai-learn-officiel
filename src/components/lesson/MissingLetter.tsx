import { getTranslation } from "@/hooks/useTranslation";
import React from 'react';
import { Exercise } from "@/types";
import { playThaiTTS } from "@/lib/tts";
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
  const renderText = () => {
    let { originalWord, missingIndex, placeholderType } = exercise;

    // Retro-compatibility: compute missing properties if they are not in the DB
    if (originalWord === undefined || missingIndex === undefined) {
      if (exercise.missingLetterText && exercise.answer) {
        missingIndex = exercise.missingLetterText.indexOf('_');
        originalWord = exercise.missingLetterText.replace('_', exercise.answer);

        const aboveVowels = ['ิ', 'ี', 'ึ', 'ื', 'ั', '็', '์', 'ํ', '๋', '้', '๊', '่'];
        const belowVowels = ['ุ', 'ู'];
        if (aboveVowels.includes(exercise.answer)) {
          placeholderType = 'above';
        } else if (belowVowels.includes(exercise.answer)) {
          placeholderType = 'below';
        } else {
          placeholderType = 'normal';
        }
      }
    }

    if (!originalWord || missingIndex === undefined || missingIndex === -1) {
      // Ultimate Fallback
      return (
        <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center">
          {(exercise.missingLetterText || "").split('').map((char, index) => (
            <span key={index} className={char === '_' ? 'text-amber-500 mx-1' : (char === selected ? 'text-amber-500 font-bold animate-in zoom-in duration-300' : '')}>
              {selected && char === '_' ? selected : char}
            </span>
          ))}
        </div>
      );
    }

    let clusterStartIndex = missingIndex > 0 ? missingIndex - 1 : 0;
    while (clusterStartIndex >= 0) {
      const charCode = originalWord.charCodeAt(clusterStartIndex);
      // Thai consonants: 0x0E01 to 0x0E2E
      if (charCode >= 0x0E01 && charCode <= 0x0E2E) {
        break;
      }
      clusterStartIndex--;
    }
    if (clusterStartIndex < 0) clusterStartIndex = Math.max(0, missingIndex - 1);

    let clusterEndIndex = missingIndex + 1;
    while (clusterEndIndex < originalWord.length) {
      const charCode = originalWord.charCodeAt(clusterEndIndex);
      if (charCode >= 0x0E01 && charCode <= 0x0E2E) {
        break;
      }
      clusterEndIndex++;
    }

    const beforeBase = originalWord.substring(0, clusterStartIndex);
    const baseChar = originalWord.substring(clusterStartIndex, missingIndex);
    const afterMissing = originalWord.substring(missingIndex + 1, clusterEndIndex);
    const afterBase = originalWord.substring(clusterEndIndex);

    const isCombining = placeholderType === 'above' || placeholderType === 'below';

    if (isCombining) {
      const hasUpperVowel = ['ิ', 'ี', 'ึ', 'ื', 'ั', '็', '์', 'ํ'].some(v => baseChar.includes(v));

      // On considère qu'on cherche une "2ème voyelle / ton" s'il y a un afterMissing 
      // ou si la base contient déjà une voyelle haute.
      const isComplexCluster = afterMissing.length > 0 || hasUpperVowel;

      return (
        <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center gap-[2px]">
          <span>{beforeBase}</span>

          <span className="relative inline-flex items-center justify-center ">

            {selected ? (
              // ÉTAT TROUVÉ : Si c'est un cluster complexe (2ème voyelle/ton), on le laisse en gris (sans coloration).
              // Sinon (voyelle simple), on peut le laisser en orange.
              <span className={`animate-in zoom-in duration-300 ${isComplexCluster ? 'text-slate-800' : 'text-amber-500'}`}>
                {baseChar}{selected}{afterMissing}
              </span>
            ) : (
              // ÉTAT VIDE : Méthode 100% native. Pas de texte flottant ou invisible.
              <>
                <span className="text-slate-800 z-10">
                  {baseChar}{afterMissing}
                </span>

                {/* Tiret pour la voyelle manquante au-dessus */}
                {placeholderType === 'above' && (
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full z-20 ${hasUpperVowel ? '-top-4' : 'top-4'
                      }`}
                  />
                )}

                {/* Tiret pour la voyelle manquante en-dessous */}
                {placeholderType === 'below' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full z-20" />
                )}
              </>
            )}

          </span>

          <span>{afterBase}</span>
        </div>
      );
    }

    // Normal non-combining rendering (like consonants, or front/back vowels)
    return (
      <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center">
        <span>{originalWord.substring(0, missingIndex)}</span>
        {!selected ? (
          <span className="text-amber-500 mx-1 relative -top-5">_</span>
        ) : (
          <span className="text-amber-500 font-bold animate-in zoom-in duration-300">{selected}</span>
        )}
        <span>{originalWord.substring(missingIndex + 1)}</span>
      </div>
    );
  };

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    if (onAutoCheck) {
      onAutoCheck(val);
    }
  };

  // Détermine la clé de consigne en fonction du type de placeholder
  const instructionKey = (() => {
    const { placeholderType } = exercise;
    const aboveVowels = ['ิ', 'ี', 'ึ', 'ื', 'ั', '็', '์', 'ํ', '๋', '้', '๊', '่', 'ะ', 'า', 'แ', 'โ', 'ใ', 'ไ', 'เ', 'อ', 'ุ', 'ู'];
    const answer = exercise.answer || '';
    if (placeholderType === 'above' || placeholderType === 'below' || aboveVowels.includes(answer)) {
      return 'exercise.find_vowel';
    }
    if (placeholderType === 'normal' && answer.length === 1) {
      return 'exercise.find_consonant';
    }
    return 'exercise.find_letter';
  })();

  return (
    <div className="w-full h-full flex flex-col items-center px-4 py-4">

      {/* Zone centrale : carte + icône + traduction + consigne */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-4">

        {/* Carte : mot avec la lettre manquante + indice phonétique */}
        <div className="w-full bg-white rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
          {renderText()}

          {/* Indice phonétique de la lettre cible — reste dans la carte */}
          {exercise.showPhoneticHint !== false && exercise.targetLetterPhonetic && (
            <div className="text-lg font-medium text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
              {exercise.targetLetterPhonetic}
            </div>
          )}
        </div>

        {/* Pill : mot français + icône son côte à côte */}
        {(exercise.question || exercise.targetLetter) && (
          <button
            onClick={() => exercise.targetLetter && playThaiTTS(exercise.targetLetter)}
            className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {exercise.question && (
              <span className="text-2xl font-semibold text-slate-800">{exercise.question}</span>
            )}
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

        {/* Consigne traduite */}
        <h2 className="text-xl font-semibold text-slate-800 text-center leading-snug px-4 max-w-xs">
          {getTranslation(instructionKey, language)}
        </h2>
      </div>

      {/* Options */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4 mt-4 pb-2">
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
                  className="w-full h-full"
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
