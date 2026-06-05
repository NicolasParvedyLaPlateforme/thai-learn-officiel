'use client';

import { getTranslation } from '../../hooks/useTranslation';
import React, { useState, useEffect, Suspense } from 'react';
import { useProgressStore } from '../../lib/store';
import { analyzeSyllable, ToneAnalysis } from '../../lib/toneAnalyzer';
import { Search, ArrowLeft, Wand2, Info } from 'lucide-react';
import Link from 'next/link';
import { playThaiTTS } from '../../lib/tts';
import { useSearchParams } from 'next/navigation';

function ToneAnalyzerContent() {
  const { language } = useProgressStore();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get('word') || '';
  
  const [input, setInput] = useState(initialWord);
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);

  useEffect(() => {
    if (input.trim().length > 0) {
      setAnalysis(analyzeSyllable(input));
    } else {
      setAnalysis(null);
    }
  }, [input]);

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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">
            {language === 'en' ? 'Enter a single Thai syllable' : 'Entrez une syllabe thaï'}
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\s/g, ''))}
              placeholder="Ex: บ้าน, มาก, ดี..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-2xl font-thai text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            {input && (
              <button 
                onClick={() => playThaiTTS(input)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 active:scale-95 transition-all"
              >
                <Search size={20} />
              </button>
            )}
          </div>
        </div>

        {analysis && !analysis.error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* The Equation */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                 {language === 'en' ? 'The Rule' : 'L\'équation'}
               </h2>
               
               <div className="flex flex-wrap justify-center items-center gap-3 w-full">
                  <div className={`flex flex-col items-center p-3 rounded-2xl border-2 min-w-[100px] ${getClassColor(analysis.initialClass)}`}>
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

        {analysis?.error && input.length > 0 && (
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
