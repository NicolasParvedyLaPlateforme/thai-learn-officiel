import React, { useMemo } from 'react';
import { Exercise } from '@/types/lesson';
import { Volume2 } from 'lucide-react';
import { playThaiTTS } from '@/lib/tts';
import { OptionCardButton } from '../ui/OptionCardButton';
import { m, AnimatePresence } from 'framer-motion';
import { getTranslation } from '@/hooks/useTranslation';

interface Props {
  exercise: Exercise;
  selected?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isChecking?: boolean;
  isCorrect?: boolean | null;
  onAutoCheck?: (val?: string) => void;
  language?: string;
  onAddMistake?: () => void;
}

export default React.memo(function SoundToLetter({ exercise, selected, onChange, disabled, onAutoCheck, isChecking, isCorrect, language = 'fr', onAddMistake }: Props) {

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    if (onAutoCheck) {
      onAutoCheck(val);
    }
  };

  const isWrong = isChecking && isCorrect === false;

  let displayQuestion = exercise.question;
  let displayQuestionNode: React.ReactNode = displayQuestion;

  if (displayQuestion) {
    // 1. Extraction propre du son (on capture ce qu'il y a entre les guillemets)
    const soundMatch = displayQuestion.match(/(?:«\s*|"\s*)(.+?)(?:\s*»|\s*")/);
    // 2. Extraction du mot thaï
    const thaiMatch = displayQuestion.match(/[\u0e00-\u0e7f]+/);

    const sound = soundMatch ? soundMatch[1] : '';
    const thaiWord = thaiMatch ? thaiMatch[0] : '';

    let translatedSoundStr = sound;
    if (sound && !sound.includes('sara')) {
      const keyPart = sound.replace(/[\s-]/g, '_').toLowerCase();
      const targetSoundKey = `auto.sound.${keyPart}`;
      const translatedSound = getTranslation(targetSoundKey, language);
      if (translatedSound && translatedSound !== targetSoundKey) {
        translatedSoundStr = translatedSound;
      }
    }

    // Classe de mise en valeur (Orange, plus gros et gras)
    const highlightClass = "text-orange-500 text-xl font-bold inline-block mx-1";

    if (thaiWord && sound) {
      // Pour éviter les faux-positifs avec split(), on crée un pattern qui cible le son entouré de ses guillemets
      const soundPattern = new RegExp(`(?:«\\s*|"\\s*)${sound}(?:\\s*»|\\s*")`);

      // On découpe la question d'origine en utilisant le mot thaï comme premier repère
      const indexThai = displayQuestion.indexOf(thaiWord);
      const beforeThai = displayQuestion.substring(0, indexThai);
      const remainder = displayQuestion.substring(indexThai + thaiWord.length);

      // Dans le reste de la chaîne, on cherche le pattern du son avec ses guillemets
      const soundLocation = remainder.match(soundPattern);

      if (soundLocation && soundLocation.index !== undefined) {
        const beforeSound = remainder.substring(0, soundLocation.index);
        const afterSound = remainder.substring(soundLocation.index + soundLocation[0].length);

        displayQuestionNode = (
          <>
            {beforeThai}
            <span className={highlightClass}>{thaiWord}</span>
            {beforeSound}
            {/* On réintègre les guillemets originaux autour du son stylisé si souhaité, ou non */}
            « <span className={highlightClass}>{translatedSoundStr}</span> »
            {afterSound}
          </>
        );
      }
    }

    if (!displayQuestionNode) {
      displayQuestionNode = displayQuestion;
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Question */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-8">
          {displayQuestionNode}
        </h2>

        {/* Display Word */}
        <div className="w-full max-w-2xl mx-auto mb-8 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
          <div className="text-5xl md:text-6xl font-thai text-slate-800 leading-relaxed text-center flex items-center justify-center">
            {exercise.originalWord}
          </div>

          {/* Play target sound button */}
          {exercise.targetLetter && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <button
                onClick={() => playThaiTTS(exercise.targetLetter!)}
                className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition-colors border border-indigo-100 shadow-sm"
                aria-label="Écouter le son"
              >
                <Volume2 size={24} />
              </button>
              <span className="text-sm font-medium text-slate-400">Écouter</span>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="w-full max-w-2xl mx-auto mt-auto">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence>
            {exercise.options.map((opt: any, index: number) => {
              const isSelected = selected === opt.id;

              return (
                <m.div
                  key={opt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <OptionCardButton
                    className="w-full h-full"
                    isSelected={isSelected}
                    isSuccess={isChecking ? (opt.id === exercise.answer) : undefined}
                    isError={isWrong}
                    disabled={disabled}
                    onClick={() => handleSelect(opt.id)}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center relative pb-1 gap-2">
                      <span className="font-thai text-4xl leading-none font-normal w-full block text-center mt-2">{opt.th}</span>
                    </div>
                  </OptionCardButton>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
