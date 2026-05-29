import { useState, useRef, useEffect } from 'react';
import { Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Word, Phrase } from '../types';
import { playThaiTTS } from '../lib/tts';
import { ColoredPhonetic } from './ColoredPhonetic';
import { useProgressStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

// A simple component to render tooltips with tap support for mobile
export function TooltipHint({ children, tooltipContent, className = '', audioText, tooltipPosition = 'top' }: { children: React.ReactNode, tooltipContent: React.ReactNode, className?: string, audioText?: string, tooltipPosition?: 'top' | 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<'center' | 'left' | 'right'>('center');

  const onOpen = () => {
    setIsOpen(true);
    if (audioText) {
      playThaiTTS(audioText);
    }
  };

  const handleTap = () => {
    onOpen();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isOpen || !spanRef.current) return;

    if (window.innerWidth >= 768) {
      timer = setTimeout(() => setPosition('center'), 0);
      return;
    }

    const rect = spanRef.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const threshold = window.innerWidth * 0.4;

    timer = setTimeout(() => {
      if (center < threshold) {
        setPosition('left');
      } else if (center > window.innerWidth - threshold) {
        setPosition('right');
      } else {
        setPosition('center');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <span 
      ref={spanRef}
      className={`relative cursor-help ${className}`} 
      onClick={handleTap}
      onMouseEnter={onOpen}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <div 
          className={`absolute ${tooltipPosition === 'top' ? 'bottom-full mb-1' : 'top-full -mt-4'} bg-white text-slate-800 px-3 py-2 rounded-xl text-sm whitespace-nowrap z-[120] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200
            ${position === 'left' ? 'left-0' : position === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
          `}
        >
          <div className="relative z-10 flex items-center gap-2">
            {tooltipContent}
          </div>
          <div 
            className={`absolute ${tooltipPosition === 'top' ? 'top-[100%] border-b border-r' : 'bottom-[100%] border-t border-l'} w-3 h-3 ${tooltipPosition === 'top' ? '-mt-1.5' : '-mb-1.5'} bg-white border-slate-200 rotate-45 rounded-sm z-0
             ${position === 'left' ? 'left-6' : position === 'right' ? 'right-6' : 'left-1/2 -translate-x-1/2'}
            `}
          ></div>
        </div>
      )}
    </span>
  );
}

// A simple component to render the french question with tooltips (hints)
export function SentenceWithHints({text, dictionary, phrases, isSentence, exerciseOptions, hideHints, disableTooltips, hideColors, alwaysShowPhonetic, answerTh, correctComponents, charHintRegex, isChecking, forceHideRomanization, currentThaiWordForAudio, isReverse, rightElement}: {text: string, dictionary: Word[], phrases: Phrase[], isSentence: boolean, exerciseOptions: Word[], hideHints?: boolean, disableTooltips?: boolean, hideColors?: boolean, alwaysShowPhonetic?: boolean, answerTh?: string, correctComponents?: string[], charHintRegex?: RegExp, isChecking?: boolean, forceHideRomanization?: boolean, currentThaiWordForAudio?: string, isReverse?: boolean, rightElement?: React.ReactNode}) {
  const { language, showRomanization } = useProgressStore();
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
         const translatedWord = language === 'en' ? (currentDictWord.en || currentDictWord.fr) : currentDictWord.fr;
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
    <span className={`flex flex-wrap justify-center md:justify-start items-center gap-x-2 gap-y-6 leading-relaxed font-medium pt-2 pb-6 relative ${isReverse ? 'text-3xl md:text-5xl text-slate-700' : 'text-xl md:text-2xl'}`}>
      {exactMatch ? (
        shouldShowPhonetic ? (
          <span className="inline-flex flex-col items-center justify-center text-center relative group">
            {innerText}
            <span className="text-sm md:text-base font-medium tracking-wide mt-1 text-center w-full">[<ColoredPhonetic phonetic={exactMatch.phonetic} charHintRegex={charHintRegex} hideColors={hideColors} />]</span>
          </span>
        ) : (
          innerText
        )
      ) : (
        innerText
      )}
      {rightElement && <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 inline-flex items-center shrink-0">{rightElement}</span>}
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

  return (
    <div className="flex flex-col-reverse md:flex-col gap-4 md:gap-8 relative items-center w-full">
      {tooltipTranslation && !disableTooltips ? (
        <TooltipHint 
          className="inline-block relative z-[100]"
          tooltipPosition="bottom"
          tooltipContent={
            <>
              <span className="font-thai text-lg font-bold text-slate-800">{tooltipTranslation}</span>
              {phonetic && (!forceHideRomanization && showRomanization || isChecking) && <span className="text-slate-500 text-xs ml-2">(<ColoredPhonetic phonetic={phonetic} charHintRegex={charHintRegex} hideColors={hideColors} />)</span>}
            </>
          }
          audioText={tooltipTranslation}
        >
          {mainContent}
        </TooltipHint>
      ) : (
        mainContent
      )}

      {!hideHints && isSentence && (
        <div className="w-full relative flex flex-col items-center z-[110]">
          <button 
            onClick={() => setIsVocabOpen(!isVocabOpen)}
            className="flex flex-row items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border-2 border-slate-200 focus:outline-none shrink-0"
          >
            {language === 'en' ? '💡 Useful vocabulary' : '💡 Vocabulaire utile'}
            {isVocabOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {isVocabOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-10 w-[90vw] max-w-sm sm:max-w-md md:max-w-xl text-sm text-slate-500 bg-white/95 backdrop-blur-md p-4 rounded-xl border-2 border-slate-200 shadow-xl z-[110]"
              >
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
                  {exerciseOptions.map((w, i) => (
                    <TooltipHint 
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      tooltipContent={
                        (!forceHideRomanization && showRomanization || isChecking) ? (
                          <><span className="text-slate-500 font-medium">{language === 'en' ? 'Pronunciation:' : 'Prononciation :'}</span> <span className="font-bold text-base"><ColoredPhonetic phonetic={w.phonetic} /></span></>
                        ) : (
                          <span className="font-thai text-lg text-slate-800">{w.th}</span>
                        )
                      }
                      audioText={w.th}
                    >
                      <span className="font-thai text-lg md:text-xl text-emerald-600 font-semibold">{w.th}</span> 
                      <span className="text-slate-400">=</span> 
                      <span className="italic">{language === 'en' ? (w.en || w.fr) : w.fr}</span>
                    </TooltipHint>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
