import React from 'react';
import { m } from "framer-motion";
import { Volume2 } from 'lucide-react';
import { playThaiTTS } from "@/lib/tts";
import { getTranslation } from "@/hooks/useTranslation";
import { Exercise } from "@/types";
import { cn } from "@/lib/utils"; // Assure-toi que le chemin d'import est correct
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

  // Utilisation des variantes de ton composant Button
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

      {/* Header : Question et traductions */}
      <div className="mb-10 text-center flex flex-col items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          {getTranslation(exercise.question, language)}
        </h2>

        {(exercise.translation || exercise.phonetic) && (
          <div className="flex flex-col items-center gap-1 mt-2 text-slate-600">
            {exercise.translation && (
              <span className="text-xl font-medium">{exercise.translation}</span>
            )}
            {exercise.phonetic && (
              <span className="text-lg opacity-80">[{exercise.phonetic}]</span>
            )}
          </div>
        )}
      </div>

      {/* Word Display : Carte centrale */}
      <div className="flex-1 flex flex-col items-center justify-center mb-12">
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-12 py-10 rounded-3xl shadow-sm border border-slate-100 text-center relative flex flex-col items-center justify-center gap-6 min-w-[240px] md:min-w-[320px]"
        >
          <div className="text-7xl md:text-8xl font-thai text-slate-800 leading-tight">
            {exercise.displayWord || exercise.originalWord || "???"}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playThaiTTS(exercise.originalWord || "");
            }}
            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-3 rounded-full transition-colors flex items-center justify-center"
            aria-label="Écouter la prononciation"
          >
            <Volume2 size={32} strokeWidth={2.5} />
          </button>
        </m.div>
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
          {language === 'fr' ? 'Vrai' : language === 'en' ? 'True' : language === 'es' ? 'Verdadero' : language === 'de' ? 'Wahr' : 'Vero'}
        </Button>

        <Button
          variant={getButtonVariant('false')}
          size="lg"
          onClick={() => handleSelect('false')}
          disabled={disabled}
          className="w-full text-lg"
        >
          {language === 'fr' ? 'Faux' : language === 'en' ? 'False' : language === 'es' ? 'Falso' : language === 'de' ? 'Falsch' : 'Falso'}
        </Button>
      </div>

    </div>
  );
});