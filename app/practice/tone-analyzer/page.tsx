'use client';

import { getTranslation } from '../../hooks/useTranslation';
import React, { useState, useEffect, Suspense } from 'react';
import { useProgressStore } from '../../lib/store';
import { analyzeSyllable, ToneAnalysis } from '../../lib/toneAnalyzer';
import { Search, ArrowLeft, Wand2, Info, Volume2, Scissors } from 'lucide-react';
import Link from 'next/link';
import { playThaiTTS } from '../../lib/tts';
import { useSearchParams } from 'next/navigation';

function ToneAnalyzerContent() {
  const { language } = useProgressStore();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get('word') || '';
  
  const [input, setInput] = useState(initialWord);
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);

  const [mode, setMode] = useState<'search' | 'guided'>(initialWord ? 'guided' : 'search');
  const [targetWord, setTargetWord] = useState(initialWord);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [manualBoundaries, setManualBoundaries] = useState<number[]>([]);

  // Reset manual boundaries when target word changes
  useEffect(() => {
    setManualBoundaries([]);
  }, [targetWord]);

  // Determine the active string and previous syllable based on currentIndex
  let currentActiveInput = '';
  let previousSyllable = '';

  if (mode === 'guided' && currentIndex >= 0) {
     let startIdx = 0;
     let prevStartIdx = -1;
     let prevEndIdx = -1;

     for (let i = 0; i <= currentIndex; i++) {
        if (manualBoundaries.includes(i)) {
            prevStartIdx = startIdx;
            prevEndIdx = i;
            startIdx = i;
        }
     }
     currentActiveInput = targetWord.substring(startIdx, currentIndex + 1);
     
     if (prevStartIdx >= 0 && prevEndIdx > prevStartIdx) {
        previousSyllable = targetWord.substring(prevStartIdx, prevEndIdx);
     }
  } else if (mode === 'search') {
     currentActiveInput = input;
  }

  useEffect(() => {
    if (currentActiveInput.trim().length > 0) {
      setAnalysis(analyzeSyllable(currentActiveInput, previousSyllable));
    } else {
      setAnalysis(null);
    }
  }, [currentActiveInput, previousSyllable]);

  const handleSearch = () => {
    if (input.trim().length > 0) {
      setTargetWord(input.replace(/\s/g, ''));
      setMode('guided');
      setCurrentIndex(-1);
    }
  };

  const resetSearch = () => {
    setMode('search');
    setInput('');
    setTargetWord('');
    setCurrentIndex(-1);
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
    if (mark === 'mai_ek') return 'Mai Ek (่)';
    if (mark === 'mai_tho') return 'Mai Tho (้)';
    if (mark === 'mai_tri') return 'Mai Tri (๊)';
    if (mark === 'mai_chattawa') return 'Mai Chattawa (๋)';
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

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans pb-24">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/practice" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Wand2 size={18} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">
              {language === 'en' ? 'Tone Analyzer' : 'Calculateur de Tons'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-12">
        {mode === 'guided' && (
          <div className="mb-8">
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm font-bold text-indigo-500 mb-4 uppercase tracking-wide">
                {language === 'en' ? 'Build your word letter by letter' : 'Construisez votre mot lettre par lettre'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {targetWord.split('').map((char, index) => {
                  const isActive = index <= currentIndex;
                  const isNext = index === currentIndex + 1;
                  const isClickable = index <= currentIndex + 1;
                  
                  const isBoundary = manualBoundaries.includes(index);

                  return (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <div className="flex items-center justify-center group relative w-6 mx-0.5">
                          {isBoundary ? (
                            <button 
                              onClick={() => setManualBoundaries(prev => prev.filter(b => b !== index))}
                              className="h-10 w-1.5 bg-rose-400 rounded-full hover:bg-rose-500 hover:scale-110 transition-all cursor-pointer shadow-sm"
                              title={language === 'en' ? 'Remove split' : 'Supprimer la coupure'}
                            />
                          ) : (
                            <button 
                              onClick={() => setManualBoundaries(prev => [...prev, index].sort((a, b) => a - b))}
                              className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title={language === 'en' ? 'Split syllable here' : 'Couper la syllabe ici'}
                            >
                              <Scissors size={18} className="text-indigo-400 hover:text-indigo-600 transition-colors" />
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => isClickable && setCurrentIndex(index)}
                        disabled={!isClickable}
                        className={`w-12 h-14 rounded-xl text-3xl font-thai font-bold transition-all shadow-sm ${
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
            </div>
            <div className="flex justify-center mb-4">
              <button onClick={resetSearch} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold transition-colors">
                {language === 'en' ? 'Search another word' : 'Rechercher un autre mot'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">
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
              className={`w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-3xl font-thai text-slate-800 focus:outline-none transition-all ${mode === 'search' ? 'focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100' : ''}`}
            />
            {currentActiveInput && mode === 'guided' && (
              <button 
                onClick={() => playThaiTTS(currentActiveInput)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-200 active:scale-95 transition-all"
                title={language === 'en' ? 'Listen' : 'Écouter'}
              >
                <Volume2 size={20} />
              </button>
            )}
            {input && mode === 'search' && (
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all"
              >
                <Search size={20} />
              </button>
            )}
          </div>
        </div>

        {analysis && !analysis.error && currentIndex >= 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* The Equation */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                 {language === 'en' ? 'The Rule' : 'L\'équation'}
               </h2>
               
               <div className="flex flex-wrap justify-center items-center gap-3 w-full">
                  <div className={`flex flex-col items-center p-3 rounded-2xl border-2 min-w-[100px] ${getClassColor(analysis.initialClass)} relative`}>
                     {analysis.isAksonNamApplied && (
                        <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse border-2 border-white">
                           ✨ Akson Nam
                        </div>
                     )}
                     <span className="text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Consonant' : 'Consonne'}</span>
                     <span className="text-3xl font-thai font-bold mb-1">{analysis.initCons || '-'}</span>
                     <span className="text-xs font-bold text-center">{translateClass(analysis.initialClass)}</span>
                  </div>

                  <span className="text-slate-300 font-black text-xl">+</span>

                  <div className="flex flex-col items-center p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-600 min-w-[100px]">
                     <span className="text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Vowel' : 'Voyelle'}</span>
                     <span className="text-lg font-bold mb-1">{analysis.vowelLength === 'short' ? (language === 'en' ? 'Short' : 'Courte') : (language === 'en' ? 'Long' : 'Longue')}</span>
                     <span className="text-[10px] font-medium text-slate-400 text-center uppercase tracking-wider">{analysis.endingType === 'live' ? (language === 'en' ? 'Live Syllable' : 'Syllabe Vivante') : (language === 'en' ? 'Dead Syllable' : 'Syllabe Morte')}</span>
                  </div>

                  {analysis.toneMark !== 'none' && (
                    <>
                      <span className="text-slate-300 font-black text-xl">+</span>
                      <div className="flex flex-col items-center p-3 rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-600 min-w-[100px]">
                         <span className="text-sm font-bold opacity-70 mb-1">{language === 'en' ? 'Mark' : 'Marque'}</span>
                         <span className="text-lg font-bold mb-1">{translateMark(analysis.toneMark).split(' ')[0]}</span>
                         <span className="text-[10px] font-bold text-amber-500 text-center uppercase">{translateMark(analysis.toneMark)}</span>
                      </div>
                    </>
                  )}
               </div>

               <div className="w-full flex items-center justify-center my-6">
                 <div className="h-2 w-2 rounded-full bg-slate-200"></div>
                 <div className="h-0.5 w-12 bg-slate-200"></div>
                 <div className="h-2 w-2 rounded-full bg-slate-200"></div>
               </div>

               <div className={`w-full py-4 rounded-2xl border-4 flex flex-col items-center justify-center shadow-inner ${getToneColor(analysis.finalTone)}`}>
                  <span className="text-sm font-bold opacity-80 mb-1 uppercase tracking-widest">{language === 'en' ? 'Result' : 'Résultat'}</span>
                  <span className="text-3xl font-black">{translateTone(analysis.finalTone)}</span>
               </div>
            </div>

            {/* Explanations */}
            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex gap-4">
              <Info className="text-indigo-400 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-indigo-900 mb-2">
                   {language === 'en' ? 'Why this tone?' : 'Pourquoi ce ton ?'}
                </h3>
                <p className="text-indigo-700/80 text-sm leading-relaxed">
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
                  <br/><br/>
                  {language === 'en' ? 'According to Thai tone rules, this combination results in a ' : 'Selon les règles des tons thaïlandais, cette combinaison donne un '}
                  <strong>{translateTone(analysis.finalTone).toLowerCase()}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {analysis?.error && currentIndex >= 0 && (
          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 flex items-center gap-4 text-rose-600 animate-in fade-in">
            <Info size={24} className="shrink-0" />
            <p className="text-sm font-medium">{analysis.error}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ToneAnalyzerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">Loading...</div>}>
      <ToneAnalyzerContent />
    </Suspense>
  );
}
