'use client';

import { getTranslation } from "@/hooks/useTranslation";
import React, { useState, useEffect } from 'react';
import { useProgressStore } from "@/lib/store";
import { analyzeSyllable, ToneAnalysis } from "@/lib/toneAnalyzer";
import { Search, ArrowLeft, Wand2, Info, Volume2, Scissors, X } from 'lucide-react';
import Link from 'next/link';
import { playThaiTTS } from "@/lib/tts";
import { AnimatePresence, m as motion } from 'motion/react';
import { getPredefinedSyllables } from "@/lib/vocabulary-utils";

export interface ToneAnalyzerContentProps {
  initialWord?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export function ToneAnalyzerContent({ initialWord = '', isModal = false, onClose }: ToneAnalyzerContentProps) {
  const { language } = useProgressStore();
  
  const [input, setInput] = useState(initialWord);
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);

  const [mode, setMode] = useState<'search' | 'guided'>(initialWord ? 'guided' : 'search');
  const [targetWord, setTargetWord] = useState(initialWord);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [manualBoundaries, setManualBoundaries] = useState<number[]>([]);

  const [predefinedSyllables, setPredefinedSyllables] = useState<string[] | null>(null);
  const [activePredefinedIndex, setActivePredefinedIndex] = useState(-1);

  const [showMobileExplanation, setShowMobileExplanation] = useState(false);

  // Reset manual boundaries when target word changes
  useEffect(() => {
    setManualBoundaries([]);
    if (targetWord) {
      const bounds = getPredefinedSyllables(targetWord);
      if (bounds && bounds.length > 0) {
        const fullBounds = [0, ...[...bounds].sort((a,b) => a-b), targetWord.length];
        const syllables = [];
        for (let i = 0; i < fullBounds.length - 1; i++) {
          syllables.push(targetWord.substring(fullBounds[i], fullBounds[i+1]));
        }
        setPredefinedSyllables(syllables);
      } else {
        setPredefinedSyllables(null);
      }
    } else {
      setPredefinedSyllables(null);
    }
  }, [targetWord]);

  // Determine the active string, previous and next syllable based on currentIndex
  let currentActiveInput = '';
  let previousSyllable = '';
  let nextSyllable = '';

  if (predefinedSyllables && activePredefinedIndex >= 0) {
     currentActiveInput = predefinedSyllables[activePredefinedIndex];
     if (activePredefinedIndex > 0) previousSyllable = predefinedSyllables[activePredefinedIndex - 1];
     if (activePredefinedIndex < predefinedSyllables.length - 1) nextSyllable = predefinedSyllables[activePredefinedIndex + 1];
  } else if (!predefinedSyllables && mode === 'guided' && currentIndex >= 0) {
     const boundaries = [0, ...[...manualBoundaries].sort((a, b) => a - b), targetWord.length];
     const syllables = [];
     for (let i = 0; i < boundaries.length - 1; i++) {
        syllables.push(targetWord.substring(boundaries[i], boundaries[i+1]));
     }
     
     let activeSyllableIndex = 0;
     let cumulativeLength = 0;
     for (let i = 0; i < syllables.length; i++) {
         if (currentIndex >= cumulativeLength && currentIndex < cumulativeLength + syllables[i].length) {
             activeSyllableIndex = i;
             break;
         }
         cumulativeLength += syllables[i].length;
     }

     currentActiveInput = targetWord.substring(boundaries[activeSyllableIndex], currentIndex + 1);

     if (activeSyllableIndex > 0) {
         previousSyllable = syllables[activeSyllableIndex - 1];
     }
     
     if (activeSyllableIndex < syllables.length - 1) {
         nextSyllable = syllables[activeSyllableIndex + 1];
     }
  } else if (mode === 'search') {
     currentActiveInput = input;
  }

  useEffect(() => {
    if (currentActiveInput.trim().length > 0) {
      setAnalysis(analyzeSyllable(currentActiveInput, previousSyllable, nextSyllable));
      setShowMobileExplanation(false); // Hide explanation when moving to a new letter
    } else {
      setAnalysis(null);
    }
  }, [currentActiveInput, previousSyllable, nextSyllable]);

  useEffect(() => {
    if (initialWord && initialWord !== targetWord) {
      setInput(initialWord);
      setTargetWord(initialWord);
      setMode('guided');
      setCurrentIndex(-1);
      setActivePredefinedIndex(-1);
    }
  }, [initialWord]);

