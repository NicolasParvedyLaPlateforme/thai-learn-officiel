import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useState } from 'react';
import { Volume2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { Word, Phrase } from "@/types/index";
import { playThaiTTS } from "@/lib/tts";
import { ColoredPhonetic } from './ColoredPhonetic';
import { useProgressStore } from "@/lib/store";
import { m as motion, AnimatePresence } from "framer-motion";
import { TooltipHint } from '../ui/TooltipHint';

// A simple component to render the french question with tooltips (hints)
export function SentenceWithHints({ text, dictionary, phrases, isSentence, exerciseOptions, hideHints, disableTooltips, hideColors, alwaysShowPhonetic, answerTh, correctComponents, charHintRegex, isChecking, forceHideRomanization, currentThaiWordForAudio, isReverse, rightElement }: { text: string, dictionary: Word[], phrases: Phrase[], isSentence: boolean, exerciseOptions: Word[], hideHints?: boolean, disableTooltips?: boolean, hideColors?: boolean, alwaysShowPhonetic?: boolean, answerTh?: string, correctComponents?: string[], charHintRegex?: RegExp, isChecking?: boolean, forceHideRomanization?: boolean, currentThaiWordForAudio?: string, isReverse?: boolean, rightElement?: React.ReactNode }) {
  const { language, showRomanization, setToneAnalyzerModalWord } = useProgressStore();
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  // Try to match the ENTIRE phrase/word first
  const exactPhrase = phrases.find(p => p.fr.toLowerCase() === text.toLowerCase() || (p.en?.toLowerCase() === text.toLowerCase()));
  const exactWord = dictionary.find(w => w.fr.toLowerCase() === text.toLowerCase() || (w.en?.toLowerCase() === text.toLowerCase()));
  const exactMatch = exactPhrase || exactWord;

  const tooltipTranslation = answerTh || exactMatch?.th;
  const phonetic = exactMatch?.phonetic;

  const getDottedClass = () => {
    return disableTooltips ? "" : "border-b-2 border-dotted border-slate-300";
  };

  const shouldShowPhonetic = isChecking || (alwaysShowPhonetic && showRomanization && !forceHideRomanization);

  let highlightedText: React.ReactNode = text;
  let wordHighlighted = false;

  if (currentThaiWordForAudio) {
    // find the dictionary entry
    const currentDictWord = [...dictionary, ...phrases, ...exerciseOptions].find(w => w.th === currentThaiWordForAudio);
    if (currentDictWord) {
      // the mapping word to highlight:
      const translatedWord = getLocalizedField(currentDictWord, '', language);
      if (translatedWord) {
        // 1. Try exact match
        // 2. Try split by slashes (e.g. "bien / à l'aise")
        // 3. Try individual words > 3 chars (e.g. "particule femme" -> "femme")
        const searchPhrases = [
          translatedWord,
          ...translatedWord.split('/').map(s => s.trim()),
          ...translatedWord.split(/[\s/]+/).filter(s => s.length > 3)
        ];

        for (const searchPhrase of searchPhrases) {
          if (!searchPhrase) continue;

          const escapedWord = searchPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const isLetterStart = /^\\w/i.test(searchPhrase);
          const isLetterEnd = /\\w$/i.test(searchPhrase);

          const prefix = isLetterStart ? `\\b` : ``;
          const suffix = isLetterEnd ? `\\b` : ``;

          const regex = new RegExp(`(${prefix}${escapedWord}${suffix})`, 'i');
          const parts = text.split(regex);

          if (parts.length > 1) { // found it
            highlightedText = parts.map((part, i) => {
              if (part.toLowerCase() === searchPhrase.toLowerCase()) {
                wordHighlighted = true;
                return (
                  <span key={i} className="relative inline-block border-b-[3px] border-sky-400 text-sky-600 z-20 pb-0.5 font-bold">
                    {part}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-sky-200 -mb-[1px] z-10" />
                      <button onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playThaiTTS(currentThaiWordForAudio);
                      }} className="bg-sky-50 border-2 border-sky-200 text-sky-600 p-1.5 rounded-full shadow-sm hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all outline-none">
                        <Volume2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </span>
                );
              }
              return part;
            });
            break; // Stop searching once we found a match
          }
        }
      }
    }
  }

  // Create the main text content, always wrapping it in a TooltipHint if we have the translation
  const innerText = (
    <span className={`inline-block ${getDottedClass()} ${isReverse ? 'font-thai text-3xl md:text-5xl mb-2' : ''}`}>
      {highlightedText}
    </span>
  );

  const mainContent = (
    <span className={`flex flex-wrap justify-center md:justify-start items-center gap-x-2 gap-y-6 leading-tight font-normal tracking-tight pt-2 pb-6 relative ${isReverse ? 'text-4xl md:text-6xl text-slate-800 font-[Comic Sans MS] ' : 'text-4xl md:text-5xl text-slate-800 font-[Comic Sans MS]'}`}>
      {exactMatch ? (
        shouldShowPhonetic ? (
          <span className="inline-flex flex-col items-center justify-center text-center relative group font-[Comic Sans MS]">
            {innerText}
            <span className="text-sm md:text-base font-medium tracking-wide mt-1 text-center w-full font-[Comic Sans MS]">[<ColoredPhonetic phonetic={exactMatch.phonetic} charHintRegex={charHintRegex} hideColors={hideColors} />]</span>
          </span>
        ) : (
          innerText
        )
      ) : (
        innerText
      )}
      {currentThaiWordForAudio && !wordHighlighted && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-2 flex flex-col items-center z-10">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-sky-200 -mb-[1px] z-10" />
          <button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            playThaiTTS(currentThaiWordForAudio);
          }} className="bg-sky-50 border-2 border-sky-200 text-sky-600 p-1.5 rounded-full shadow-sm hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all outline-none">
            <Volume2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </span>
  );

  const tooltipWrappedContent = tooltipTranslation && !disableTooltips ? (
    <TooltipHint
      className="inline-block relative z-[100]"
      tooltipPosition="bottom"
      tooltipContent={
        <>
          <span className="font-thai text-lg font-bold text-slate-800 mr-1">{tooltipTranslation}</span>
          <button onClick={(e) => { e.stopPropagation(); setToneAnalyzerModalWord(tooltipTranslation); }} className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mx-1" title={language === 'en' ? 'Analyze Tone' : 'Analyser le Ton'}>
            <Wand2 size={16} />
          </button>
          {phonetic && (!forceHideRomanization && showRomanization || isChecking) && <span className="text-slate-500 text-xs ml-1">(<ColoredPhonetic phonetic={phonetic} charHintRegex={charHintRegex} hideColors={hideColors} />)</span>}
        </>
      }
      audioText={tooltipTranslation}
    >
      {mainContent}
    </TooltipHint>
  ) : (
    mainContent
  );

  return (
    <div className="flex flex-col-reverse md:flex-col gap-4 md:gap-8 relative items-center w-full">
      <div className="relative inline-flex items-center">
        {tooltipWrappedContent}
        {rightElement && (
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 inline-flex items-center shrink-0">
            {rightElement}
          </span>
        )}
      </div>

    </div>
  );
}
