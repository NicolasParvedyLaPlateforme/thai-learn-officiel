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
        ? "border-emerald-500 border-b-emerald-500 bg-emerald-50 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]" 
        : "border-rose-300 bg-rose-50 text-rose-500";
    }

    if (isChecking && exercise.answer === val) {
       return "border-emerald-500 border-b-emerald-500 bg-emerald-50 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]";
    }
    
    if (isSelected) {
      return "border-indigo-500 border-b-indigo-500 bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]";
    }
    
    return "border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm";
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
            "relative p-6 rounded-2xl border-2 border-b-4 transition-all duration-200 flex flex-col items-center justify-center gap-3",
            "hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2",
            getButtonClass('true')
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            selected === 'true' && !isChecking ? "bg-indigo-100 text-indigo-600" :
            isChecking && exercise.answer === 'true' ? "bg-emerald-100 text-emerald-600" :
            isChecking && selected === 'true' && exercise.answer !== 'true' ? "bg-rose-100 text-rose-600" :
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
            "relative p-6 rounded-2xl border-2 border-b-4 transition-all duration-200 flex flex-col items-center justify-center gap-3",
            "hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2",
            getButtonClass('false')
          )}
        >
          <div className={cn(
            "p-3 rounded-full",
            selected === 'false' && !isChecking ? "bg-indigo-100 text-indigo-600" :
            isChecking && exercise.answer === 'false' ? "bg-emerald-100 text-emerald-600" :
            isChecking && selected === 'false' && exercise.answer !== 'false' ? "bg-rose-100 text-rose-600" :
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
