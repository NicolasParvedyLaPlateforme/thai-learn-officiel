import React, { useMemo } from 'react';
import { Exercise } from '@/types/lesson';
import { playThaiTTS } from '@/lib/tts';
import { OptionCardButton } from '../ui/OptionCardButton';
import { m, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Composition from './Composition';
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

export default React.memo(function SoundToLetter({
  exercise,
  selected,
  onChange,
  disabled,
  onAutoCheck,
  isChecking,
  isCorrect,
  language = 'fr',
  onAddMistake
}: Props) {
  const [showComposition, setShowComposition] = React.useState(false);
  const isPhrase = !!(exercise.introItem as any)?.components;

  const compositionWord = exercise.originalWord || exercise.answer;

  if (showComposition) {
    return (
      <div className="relative flex flex-col w-full h-full">
        <button
          onClick={() => setShowComposition(false)}
          className="absolute top-4 right-4 z-50 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-full p-2 shadow-sm flex items-center justify-center transition-colors"
          aria-label={getTranslation('auto.close', language)}
        >
          <X size={24} />
        </button>
        <Composition exercise={{ ...exercise, answer: compositionWord }} language={language} />
      </div>
    );
  }

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

  // --- NOUVEAU : Calcul de la taille de la police pour le mot principal ---
  const wordToDisplay = exercise.originalWord || "???";
  const textLen = wordToDisplay.length;

  let textSizeClass = "text-7xl md:text-8xl"; // Taille par défaut (mots courts)
  if (textLen > 16) {
    textSizeClass = "text-4xl md:text-5xl"; // Beaucoup plus petit pour les phrases
  } else if (textLen > 9) {
    textSizeClass = "text-5xl md:text-6xl"; // Légèrement réduit
  }
  // ------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-4">

      {/* Contenu principal : carte en haut, éléments empilés */}
      <div className="flex flex-col items-center h-[80vh] gap-6 justify-center">

        {/* Carte Principale Unifiée (Style Flashcard) */}
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-[1rem] flex flex-col w-full min-w-[280px] max-w-[360px] overflow-hidden"
        >
          <div className="flex flex-col p-6 w-full">
            {/* Tag "mot" ou "phrase" + Bouton Composition */}
            <div className="w-full flex justify-between items-center mb-10">
              <span className="text-slate-500 bg-white border border-slate-200 rounded px-3 py-1 text-sm">
                {isPhrase ? getTranslation('exercise.phrase', language) : getTranslation('exercise.word', language)}
              </span>
              <button
                onClick={() => setShowComposition(true)}
                className="text-slate-500 bg-white hover:text-emerald-600 flex items-center gap-1.5 text-sm font-medium transition-colors border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 rounded px-3 py-1"
              >
                <Search size={16} />
                <span className="hidden sm:inline">{getTranslation('exercise.composition', language)}</span>
              </button>
            </div>

            {/* Mot thaï (Classes mises à jour pour s'adapter et passer à la ligne) */}
            <div className={`${textSizeClass} font-bold font-thai text-slate-900 leading-tight text-center mb-14 break-words w-full px-2`}>
              {wordToDisplay}
            </div>

            {/* Bouton icône son */}
            {exercise.targetLetter && (
              <button
                onClick={() => playThaiTTS(exercise.targetLetter!)}
                className="mx-auto bg-emerald-50 text-emerald-600 p-4 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors mb-2"
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
            )}
          </div>

          {/* Barre de progression verte en bas de la carte */}
          <div className="w-full h-1.5 bg-slate-100 mt-auto flex">
            <div className="h-full bg-emerald-400 w-full rounded-bl-[1rem]"></div>
          </div>
        </m.div>

        {/* Consigne */}
        <h2 className="font-semibold text-center leading-snug max-w-xs p-[29px] text-[25px] bg-[wheat] rounded-[7px] border-b-[5px] border-[#825500] text-[#825500]">
          {displayQuestionNode}
        </h2>
      </div>

      {/* Options — fixées en bas au-dessus du Footer */}
      <div className="mt-auto w-full max-w-md mx-auto lg:pb-[110px] pb-2">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {exercise.options.map((opt: any, index: number) => {
              const isSelected = selected === opt.id;

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
                    className="w-full h-full flex flex-col items-center justify-center relative pb-1 gap-2 text-xl font-semibold"
                    isSelected={isSelected}
                    isSuccess={isChecking ? (opt.id === exercise.answer) : undefined}
                    isError={isWrong && isSelected}
                    disabled={disabled}
                    onClick={() => handleSelect(opt.id)}
                  >
                    <div className="flex items-center justify-center relative pb-1 w-full">
                      <span className="font-thai text-4xl leading-none font-normal w-full block text-center">{opt.th}</span>
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