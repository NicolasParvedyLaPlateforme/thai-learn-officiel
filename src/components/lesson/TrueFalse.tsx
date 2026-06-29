import { playThaiTTS } from "@/lib/tts";
import { getTranslation } from "@/hooks/useTranslation";
import React from 'react';
import { Exercise } from "@/types";
import { m } from "framer-motion";
import { Check, X, Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";

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

export default React.memo(function TrueFalse({ exercise, selected, onChange, disabled, isChecking, isCorrect, language = 'fr', onAutoCheck }: Props) {
  
  const handleSelect = (val: string) => {
    if (!disabled) {
      onChange(val);
      if (onAutoCheck) {
        onAutoCheck(val);
      }
    }
  };

  const getButtonClass = (val: string) => {
    const isSelected = selected === val;
    
    if (isChecking && isSelected) {
      return isCorrect 
        ? "border-green-500 bg-green-50 text-green-700 shadow-green-100" 
        : "border-red-500 bg-red-50 text-red-700 shadow-red-100";
    }

    if (isChecking && exercise.answer === val) {
       return "border-green-500 bg-green-50 text-green-700 shadow-green-100";
    }
    
    if (isSelected) {
      return "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20";
    }
    
    return "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700 shadow-sm";
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          {getTranslation(exercise.question, language)}
        </h2>
        
        {(exercise.translation || exercise.phonetic) && (
          <div className="flex flex-col items-center gap-1 text-slate-600">
            {exercise.translation && (
              <span className="text-xl font-medium">{exercise.translation}</span>
            )}
            {exercise.phonetic && (
              <span className="text-lg opacity-80">[{exercise.phonetic}]</span>
            )}
          </div>
        )}
      </div>

      {/* Word Display */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] mb-8">
        <m.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white px-12 py-8 rounded-3xl shadow-sm border border-slate-100 text-center relative flex flex-col items-center justify-center gap-4 min-w-[200px]"
        >
          <div className="text-7xl md:text-8xl font-thai text-slate-800 leading-tight">
            {exercise.displayWord || exercise.originalWord || "???"}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playThaiTTS(exercise.originalWord || "");
            }}
            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-full transition-colors"
          >
            <Volume2 size={32} strokeWidth={2.5} />
          </button>
        </m.div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
        <button
          onClick={() => handleSelect('true')}
          disabled={disabled}
          className={cn(
            "relative p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3",
            "active:scale-[0.98]",
            getButtonClass('true')
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            selected === 'true' && !isChecking ? "bg-blue-100 text-blue-600" :
            isChecking && exercise.answer === 'true' ? "bg-green-100 text-green-600" :
            isChecking && selected === 'true' && exercise.answer !== 'true' ? "bg-red-100 text-red-600" :
            "bg-slate-100 text-slate-400"
          )}>
            <Check size={32} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold">
             {language === 'fr' ? 'Vrai' : language === 'en' ? 'True' : language === 'es' ? 'Verdadero' : language === 'de' ? 'Wahr' : 'Vero'}
          </span>
        </button>

        <button
          onClick={() => handleSelect('false')}
          disabled={disabled}
          className={cn(
            "relative p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3",
            "active:scale-[0.98]",
            getButtonClass('false')
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            selected === 'false' && !isChecking ? "bg-blue-100 text-blue-600" :
            isChecking && exercise.answer === 'false' ? "bg-green-100 text-green-600" :
            isChecking && selected === 'false' && exercise.answer !== 'false' ? "bg-red-100 text-red-600" :
            "bg-slate-100 text-slate-400"
          )}>
            <X size={32} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold">
            {language === 'fr' ? 'Faux' : language === 'en' ? 'False' : language === 'es' ? 'Falso' : language === 'de' ? 'Falsch' : 'Falso'}
          </span>
        </button>
      </div>
    </div>
  );
});
