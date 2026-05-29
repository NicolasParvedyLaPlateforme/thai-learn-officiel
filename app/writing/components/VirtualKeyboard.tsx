import React, { useMemo } from 'react';
import { Exercise } from '../../types';
import { playThaiTTS } from '../../lib/tts';
import { Delete, Volume2 } from 'lucide-react';
import { formatCombiningChar } from '../../lib/alphabet-utils';
import { useProgressStore } from '../../lib/store';

interface Props {
  exercise: Exercise;
  selected: string[];
  onChange: (val: string[]) => void;
  disabled: boolean;
  isChecking?: boolean;
  onAutoCheck?: (val?: string[]) => void;
}

export default function VirtualKeyboard({ exercise, selected, onChange, disabled, isChecking, onAutoCheck }: Props) {
  const { language } = useProgressStore();
  
  const handleSelect = (charTh: string) => {
    if (disabled) return;
    const newSelected = [...selected, charTh];
    onChange(newSelected);
    // Optionally play TTS
    try {
      playThaiTTS(charTh);
    } catch(e) {}
    
    // Auto-check if we reached the required length
    if (exercise.correctComponents && newSelected.length === exercise.correctComponents.length) {
       if (onAutoCheck) {
           onAutoCheck(newSelected);
       }
    }
  };

  const handleBackspace = () => {
    if (disabled || selected.length === 0) return;
    onChange(selected.slice(0, -1));
  };

  const expectedChar = exercise.correctComponents?.[selected.length];

  const isConsonant = (charStr: string) => {
    if (!charStr) return false;
    const code = charStr.charCodeAt(0);
    return code >= 0x0E01 && code <= 0x0E2E;
  };

  // Track used counts to know what's still available in the total pool
  const currentOptions = useMemo(() => {
    if (!expectedChar) return [];

    const available: { idx: number; th: string }[] = [];
    const usedCountsTemp: Record<string, number> = {};
    selected.forEach(s => { usedCountsTemp[s] = (usedCountsTemp[s] || 0) + 1; });
    
    exercise.options.forEach((opt, idx) => {
      if (usedCountsTemp[opt.th] > 0) {
        usedCountsTemp[opt.th]--;
      } else {
        available.push({ idx, th: opt.th });
      }
    });

    const expectedIsConsonant = isConsonant(expectedChar);
    const expectedItems = available.filter(a => a.th === expectedChar);
    const expectedItem = expectedItems[0];
    
    let choices = expectedItem ? [expectedItem] : [];
    const addedTh = new Set<string>();
    if (expectedItem) addedTh.add(expectedItem.th);

    // Try to get 2 distractors (same type first)
    const distractors = available.filter(a => a.idx !== expectedItem?.idx && !addedTh.has(a.th));
    // Sort to prefer same type
    distractors.sort((a, b) => {
      const aSame = isConsonant(a.th) === expectedIsConsonant ? 1 : 0;
      const bSame = isConsonant(b.th) === expectedIsConsonant ? 1 : 0;
      return bSame - aSame;
    });

    for (const d of distractors) {
      if (choices.length >= 3) break;
      if (!addedTh.has(d.th)) {
        choices.push(d);
        addedTh.add(d.th);
      }
    }

    // if still < 3, pick from all options (even if they've been used) to fill
    if (choices.length < 3) {
      const moreDistractors = exercise.options.map((opt, idx) => ({ idx, th: opt.th })).filter(a => !addedTh.has(a.th));
      moreDistractors.sort((a, b) => {
        const aSame = isConsonant(a.th) === expectedIsConsonant ? 1 : 0;
        const bSame = isConsonant(b.th) === expectedIsConsonant ? 1 : 0;
        return bSame - aSame;
      });
      for (const md of moreDistractors) {
        if (choices.length >= 3) break;
        if (!addedTh.has(md.th)) {
           choices.push(md);
           addedTh.add(md.th);
        }
      }
    }

    // Pick top length, then shuffle choices
    return [...choices].sort((a, b) => a.th.localeCompare(b.th));
  }, [selected.length, exercise.id, expectedChar, exercise.options]);

  const isCombining = (charStr: string) => {
    const code = charStr.charCodeAt(0);
    return code === 0x0E31 || (code >= 0x0E34 && code <= 0x0E3A) || (code >= 0x0E47 && code <= 0x0E4E);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Selected area */}
      <div className={`min-h-[100px] border-y-2 border-slate-200 py-4 flex flex-col gap-2`}>
        <div className="flex gap-3 justify-center items-center">
          <div className="bg-white border-2 border-b-4 border-slate-200 rounded-xl px-4 py-2 sm:px-5 sm:py-3 shadow-sm text-3xl sm:text-4xl font-thai leading-relaxed text-center break-all min-w-[180px] min-h-[64px] sm:min-h-[76px] flex justify-center items-center">
            {selected.length === 0 ? (
              <span className="text-slate-400 p-2 font-medium text-base sm:text-lg font-sans">
                {language === 'en' ? 'Choose characters below...' : 'Choisissez des caractères ci-dessous...'}
              </span>
            ) : (
              (() => {
                const clusters: { chars: string, isCorrect: boolean }[] = [];
                selected.forEach((char, idx) => {
                  let isCorrect = true;
                  if (exercise.type === 'writing' && exercise.correctComponents) {
                    isCorrect = char === exercise.correctComponents[idx];
                  }
                  
                  if (clusters.length === 0 || !isCombining(char)) {
                    clusters.push({ chars: char, isCorrect });
                  } else {
                    clusters[clusters.length - 1].chars += char;
                    if (!isCorrect) {
                      clusters[clusters.length - 1].isCorrect = false;
                    }
                  }
                });

                const showColors = exercise.hideColors ? disabled : (exercise.blindMode ? disabled : true);

                return clusters.map((cluster, idx) => {
                  let textColorClass = "text-slate-700";
                  if (showColors) {
                    textColorClass = cluster.isCorrect ? "text-emerald-600" : "text-rose-500";
                  }
                  
                  return (
                    <span key={`sel-cluster-${idx}`} className={textColorClass}>
                      {cluster.chars}
                    </span>
                  );
                });
              })()
            )}
          </div>
          {exercise.type === 'writing' && exercise.blindMode && exercise.correctComponents && !isChecking && (
            <button 
              className="flex items-center justify-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-600 p-3 sm:px-4 sm:py-3 rounded-xl sm:text-sm font-semibold hover:bg-indigo-100 transition-colors"
              onClick={() => {
                if (selected.length < exercise.correctComponents!.length) {
                  playThaiTTS(exercise.correctComponents![selected.length]);
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

      {/* Keyboard area */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2 min-h-[80px] w-full max-w-[360px] sm:max-w-[420px] mx-auto">
        {currentOptions.map((opt) => {
          let displayStr = formatCombiningChar(opt.th);
          
          let btnClass = 'bg-white border-2 border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:translate-y-0.5 active:border-b-2';
          
          return (
            <button
              key={`key-${opt.idx}`}
              onClick={() => handleSelect(opt.th)}
              disabled={disabled}
              className={`
                rounded-xl font-medium font-thai select-none transition-all
                text-4xl sm:text-5xl flex items-center justify-center h-16 sm:h-20
                ${btnClass}
              `}
            >
              <span className="leading-none pt-1">{displayStr}</span>
            </button>
          );
        })}

        {Array.from({ length: 3 - currentOptions.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Backspace Button */}
        <button
          onClick={handleBackspace}
          disabled={disabled || selected.length === 0}
          className={`
            rounded-xl font-medium select-none transition-all
            flex items-center justify-center h-16 sm:h-20
            ${(!disabled && selected.length > 0)
              ? 'bg-slate-200 border-2 border-b-4 border-slate-300 text-slate-700 hover:bg-slate-300 cursor-pointer active:translate-y-0.5 active:border-b-2' 
              : 'bg-slate-100 border-2 border-slate-100 text-slate-300 pointer-events-none'}
          `}
        >
          <Delete size={32} />
        </button>
      </div>
    </div>
  );
}