  const handleSearch = () => {
    if (input.trim().length > 0) {
      setTargetWord(input.replace(/\s/g, ''));
      setMode('guided');
      setCurrentIndex(-1);
      setActivePredefinedIndex(-1);
    }
  };

  const resetSearch = () => {
    setMode('search');
    setInput('');
    setTargetWord('');
    setCurrentIndex(-1);
    setActivePredefinedIndex(-1);
  };

  const translateTone = (tone: string) => {
    const tones = {
      mid: language === 'en' ? 'Mid Tone' : 'Ton Moyen',
      low: language === 'en' ? 'Low Tone' : 'Ton Bas',
      falling: language === 'en' ? 'Falling Tone' : 'Ton Descendant',
      high: language === 'en' ? 'High Tone' : 'Ton Haut',
      rising: language === 'en' ? 'Rising Tone' : 'Ton Montant'
    };
    return tones[tone as keyof typeof tones] || tone;
  };

  const translateClass = (cls: string) => {
    if (cls === 'high') return language === 'en' ? 'High Class' : 'Classe Haute';
    if (cls === 'mid') return language === 'en' ? 'Mid Class' : 'Classe Moyenne';
    if (cls === 'low') return language === 'en' ? 'Low Class' : 'Classe Basse';
    return cls;
  };

  const translateMark = (mark: string) => {
    if (mark === 'none') return language === 'en' ? 'No mark' : 'Aucune marque';
    if (mark === 'mai_ek') return 'Mai Ek ( ◌่ )';
    if (mark === 'mai_tho') return 'Mai Tho ( ◌้ )';
    if (mark === 'mai_tri') return 'Mai Tri ( ◌๊ )';
    if (mark === 'mai_chattawa') return 'Mai Chattawa ( ◌๋ )';
    return mark;
  };

  const getClassColor = (cls: string) => {
    if (cls === 'high') return 'text-blue-500 bg-blue-50 border-blue-200';
    if (cls === 'mid') return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (cls === 'low') return 'text-rose-500 bg-rose-50 border-rose-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const getToneColor = (tone: string) => {
    if (tone === 'mid') return 'text-emerald-600 bg-emerald-100 border-emerald-300';
    if (tone === 'low') return 'text-blue-600 bg-blue-100 border-blue-300';
    if (tone === 'falling') return 'text-purple-600 bg-purple-100 border-purple-300';
    if (tone === 'high') return 'text-orange-600 bg-orange-100 border-orange-300';
    if (tone === 'rising') return 'text-rose-600 bg-rose-100 border-rose-300';
    return 'text-slate-600 bg-slate-100 border-slate-300';
  };

