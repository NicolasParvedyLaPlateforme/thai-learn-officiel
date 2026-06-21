import { getTranslation } from "@/hooks/useTranslation";
import React, { useState, useRef, useEffect } from 'react';
import { Exercise } from "@/types";
import { useProgressStore } from "@/lib/store";
import { Keyboard, Delete, Volume2 } from 'lucide-react';
import { playThaiTTS } from "@/lib/tts";

import { formatCombiningChar } from "@/lib/alphabet-utils";
import { Button } from "@/components/ui/Button";

interface Props {
  exercise: Exercise;
  selected: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isChecking?: boolean;
}

export default React.memo(function FreeTypingInput({ exercise, selected, onChange, disabled, isChecking }: Props) {
  const language = useProgressStore(state => state.language);
  const [showVirtual, setShowVirtual] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [vKeys, setVKeys] = useState<string[]>([]);

  useEffect(() => {
    const chars = Array.from(new Set(exercise.answer.replace(/\s+/g, '').split('')));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setVKeys(chars);
  }, [exercise.answer]);

  const handleVKeyClick = (char: string) => {
    onChange(selected + char);
    if (!showVirtual && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackspace = () => {
    if (selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto items-center">
      <div className="relative w-full flex flex-col mb-6">
        <div className="flex gap-3 items-center w-full justify-center">
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={selected}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-full text-center font-thai text-3xl md:text-4xl leading-loose md:leading-loose py-4 px-6 md:py-6 border-2 border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50/50 transition-all text-slate-800 disabled:opacity-50 disabled:bg-slate-50/50"
              placeholder={getTranslation('auto.type_in_thai', language)}
              autoFocus
              dir="ltr"
            />
            <button
              onClick={() => setShowVirtual(!showVirtual)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl transition-all ${showVirtual ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              title={getTranslation('auto.toggle_virtual_keyboard', language)}
            >
              <Keyboard size={24} />
            </button>
          </div>
          {exercise.type === 'writing' && exercise.blindMode && exercise.correctComponents && !isChecking && (
            <button
              className="flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 sm:px-5 sm:py-3.5 rounded-2xl sm:text-sm font-semibold hover:bg-emerald-100 transition-colors flex-shrink-0 self-stretch"
              onClick={() => {
                const selLen = selected.replace(/\s+/g, '').length;
                const fullText = exercise.correctComponents!.join('');
                if (selLen < fullText.length) {
                  const targetStr = fullText.charAt(selLen);
                  playThaiTTS(targetStr);
                } else {
                  playThaiTTS(exercise.answer);
                }
              }}
              title={getTranslation('auto.sound_of_next_letter', language)}
            >
              <Volume2 size={24} strokeWidth={2.5} />
              <span className="font-bold text-lg leading-none">A</span>
            </button>
          )}
        </div>
      </div>

      {showVirtual && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-5 bg-slate-50/80 backdrop-blur-md rounded-3xl w-full border border-slate-100 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
          {vKeys.map((k, i) => {
            const displayStr = formatCombiningChar(k);
            return (
              <button
                key={i}
                onClick={() => handleVKeyClick(k)}
                disabled={disabled}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 shadow-sm rounded-2xl text-2xl sm:text-3xl font-thai text-slate-700 hover:bg-slate-50 hover:border-emerald-200 hover:shadow-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {displayStr}
              </button>
            )
          })}

          <button
            onClick={handleBackspace}
            disabled={disabled || selected.length === 0}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 border border-rose-100 shadow-sm text-rose-500 rounded-2xl hover:bg-rose-100 hover:border-rose-200 hover:shadow-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Delete size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </div>
  );
});
