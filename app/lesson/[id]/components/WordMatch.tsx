import { useState, useMemo } from 'react';
import { Exercise } from '../../../types';
import { playThaiTTS } from '../../../lib/tts';
import { formatCombiningChar } from '../../../lib/alphabet-utils';
import { THAI_ALPHABET } from '../../../lib/alphabet-data';
import { Volume2, Image as ImageIcon, Type, Sparkles } from 'lucide-react';

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

function analyzeDifferences(options: string[], answer: string) {
  if (options.length !== 4) return null;
  if (options.some(o => !o || o.length === 0)) return null;

  const minLen = Math.min(...options.map(o => o.length));
  
  let commonPrefixLen = 0;
  while (commonPrefixLen < minLen) {
    const char = options[0][commonPrefixLen];
    if (options.every(o => o[commonPrefixLen] === char)) {
      commonPrefixLen++;
    } else {
      break;
    }
  }

  let commonSuffixLen = 0;
  while (commonSuffixLen < minLen - commonPrefixLen) {
    const char = options[0][options[0].length - 1 - commonSuffixLen];
    if (options.every(o => o[o.length - 1 - commonSuffixLen] === char)) {
      commonSuffixLen++;
    } else {
      break;
    }
  }

  const diffs = options.map(o => o.substring(commonPrefixLen, o.length - commonSuffixLen));
  
  if (diffs.some(d => d.length === 0)) return null;
  const maxDiffLen = Math.max(...diffs.map(d => Array.from(d).length));
  if (maxDiffLen > 3) return null;

  const correctIdx = options.findIndex(o => o === answer);
  if (correctIdx === -1) return null;
  
  const correctDiff = diffs[correctIdx];
  let matchedLetter = null;
  for (const char of Array.from(correctDiff)) {
    matchedLetter = THAI_ALPHABET.find(a => a.letter === char);
    if (matchedLetter) break;
  }

  if (matchedLetter) {
    return {
      matchedLetter,
      commonPrefixLen,
      commonSuffixLen,
      diffs
    };
  }
  return null;
}

