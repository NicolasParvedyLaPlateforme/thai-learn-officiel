import { Exercise } from '../../../types';
import { playThaiTTS } from '../../../lib/tts';
import { THAI_ALPHABET } from '../../../lib/alphabet-data';
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useProgressStore } from '../../../lib/store';

interface Props {
  exercise: Exercise;
  selected: string[];
  onChange: (val: string[]) => void;
  disabled: boolean;
  onAutoCheck?: (val?: string[]) => void;
}

export default function SentenceBuilder({ exercise, selected, onChange, disabled, onAutoCheck }: Props) {
  const { language } = useProgressStore();
  const [showHint, setShowHint] = useState(false);
  
  const handleSelect = (wordTh: string) => {
    if (disabled) return;
    const newSelected = [...selected, wordTh];
    onChange(newSelected);
    playThaiTTS(wordTh);
    setShowHint(false); // Hide hint once they make a choice

    // Auto-check logic
    if (exercise.correctComponents) {
        if (exercise.isFillInBlank) {
           if (newSelected.length === 1 && onAutoCheck) {
               onAutoCheck(newSelected);
           }
        } else {
           const expectedCount = exercise.correctComponents.filter(c => c !== 'w_dots').length;
           if (newSelected.length === expectedCount) {
                if (onAutoCheck) {
                    onAutoCheck(newSelected);
                }
           }
        }
    }
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    const newSelected = [...selected];
    newSelected.splice(index, 1);
    onChange(newSelected);
    setShowHint(false);
  };

  const isDense = exercise.options.length > 7;

  const usedCounts: Record<string, number> = {};
  selected.forEach(s => {
    usedCounts[s] = (usedCounts[s] || 0) + 1;
  });

  // Calculate hint for the NEXT expected word
  let nextHintLetter = '';
  let nextHintPronunciation = '';
  if (exercise.correctComponents) {
    let targetIdx = 0;
    let nonDotsCount = 0;
    while (targetIdx < exercise.correctComponents.length) {
      if (exercise.correctComponents[targetIdx] !== 'w_dots') {
        if (nonDotsCount === selected.length) break;
        nonDotsCount++;
      }
      targetIdx++;
    }

    if (targetIdx < exercise.correctComponents.length) {
      const expectedWordId = exercise.correctComponents[targetIdx];
      const expectedWord = exercise.options.find(o => o.id === expectedWordId)?.th;
      if (expectedWord && expectedWord.length > 0) {
        const firstChar = expectedWord[0];
        const alphaInfo = THAI_ALPHABET.find(a => a.letter === firstChar);
        if (alphaInfo) {
          nextHintLetter = alphaInfo.letter;
          nextHintPronunciation = language === 'en' ? (alphaInfo.exampleTranslationEn || alphaInfo.exampleTranslation) : alphaInfo.exampleTranslation;
          nextHintPronunciation = alphaInfo.exampleWord; // e.g. "ศ ศาลา"
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      
      {/* Target area (Answer) */}
      <div className={`min-h-[120px] border-y-2 border-slate-200 py-4 flex flex-col gap-2 items-center justify-center relative`}>
        <div className="flex flex-wrap gap-2 items-center justify-center min-h-[64px] sm:min-h-[80px]">
          {selected.length === 0 && !exercise.isFillInBlank && (
            <span className="text-slate-400 p-2 font-medium">{language === 'en' ? 'Build the sentence here...' : 'Formez la phrase ici...'}</span>
          )}
          {(() => {
            const items = [];
            if (exercise.isFillInBlank && exercise.correctComponents && exercise.blankIndex !== undefined) {
               for (let i = 0; i < exercise.correctComponents.length; i++) {
                   if (exercise.correctComponents[i] === 'w_dots') continue;

                   if (i === exercise.blankIndex) {
                       if (selected.length > 0) {
                           const word = selected[0];
                           const expectedWordId = exercise.correctComponents[i];
                           const expectedWord = exercise.options.find(o => o.id === expectedWordId)?.th;
                           const isCorrect = word === expectedWord;
                           const showColors = exercise.hideColors ? disabled : (exercise.blindMode ? disabled : true);

                           let textColorClass = "text-slate-700";
                           let borderColorClass = "border-slate-200";
                           if (showColors) {
                             textColorClass = isCorrect ? "text-emerald-600" : "text-rose-500";
                             borderColorClass = isCorrect ? "border-slate-200" : "border-rose-300";
                           }

                           items.push(
                             <button
                               key={`sel-${i}`}
                               onClick={() => handleRemove(0)}
                               disabled={disabled}
                               className={`bg-white text-center border-2 border-b-4 rounded-xl font-medium ${textColorClass} ${borderColorClass} shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16`}
                             >
                               <span className="leading-none text-2xl sm:text-3xl">{word}</span>
                             </button>
                           );
                       } else {
                           items.push(
                              <div key={`fixed-${i}`} className="bg-transparent border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-medium px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16">
                                <span className="leading-none text-xl sm:text-2xl opacity-50 font-sans">___</span>
                              </div>
                           );
                       }
                   } else {
                       const text = exercise.prefilledComponents ? exercise.prefilledComponents[i] : exercise.correctComponents[i];
                       items.push(
                           <div key={`fixed-${i}`} className="bg-slate-100 text-slate-500 text-center border-2 border-slate-200 rounded-xl font-medium font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16 pointer-events-none">
                             <span className="leading-none text-2xl sm:text-3xl">{text}</span>
                           </div>
                       );
                   }
               }
            } else if (exercise.correctComponents) {
              let selIdx = 0;
              for (let i = 0; i < exercise.correctComponents.length; i++) {
                if (exercise.correctComponents[i] === 'w_dots') {
                  items.push(
                    <div key={`fixed-${i}`} className="bg-transparent border-2 border-dashed border-slate-300 text-slate-400 rounded-xl font-medium font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16">
                      <span className="leading-none text-2xl sm:text-3xl">...</span>
                    </div>
                  );
                } else if (selIdx < selected.length) {
                  const word = selected[selIdx];
                  const expectedWordId = exercise.correctComponents[i];
                  const expectedWord = exercise.options.find(o => o.id === expectedWordId)?.th;
                  const isCorrect = word === expectedWord;
                  const showColors = exercise.hideColors ? disabled : (exercise.blindMode ? disabled : true);
                  
                  let textColorClass = "text-slate-700";
                  let borderColorClass = "border-slate-200";
                  if (showColors) {
                    textColorClass = isCorrect ? "text-emerald-600" : "text-rose-500";
                    borderColorClass = isCorrect ? "border-slate-200" : "border-rose-300";
                  }
                  
                  const removeIdx = selIdx;
                  items.push(
                    <button
                      key={`sel-${i}`}
                      onClick={() => handleRemove(removeIdx)}
                      disabled={disabled}
                      className={`bg-white text-center border-2 border-b-4 rounded-xl font-medium ${textColorClass} ${borderColorClass} shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16`}
                    >
                      <span className="leading-none text-2xl sm:text-3xl">{word}</span>
                    </button>
                  );
                  selIdx++;
                }
              }
              // Anything over the expected non-dots items goes here
              while (selIdx < selected.length) {
                const word = selected[selIdx];
                const removeIdx = selIdx;
                items.push(
                   <button
                    key={`extra-${selIdx}`}
                    onClick={() => handleRemove(removeIdx)}
                    disabled={disabled}
                    className={`bg-white text-center border-2 border-b-4 rounded-xl font-medium text-slate-700 border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16`}
                  >
                    <span className="leading-none text-2xl sm:text-3xl">{word}</span>
                   </button>
                );
                selIdx++;
              }
            } else {
               // Fallback if no correct components
               selected.forEach((word, idx) => {
                 items.push(
                    <button
                      key={`sel-${idx}`}
                      onClick={() => handleRemove(idx)}
                      disabled={disabled}
                      className={`bg-white text-center border-2 border-b-4 rounded-xl font-medium text-slate-700 border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 font-thai px-2 sm:px-3 flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16`}
                    >
                      <span className="leading-none text-2xl sm:text-3xl">{word}</span>
                    </button>
                 );
               });
            }
            return items;
          })()}
          
          {/* Hint System */}
          {!disabled && selected.length < (exercise.correctComponents ? exercise.correctComponents.filter(c => c !== 'w_dots').length : 0) && (
            <div className="relative inline-flex items-center ml-2">
              {showHint ? (
                <div 
                  className="bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-xl px-3 py-2 flex flex-col items-center justify-center cursor-pointer shadow-sm animate-pulse-once"
                  onClick={() => playThaiTTS(nextHintLetter)}
                  title={language === 'en' ? 'Next character hint' : 'Indice de la prochaine lettre'}
                >
                   <span className="font-thai text-xl">{nextHintLetter}</span>
                   <span className="text-xs font-semibold mt-0.5">{nextHintPronunciation}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors"
                  title={language === 'en' ? 'Show hint' : 'Afficher un indice'}
                >
                  <HelpCircle size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap justify-center gap-2 -mt-2 sm:mt-2">
        {exercise.options.map((opt, idx) => {
          let isUsed = false;
          if (usedCounts[opt.th] > 0) {
            isUsed = true;
            usedCounts[opt.th]--;
          }
          return (
            <button
              key={`opt-${idx}`}
              onClick={() => handleSelect(opt.th)}
              disabled={disabled || isUsed}
              className={`
                rounded-xl text-center font-medium font-thai select-none transition-all flex items-center justify-center px-4 sm:px-5 min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16
                ${!isUsed 
                  ? 'bg-white border-2 border-b-4 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:translate-y-0.5 active:border-b-2' 
                  : 'bg-slate-100 border-2 border-slate-100 text-transparent pointer-events-none'}
              `}
            >
              <span className="leading-none text-xl sm:text-2xl">{opt.th}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