  const EquationContent = () => {
    if (!analysis || analysis.error || (currentIndex < 0 && activePredefinedIndex < 0)) return null;
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col items-center">
          <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6">
            {language === 'en' ? 'The Rule' : 'L\'équation'}
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full">
              <div className={`flex flex-col items-center p-2.5 md:p-3 rounded-xl md:rounded-2xl border-2 min-w-[80px] md:min-w-[100px] ${getClassColor(analysis.initialClass)} relative`}>
                {analysis.isAksonNamApplied && (
                    <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:py-1 rounded-full shadow-sm animate-pulse border-2 border-white">
                      ✨ Akson Nam
                    </div>
                )}
                <span className="text-xs md:text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Consonant' : 'Consonne'}</span>
                <span className="text-2xl md:text-3xl font-thai font-bold mb-1">{analysis.initCons || '-'}</span>
                <span className="text-[10px] md:text-xs font-bold text-center">{translateClass(analysis.initialClass)}</span>
              </div>

              <span className="text-slate-300 font-black text-lg md:text-xl">+</span>

              <div className="flex flex-col items-center p-2.5 md:p-3 rounded-xl md:rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-600 min-w-[80px] md:min-w-[100px] relative">
                {analysis.isImplicitShortVowel && (
                    <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:py-1 rounded-full shadow-sm animate-pulse border-2 border-white">
                      ✨ Sara A
                    </div>
                )}
                <span className="text-xs md:text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Vowel' : 'Voyelle'}</span>
                <span className="text-base md:text-lg font-bold mb-1">{analysis.vowelLength === 'short' ? (language === 'en' ? 'Short' : 'Courte') : (language === 'en' ? 'Long' : 'Longue')}</span>
                <span className="text-[9px] md:text-[10px] font-medium text-slate-400 text-center uppercase tracking-wider">{analysis.endingType === 'live' ? (language === 'en' ? 'Live Syllable' : 'Syllabe Vivante') : (language === 'en' ? 'Dead Syllable' : 'Syllabe Morte')}</span>
              </div>

              {analysis.toneMark !== 'none' && (
                <>
                  <span className="text-slate-300 font-black text-lg md:text-xl">+</span>
                  <div className="flex flex-col items-center p-2.5 md:p-3 rounded-xl md:rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-600 min-w-[80px] md:min-w-[100px]">
                    <span className="text-xs md:text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Mark' : 'Marque'}</span>
                    <span className="text-base md:text-lg font-bold mb-1">{translateMark(analysis.toneMark).split(' ')[0]}</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-amber-500 text-center uppercase">{translateMark(analysis.toneMark)}</span>
                  </div>
                </>
              )}
          </div>

          <div className="w-full flex items-center justify-center my-4 md:my-6">
            <div className="h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-slate-200"></div>
            <div className="h-0.5 w-8 md:w-12 bg-slate-200"></div>
            <div className="h-1.5 md:h-2 w-1.5 md:w-2 rounded-full bg-slate-200"></div>
          </div>

          <div className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl border-2 md:border-4 flex flex-col items-center justify-center shadow-inner ${getToneColor(analysis.finalTone)}`}>
              <span className="text-xs md:text-sm font-bold opacity-80 mb-1 uppercase tracking-widest">{language === 'en' ? 'Result' : 'Résultat'}</span>
              <span className="text-2xl md:text-3xl font-black">{translateTone(analysis.finalTone)}</span>
          </div>
        </div>
      </div>
    );
  };

  const ExplanationContent = ({ isMobileSkin = false }: { isMobileSkin?: boolean }) => {
    if (!analysis) return null;
    return (
      <div className={`text-sm leading-relaxed ${isMobileSkin ? "text-indigo-100" : "text-indigo-800"}`}>
        {language === 'en' 
          ? `This is a ${analysis.endingType === 'live' ? 'live' : 'dead'} syllable starting with a ${analysis.initialClass} class consonant`
          : `C'est une syllabe ${analysis.endingType === 'live' ? 'vivante' : 'morte'} commençant par une consonne de classe ${analysis.initialClass === 'high' ? 'haute' : analysis.initialClass === 'mid' ? 'moyenne' : 'basse'}`}
        {analysis.isAksonNamApplied && (
            language === 'en' 
            ? " (modified by the previous leading consonant via the Akson Nam rule)"
            : " (modifiée par la consonne menante précédente via la règle Akson Nam)"
        )}
        {analysis.toneMark !== 'none' 
          ? (language === 'en' ? `, and it has the tone mark ${translateMark(analysis.toneMark)}.` : `, et elle possède la marque de ton ${translateMark(analysis.toneMark)}.`)
          : (language === 'en' ? ' without any tone mark.' : ' sans aucune marque de ton.')}
        
        {analysis.isImplicitShortVowel && (
            <div className={`mt-3 font-bold p-3 rounded-xl border ${isMobileSkin ? 'bg-indigo-800/50 text-amber-300 border-indigo-700' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              {language === 'en' 
              ? "✨ This is a dead syllable due to an implicit short vowel (Sara A)." 
              : "✨ C'est une syllabe morte due à une voyelle courte implicite (Sara A)."}
            </div>
        )}

        <div className={`mt-4 pt-3 border-t ${isMobileSkin ? 'border-indigo-700/50' : 'border-indigo-500/20'}`}>
          {language === 'en' ? 'According to Thai tone rules, this combination results in a ' : 'Selon les règles des tons thaïlandais, cette combinaison donne un '}
          <strong className={isMobileSkin ? 'text-white' : 'text-indigo-900'}>{translateTone(analysis.finalTone).toLowerCase()}</strong>.
        </div>
      </div>
    );
  };

  const isDesktop2Column = isModal && analysis && !analysis.error && currentIndex >= 0;

  return (
    <div className={`${isModal ? 'bg-[#F5F7FA] rounded-t-3xl md:rounded-3xl flex flex-col h-full max-h-full overflow-hidden' : 'min-h-screen bg-[#F5F7FA] text-slate-800 font-sans pb-24'}`}>
      <header className={`${isModal ? 'bg-white shrink-0 shadow-sm' : 'bg-white/80 backdrop-blur-md sticky top-0'} border-b border-slate-200 z-50`}>
        <div className={`max-w-4xl mx-auto px-4 ${isModal ? 'h-14 md:h-16' : 'h-16'} flex items-center justify-between`}>
          <div className="flex items-center gap-3 md:gap-4">
            {!isModal && (
              <Link href="/practice" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                <ArrowLeft size={20} />
              </Link>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Wand2 size={16} className="md:w-4.5 md:h-4.5" />
              </div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
                {language === 'en' ? 'Tone Analyzer' : 'Calculateur de Tons'}
              </h1>
            </div>
          </div>
          {isModal && onClose && (
            <button 
              onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <main className={`mx-auto px-3 md:px-4 pt-4 md:pt-8 pb-8 md:pb-12 w-full flex justify-center ${isModal ? 'overflow-y-auto flex-1' : ''}`}>
        <div className={`w-full transition-all duration-500 md:flex md:gap-6 lg:gap-8 max-w-[900px] mx-auto`}>
          {/* Left Column: Letter Builder & Input */}
          <div className="flex-1 min-w-0 flex flex-col w-full max-w-xl mx-auto md:mx-0">
            {mode === 'guided' && (
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col items-center mb-4 md:mb-6">
                  {predefinedSyllables ? (
                    <>
                      <p className="text-xs md:text-sm font-bold text-indigo-500 mb-3 md:mb-4 uppercase tracking-wide text-center">
                        {language === 'en' ? 'Select a syllable to analyze' : 'Sélectionnez une syllabe à analyser'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        {predefinedSyllables.map((syllable, index) => {
                          const isActive = index === activePredefinedIndex;
                          return (
                            <button
                              key={index}
                              onClick={() => setActivePredefinedIndex(index)}
                              className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl text-2xl md:text-3xl font-thai font-bold transition-all shadow-sm ${
                                isActive 
                                  ? 'bg-indigo-600 text-white border-2 border-indigo-600 scale-105' 
                                  : 'bg-white text-slate-700 border-2 border-indigo-400 hover:bg-indigo-50 hover:scale-105'
                              }`}
                            >
                              {syllable}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs md:text-sm font-bold text-indigo-500 mb-3 md:mb-4 uppercase tracking-wide text-center">
                        {language === 'en' ? 'Build your word letter by letter' : 'Construisez votre mot lettre par lettre'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                        {targetWord.split('').map((char, index) => {
                          const isActive = index <= currentIndex;
                          const isNext = index === currentIndex + 1;
                          const isClickable = index <= currentIndex + 1;
                          const isBoundary = manualBoundaries.includes(index);

                          return (
                            <React.Fragment key={index}>
                              {index > 0 && (
                                <div className="flex items-center justify-center group relative w-4 md:w-6 mx-0.5">
                                  {isBoundary ? (
                                    <button 
                                      onClick={() => setManualBoundaries(prev => prev.filter(b => b !== index))}
                                      className="h-8 md:h-10 w-1.5 bg-rose-400 rounded-full hover:bg-rose-500 hover:scale-110 transition-all cursor-pointer shadow-sm"
                                      title={language === 'en' ? 'Remove split' : 'Supprimer la coupure'}
                                    />
                                  ) : (
                                    <button 
                                      onClick={() => setManualBoundaries(prev => [...prev, index].sort((a, b) => a - b))}
                                      className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title={language === 'en' ? 'Split syllable here' : 'Couper la syllabe ici'}
                                    >
                                      <Scissors size={16} className="text-indigo-400 hover:text-indigo-600 transition-colors" />
                                    </button>
                                  )}
                                </div>
                              )}
                              <button
                                onClick={() => isClickable && setCurrentIndex(index)}
                                disabled={!isClickable}
                                className={`w-10 h-12 md:w-12 md:h-14 rounded-lg md:rounded-xl text-2xl md:text-3xl font-thai font-bold transition-all shadow-sm ${
                                  isActive 
                                    ? 'bg-indigo-600 text-white border-2 border-indigo-600 scale-105' 
                                    : isNext
                                      ? 'bg-white text-slate-700 border-2 border-indigo-400 hover:bg-indigo-50 hover:scale-105 animate-[pulse_2s_ease-in-out_infinite]'
                                      : 'bg-white text-slate-300 border-2 border-slate-200 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                {char}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-center mb-2">
                  <button onClick={resetSearch} className="px-5 py-2 md:px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs md:text-sm font-bold transition-colors">
                    {language === 'en' ? 'Search another word' : 'Rechercher un autre mot'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200 mb-6 md:mb-8">
              <label className="block text-xs md:text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">
                {language === 'en' ? (mode === 'guided' ? 'Current Syllable' : 'Enter a Thai word') : (mode === 'guided' ? 'Syllabe en cours' : 'Entrez un mot thaï')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={currentActiveInput}
                  onChange={(e) => {
                    if (mode === 'search') setInput(e.target.value.replace(/\s/g, ''));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mode === 'search') {
                      handleSearch();
                    }
                  }}
                  readOnly={mode === 'guided'}
                  placeholder="Ex: บ้าน, มาก, ดี, สวัสดี..."
                  className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-5 text-2xl md:text-3xl font-thai text-slate-800 focus:outline-none transition-all ${mode === 'search' ? 'focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100' : ''}`}
                />
                {currentActiveInput && mode === 'guided' && (
                  <button 
                    onClick={() => playThaiTTS(currentActiveInput)}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-indigo-200 active:scale-95 transition-all"
                    title={language === 'en' ? 'Listen' : 'Écouter'}
                  >
                    <Volume2 size={18} className="md:w-5 md:h-5" />
                  </button>
                )}
                {input && mode === 'search' && (
                  <button 
                    onClick={handleSearch}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-indigo-500 text-white rounded-lg md:rounded-xl flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all"
                  >
                    <Search size={18} className="md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Equation and Explanation (hidden on desktop) */}
            <div className="md:hidden">
              <EquationContent />
              
              {analysis && !analysis.error && (currentIndex >= 0 || activePredefinedIndex >= 0) && (
                <div className="mt-4 relative flex flex-col items-center">
                  <button 
                    onClick={() => setShowMobileExplanation(!showMobileExplanation)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors shadow-sm text-xs border border-indigo-100"
                  >
                    <Info size={16} />
                    {language === 'en' ? 'Why this tone?' : 'Pourquoi ce ton ?'}
                  </button>
                  
                  <AnimatePresence>
                    {showMobileExplanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 w-full max-w-sm bg-indigo-900 shadow-xl z-[60] p-5 rounded-2xl"
                      >
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-900 rotate-45 rounded-sm"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-3 text-white border-b border-indigo-700/50 pb-2">
                            <span className="font-bold text-sm uppercase tracking-wide flex items-center gap-2"><Info size={16}/>{language === 'en' ? 'Explanation' : 'Explication'}</span>
                            <button onClick={() => setShowMobileExplanation(false)} className="p-1 hover:bg-white/10 rounded-full text-indigo-200 hover:text-white transition-colors"><X size={16}/></button>
                          </div>
                          <ExplanationContent isMobileSkin={true} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {analysis?.error && (currentIndex >= 0 || activePredefinedIndex >= 0) && (
                <div className="mt-4 bg-rose-50 rounded-2xl p-4 border border-rose-100 flex items-center gap-3 text-rose-600 animate-in fade-in">
                  <Info size={20} className="shrink-0" />
                  <p className="text-xs font-medium">{analysis.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Equation & Explanation (Desktop only) */}
          <div className="hidden md:flex flex-col w-[300px] lg:w-[350px] shrink-0 gap-6">
            {analysis && !analysis.error && (currentIndex >= 0 || activePredefinedIndex >= 0) ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                <EquationContent />
                
                <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Info className="text-indigo-500" size={22} />
                    {language === 'en' ? 'Why this tone?' : 'Pourquoi ce ton ?'}
                  </h3>
                  <ExplanationContent />
                </div>
              </div>
            ) : (
              /* Empty state placeholder to maintain width and layout stability */
              <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-400 opacity-50 bg-slate-50/50">
                <Wand2 size={48} className="mb-4 opacity-40" />
                <p className="font-bold text-sm">
                  {language === 'en' 
                    ? 'Select a letter to see the analysis and tone rules' 
                    : 'Sélectionnez une lettre pour voir l\'analyse et la règle du ton'}
                </p>
              </div>
            )}
            
            {analysis?.error && (currentIndex >= 0 || activePredefinedIndex >= 0) && (
              <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 flex flex-col items-center gap-4 text-rose-600 text-center animate-in fade-in">
                <Info size={32} className="shrink-0" />
                <p className="text-sm font-medium">{analysis.error}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
