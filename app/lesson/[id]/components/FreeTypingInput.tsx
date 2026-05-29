import { useState, useRef, useEffect } from 'react';
import { Exercise } from '../../../types';
import { useProgressStore } from '../../../lib/store';
import { Keyboard, Delete, Volume2, ArrowUp } from 'lucide-react';
import { playThaiTTS } from '../../../lib/tts';

import { formatCombiningChar } from '../../../lib/alphabet-utils';

interface Props {
  exercise: Exercise;
  selected: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isChecking?: boolean;
}

export default function FreeTypingInput({ exercise, selected, onChange, disabled, isChecking }: Props) {
  const { language } = useProgressStore();
  const [showVirtual, setShowVirtual] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate virtual keyboard letters from answer if needed
  const [vKeys, setVKeys] = useState<string[]>([]);

  useEffect(() => {
    // Collect all unique characters from the answer + some distractors if we want,
    // or just the answer characters shuffled.
    const chars = Array.from(new Set(exercise.answer.replace(/\s+/g, '').split('')));
    // Shuffle them
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
              className="w-full text-center font-thai text-3xl md:text-4xl py-4 px-6 md:py-6 border-4 border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800 disabled:opacity-50 disabled:bg-slate-50"
              placeholder={language === 'en' ? "Type in Thai..." : "Tapez en Thaï..."}
              autoFocus
              dir="ltr"
            />
            <button 
              onClick={() => setShowVirtual(!showVirtual)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2 rounded-lg transition-all ${showVirtual ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
              title={language === 'en' ? "Toggle Virtual Keyboard" : "Basculer le clavier virtuel"}
            >
              <Keyboard size={24} />
            </button>
          </div>
          {exercise.type === 'writing' && exercise.blindMode && exercise.correctComponents && !isChecking && (
            <button 
              className="flex items-center justify-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-600 p-3 sm:px-4 sm:py-3 rounded-xl sm:text-sm font-semibold hover:bg-indigo-100 transition-colors flex-shrink-0 self-stretch"
              onClick={() => {
                const selLen = selected.replace(/\s+/g, '').length;
                const fullText = exercise.correctComponents!.join('');
                if (selLen < fullText.length) {
                  // We can't perfectly map to components since FreeTyping is unconstrained, but we can try 
                  // just using the fullText string length
                  const targetStr = fullText.charAt(selLen);
                  playThaiTTS(targetStr);
                } else {
                  playThaiTTS(exercise.answer);
                }
              }}
              title={language === 'en' ? 'Sound of next letter' : 'Son de la prochaine lettre'}
            >
              <Volume2 size={24} strokeWidth={2.5} />
              <span className="font-bold text-lg leading-none">A</span>
            </button>
          )}
        </div>
      </div>

      {showVirtual && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-4 bg-slate-100 rounded-2xl w-full border-2 border-slate-200 animate-in fade-in slide-in-from-bottom-4">
          {vKeys.map((k, i) => {
            const displayStr = formatCombiningChar(k);
            return (
              <button
                key={i}
                onClick={() => handleVKeyClick(k)}
                disabled={disabled}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-b-[4px] border-slate-200 rounded-xl text-2xl sm:text-3xl font-thai text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {displayStr}
              </button>
            )
          })}
          
          <button
            onClick={handleBackspace}
            disabled={disabled || selected.length === 0}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 border-2 border-b-[4px] border-rose-200 text-rose-500 rounded-xl hover:bg-rose-100 hover:border-rose-300 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Delete size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
