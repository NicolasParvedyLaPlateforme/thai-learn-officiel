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
      const abovePlaceholderClass = hasUpperVowel
        ? "absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full"
        : "absolute top-4 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full";

      return (
        <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center gap-[2px]">
          <span>{beforeBase}</span>

          <span className="relative flex items-center justify-center">
            {selected ? (
              // L'astuce de superposition commence ici
              <span className="relative inline-block animate-in zoom-in duration-300">

                {/* 1. Calque de base (Invisible) : Garde la vraie largeur/hauteur dans le DOM */}
                <span className="opacity-0 select-none pointer-events-none block">
                  {baseChar}{selected}{afterMissing}
                </span>

                {/* 2. Calque du dessous (Orange) : Tout le bloc est orange */}
                <span className="absolute top-0 left-0 text-amber-500 pointer-events-none block whitespace-nowrap">
                  {baseChar}{selected}{afterMissing}
                </span>

                {/* 3. Calque du dessus (Gris) : On affiche le bloc SANS le "selected". 
                       Le gris va recouvrir le orange, sauf à l'endroit précis de la lettre trouvée ! */}
                <span className="absolute top-0 left-0 text-slate-800 pointer-events-none block whitespace-nowrap">
                  {baseChar}{afterMissing}
                </span>

              </span>
            ) : (
              <>
                <span className="text-slate-800 relative z-10">{baseChar}{afterMissing}</span>
                {placeholderType === 'above' && (
                  <span className={abovePlaceholderClass} />
                )}
                {placeholderType === 'below' && (
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full" />
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Display Text */}
      <div className="w-full max-w-2xl mx-auto mb-16 bg-white rounded-2xl p-6 border-2 border-slate-100 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
        {renderText()}

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
