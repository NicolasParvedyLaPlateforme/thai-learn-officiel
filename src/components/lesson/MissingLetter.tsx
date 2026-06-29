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
      // Vérifie si la base contient déjà une voyelle haute
      const hasUpperVowel = ['ิ', 'ี', 'ึ', 'ื', 'ั', '็', '์', 'ํ'].some(v => baseChar.includes(v));

      return (
        <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center min-h-[80px] flex items-center justify-center gap-[2px]">
          <span>{beforeBase}</span>

          <span className="relative inline-flex items-center justify-center min-w-[1em]">

            {selected ? (
              // 1. ÉTAT TROUVÉ : On affiche simplement la syllabe complète en orange.
              <span className="text-amber-500 animate-in zoom-in duration-300">
                {baseChar}{selected}{afterMissing}
              </span>
            ) : (
              // 2. ÉTAT VIDE
              <>
                {/* La consonne de base (visible) */}
                <span className="text-slate-800 z-10">
                  {baseChar}
                  {/* Si c'est une voyelle basse manquante, le ton reste attaché à la consonne normalement */}
                  {placeholderType !== 'above' && afterMissing}
                </span>

                {/* Placement si la lettre manquante va au-dessus (ex: sara ii) */}
                {placeholderType === 'above' && (
                  <>
                    {/* Le trait orange à sa place (bien mis avec -top-1 et -top-4) */}
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500 rounded-full z-20 ${hasUpperVowel ? '-top-4' : 'top-5'
                        }`}
                    />

                    {/* Le ton lévitant avec alignement horizontal naturel réparé */}
                    {afterMissing && (
                      <span
                        className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
                        style={{ transform: hasUpperVowel ? 'translateY(-0.7em)' : 'translateY(-0.35em)' }}
                      >
                        {/* ASTUCE : On utilise une copie transparente de la consonne.
                            Le navigateur alignera le ton parfaitement à droite sur sa barre verticale ! */}
                        <span className="text-transparent">{baseChar}</span>
                        <span className="text-slate-800">{afterMissing}</span>
                      </span>
                    )}
                  </>
                )}

                {/* Placement si la lettre manquante va en-dessous (ex: sara u) */}
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