export default function WordMatch({ exercise, selected, onChange, disabled, onAutoCheck, isChecking, isCorrect, language = 'fr', onAddMistake }: Props) {
  const isDense = exercise.options.length > 6;
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  const diffAnalysis = useMemo(() => {
    if (exercise.reverse) return null;
    return analyzeDifferences(exercise.options.map(o => o.th), exercise.answer);
  }, [exercise]);

  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [showHint3, setShowHint3] = useState(false);
  const [showColor, setShowColor] = useState(false);

  const handleHintClick = () => {
    let newCount = hintsUsedCount + 1;
    if (newCount === 3 && hintsUsedCount < 3) {
      if (onAddMistake) onAddMistake();
    }
    setHintsUsedCount(newCount);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {diffAnalysis && (
        <div className="w-full max-w-2xl mx-auto mb-4 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col items-center gap-3">
            <div className="text-sm font-bold text-indigo-800 flex items-center gap-2 text-center">
               <Sparkles size={16} />
               {language === 'en' ? 'Only one letter differentiates them!' : 'Une seule lettre les différencie !'}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                <button
                  onClick={() => {
                     if (!showHint1) handleHintClick();
                     setShowHint1(true);
                     playThaiTTS(diffAnalysis.matchedLetter.letter);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 min-h-[36px] ${showHint1 ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                >
                   <Volume2 size={16} /> 
                   <span className="hidden sm:inline">
                      {showHint1 ? (language === 'en' ? 'Replay Sound' : 'Rejouer le son') : (language === 'en' ? 'Hint 1' : 'Indice 1')}
                   </span>
                </button>

                <button
                  onClick={() => {
                     if (!showHint2) handleHintClick();
                     setShowHint2(true);
                   }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 min-h-[36px] ${showHint2 ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                >
                   {!showHint2 && <ImageIcon size={16} />} 
                   {showHint2 ? <span className="text-xl leading-none">{diffAnalysis.matchedLetter.mnemonicEmoji || '?'}</span> : <span className="hidden sm:inline">{language === 'en' ? 'Hint 2' : 'Indice 2'}</span>}
                </button>

                <button
                  onClick={() => {
                     if (!showHint3) handleHintClick();
                     setShowHint3(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 min-h-[36px] ${showHint3 ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                >
                   {!showHint3 && <Type size={16} />} 
                   {showHint3 ? <span>{diffAnalysis.matchedLetter.pronunciation}</span> : <span className="hidden sm:inline">{language === 'en' ? 'Hint 3' : 'Indice 3'}</span>}
                </button>
                
                <button
                  onClick={() => setShowColor(!showColor)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 min-h-[36px] ${showColor ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  title={language === 'en' ? 'Highlight differences' : 'Surligner les différences'}
                >
                   <Sparkles size={16} />
                   <span className="hidden sm:inline">
                      {showColor ? (language === 'en' ? 'Colors ON' : 'Couleurs ON') : (language === 'en' ? 'Reveal Differences' : 'Révéler la différence')}
                   </span>
                </button>
            </div>
            {hintsUsedCount >= 3 && (
               <div className="text-xs font-bold text-rose-500 animate-pulse mt-1 drop-shadow-sm bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                  {language === 'en' ? '-1 Star (3 hints used)' : '-1 Étoile (3 indices utilisés)'}
               </div>
            )}
        </div>
      )}
      <div className="min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
        {localErrors.length > 0 && !(isChecking && isCorrect === false) && (
          <div className="text-rose-500 font-bold animate-pulse text-base sm:text-lg py-0.5 sm:py-1 px-3 sm:px-4 bg-rose-50 rounded-full border border-rose-200 shadow-sm">
            Incorrect
          </div>
        )}
      </div>
      <div className={`grid gap-2 sm:gap-3 ${isDense ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} w-full max-w-2xl mx-auto`}>
        {exercise.options.map((opt) => {
          const isSelected = selected === opt.th;
          const isLocalError = localErrors.includes(opt.th);
          const isFailedState = isChecking && isCorrect === false;
          const isActualAnswer = opt.th === exercise.answer;
          
          let buttonClass = 'bg-white border-slate-200 border-b-4 text-slate-700 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5';
          let textClass = '';
          
          if (isFailedState) {
            if (isActualAnswer) {
              buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-700 border-b-4 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]';
            } else {
              buttonClass = 'bg-rose-50 border-rose-300 text-rose-400 opacity-70 translate-y-0.5 border-b-2';
              textClass = 'line-through decoration-rose-300';
            }
          } else {
            if (isSelected) {
              buttonClass = 'bg-indigo-50 border-indigo-500 text-indigo-700 border-b-2 translate-y-0.5 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]';
            } else if (isLocalError) {
              buttonClass = 'bg-rose-50 border-rose-200 text-rose-300 opacity-50 translate-y-0.5 border-b-2';
              textClass = 'line-through decoration-rose-300';
            }
          }

          const displayValue = exercise.reverse 
            ? (language === 'en' ? ((opt as any).en || (opt as any).fr) : (opt as any).fr) || opt.th
            : (
                (diffAnalysis && showColor) 
                ? (
                   <span className="inline-block whitespace-nowrap">
                     {opt.th.substring(0, diffAnalysis.commonPrefixLen)}
                     <span className="text-fuchsia-600 font-bold bg-fuchsia-100 rounded px-px shadow-sm inline-block">{opt.th.substring(diffAnalysis.commonPrefixLen, opt.th.length - diffAnalysis.commonSuffixLen)}</span>
                     {opt.th.substring(opt.th.length - diffAnalysis.commonSuffixLen)}
                   </span>
                )
                : formatCombiningChar(opt.th)
            );

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!disabled) {
                  if (!exercise.reverse) {
                    playThaiTTS(opt.th);
                  }
                  onChange(opt.th);
                  if (onAutoCheck) {
                    onAutoCheck(opt.th);
                  }
                }
              }}
              disabled={disabled || isLocalError}
              className={`
                relative rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center
                ${isDense ? 'p-2 sm:p-3 min-h-[50px] sm:min-h-[60px]' : 'p-3 sm:p-5 min-h-[60px] sm:min-h-[80px]'}
                ${buttonClass}
                ${disabled && !isSelected && !isLocalError && !isFailedState ? 'opacity-50' : ''}
                ${(disabled || isLocalError) ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="w-full flex items-center justify-center relative">
                 <span className={`${!exercise.reverse ? 'font-thai' : ''} font-semibold sm:font-normal ${
                   exercise.reverse 
                     ? (isDense ? 'text-base sm:text-lg' : 'text-lg sm:text-xl')
                     : (isDense ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl')
                 } ${textClass}`}>{displayValue}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
