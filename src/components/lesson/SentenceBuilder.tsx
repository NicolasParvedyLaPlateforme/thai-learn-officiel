import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { Exercise } from "@/types";
import { playThaiTTS } from "@/lib/tts";
import { THAI_ALPHABET } from "@/data/alphabet-data";
import React, { useState } from 'react';
import { HelpCircle, Volume2 } from 'lucide-react';
import { useProgressStore } from "@/lib/store";
import { WordTile } from "@/components/ui/WordTile";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "../ui";
import { cn } from "@/lib/utils";

interface Props {
  exercise: Exercise;
  selected: string[];
  onChange: (val: string[]) => void;
  disabled: boolean;
  onAutoCheck?: (val?: string[]) => void;
}

export default React.memo(function SentenceBuilder({ exercise, selected, onChange, disabled, onAutoCheck }: Props) {
  const language = useProgressStore(state => state.language);
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
      <div className={`min-h-[120px] border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm rounded-3xl py-4 px-2 flex flex-col gap-2 items-center justify-center relative mb-10`}>
        <div className="flex flex-wrap gap-2 items-center justify-center min-h-[64px] sm:min-h-[80px]">
          {selected.length === 0 && !exercise.isFillInBlank && (
            <span className="text-slate-400 p-2 font-medium">{getTranslation('auto.build_the_sentence_here', language)}</span>
          )}
          {(() => {
            const items = [];
            if (exercise.isFillInBlank && exercise.correctComponents && exercise.blankIndex !== undefined) {
              for (let i = 0; i < exercise.correctComponents.length; i++) {
                if (exercise.correctComponents[i] === 'w_dots') {
                  items.push(<WordTile key={`fixed-${i}`} variant="dots" />);
                  continue;
                }

                if (i === exercise.blankIndex) {
                  if (selected.length > 0) {
                    const word = selected[0];
                    const expectedWordId = exercise.correctComponents[i];
                    const expectedWord = exercise.options.find(o => o.id === expectedWordId)?.th;
                    const isCorrect = word === expectedWord;
                    const showColors = exercise.hideColors ? disabled : (exercise.blindMode ? disabled : true);
                    const status = showColors ? (isCorrect ? 'correct' : 'incorrect') : 'default';

                    items.push(
                      <WordTile
                        key={`sel-${i}`}
                        text={word}
                        onClick={() => handleRemove(0)}
                        disabled={disabled}
                        status={status}
                      />
                    );
                  } else {
                    items.push(<WordTile key={`fixed-${i}`} variant="blank" />);
                  }
                } else {
                  const text = exercise.prefilledComponents ? exercise.prefilledComponents[i] : exercise.correctComponents[i];
                  items.push(<WordTile key={`fixed-${i}`} variant="filled" text={text} />);
                }
              }
            } else if (exercise.correctComponents) {
              let selIdx = 0;
              for (let i = 0; i < exercise.correctComponents.length; i++) {
                if (exercise.correctComponents[i] === 'w_dots') {
                  items.push(<WordTile key={`fixed-${i}`} variant="dots" />);
                } else if (selIdx < selected.length) {
                  const word = selected[selIdx];
                  const expectedWordId = exercise.correctComponents[i];
                  const expectedWord = exercise.options.find(o => o.id === expectedWordId)?.th;
                  const isCorrect = word === expectedWord;
                  const showColors = exercise.hideColors ? disabled : (exercise.blindMode ? disabled : true);
                  const status = showColors ? (isCorrect ? 'correct' : 'incorrect') : 'default';
                  const removeIdx = selIdx;

                  items.push(
                    <WordTile
                      key={`sel-${i}`}
                      text={word}
                      onClick={() => handleRemove(removeIdx)}
                      disabled={disabled}
                      status={status}
                    />
                  );
                  selIdx++;
                }
              }
              // Anything over the expected non-dots items goes here
              while (selIdx < selected.length) {
                const word = selected[selIdx];
                const removeIdx = selIdx;
                items.push(
                  <WordTile
                    key={`extra-${selIdx}`}
                    text={word}
                    onClick={() => handleRemove(removeIdx)}
                    disabled={disabled}
                  />
                );
                selIdx++;
              }
            } else {
              // Fallback if no correct components
              selected.forEach((word, idx) => {
                items.push(
                  <WordTile
                    key={`sel-${idx}`}
                    text={word}
                    onClick={() => handleRemove(idx)}
                    disabled={disabled}
                  />
                );
              });
            }
            return items;
          })()}

          {/* Hint System */}
          {/* {!disabled && selected.length < (exercise.correctComponents ? exercise.correctComponents.filter(c => c !== 'w_dots').length : 0) && (
            <div className="relative inline-flex items-center ml-2">
              {showHint ? (
                <div
                  className="bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-xl px-3 py-2 flex flex-col items-center justify-center cursor-pointer shadow-sm animate-pulse-once"
                  onClick={() => playThaiTTS(nextHintLetter)}
                  title={getTranslation('auto.next_character_hint', language)}
                >
                  <span className="font-thai text-xl">{nextHintLetter}</span>
                  <span className="text-xs font-semibold mt-0.5">{nextHintPronunciation}</span>
                </div>
              ) : (
                <IconButton
                  size="md"
                  onClick={() => setShowHint(true)}
                  className="bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  title={getTranslation('auto.show_hint_23', language)}
                >
                  <HelpCircle size={20} />
                </IconButton>
              )}
            </div>
          )} */}
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
          
          let displayText: React.ReactNode = opt.th;
          let isAudioMode = false;
          
          if (exercise.isFillInBlank) {
            if (exercise.fillInBlankMode === 'translation') {
              // Get the translated text instead of Thai
              displayText = getLocalizedField(opt as any, 'fr', language) || opt.th;
            } else if (exercise.fillInBlankMode === 'audio') {
              isAudioMode = true;
            }
          }

          if (isAudioMode) {
            const choiceText = (language === 'en' ? 'Choice ' : 'Choix ') + (idx + 1);
            return (
              <div key={`opt-container-${idx}`} className="flex flex-col items-center gap-3 mx-1">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); playThaiTTS(opt.th); }}
                  disabled={disabled || isUsed}
                  className={`p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm transition-colors flex items-center justify-center ${isUsed ? 'opacity-0 cursor-default' : 'cursor-pointer'}`}
                >
                  <Volume2 size={24} />
                </button>
                <WordTile
                  text={choiceText}
                  onClick={() => handleSelect(opt.th)}
                  disabled={disabled || isUsed}
                  className={isUsed ? '!bg-slate-100 !border-slate-100 !text-transparent !shadow-none ' : 'hover:bg-slate-50 cursor-pointer px-4 sm:px-5 '}
                />
              </div>
            );
          }

          return (
            <WordTile
              key={`opt-${idx}`}
              text={displayText}
              onClick={() => handleSelect(opt.th)}
              disabled={disabled || isUsed}
              // Pour la banque de mots, on écrase les styles quand le mot est déjà utilisé
              className={isUsed ? '!bg-slate-100 !border-slate-100 !text-transparent !shadow-none ' : 'hover:bg-slate-50 cursor-pointer px-4 sm:px-5 '}
            />
          );
        })}
      </div>

    </div>
  );
});