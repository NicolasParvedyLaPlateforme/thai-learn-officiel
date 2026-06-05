'use client';

import { getTranslation } from '../hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, BookOpen, Pencil, Star, Mic, User, Wand2 } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import { WritingConfigModal } from '../components/WritingConfigModal';
import { SpeakingConfigModal } from '../components/SpeakingConfigModal';
import PWAInstallButton from '../components/PWAInstallButton';
import { useIsPWA } from '../../hooks/use-pwa';

export default function PracticePage() {
  const { language, xp, setLanguage } = useProgressStore();
  const [isWritingConfigModalOpen, setWritingConfigModalOpen] = useState(false);
  const [isSpeakingConfigModalOpen, setSpeakingConfigModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isPWA = useIsPWA();
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-20">
      
      {/* Mobile Top Header */}
      <header className="bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden">
        <div className="flex items-center justify-between w-full h-full px-4 md:px-8 gap-2 sm:gap-6">
          <div className="flex items-center gap-3">
            <Link href="/learn" className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm md:hidden">
              <BookOpen size={20} />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight md:hidden">
              {getTranslation('auto.practice', language)}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {mounted && <PWAInstallButton />}
            {mounted && (
              <button 
                 onClick={() => useProgressStore.getState().setShowLanguageModal(true)}
                 className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-extrabold text-sm hover:bg-slate-200 transition-colors uppercase"
              >
                 {language}
              </button>
            )}
            
            {(mounted && isPWA) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl font-extrabold text-sm">
                <Star size={18} className="fill-amber-400 stroke-amber-400" />
                <span>{xp} XP</span>
              </div>
            )}
            <Link
              href="/profile"
              className="flex items-center justify-center p-1.5 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>

      <WritingConfigModal isOpen={isWritingConfigModalOpen} onClose={() => setWritingConfigModalOpen(false)} />
      <SpeakingConfigModal isOpen={isSpeakingConfigModalOpen} onClose={() => setSpeakingConfigModalOpen(false)} />
      
      <div className="max-w-4xl mx-auto space-y-8 mt-8 px-4 md:px-8">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            {getTranslation('auto.practice', language)}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            {getTranslation('auto.reinforce_your_skills_with_tar', language)}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Review Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <Link href="/review" className="group flex flex-col bg-white border-2 border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 active:translate-y-0 active:shadow-md transition-all duration-300">
            {/* Illustration */}
            <div className="mb-6 w-full h-40 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 relative overflow-hidden flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Back card */}
              <div className="absolute w-32 h-24 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center rotate-[-8deg] group-hover:rotate-[-12deg] group-hover:-translate-y-1 transition-all duration-500">
              </div>
              {/* Front card */}
              <div className="absolute w-32 h-24 bg-white rounded-xl shadow-md border border-indigo-200 flex flex-col items-center justify-center rotate-[4deg] group-hover:rotate-[8deg] group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-500 gap-2">
                <span className="text-3xl font-bold text-indigo-600">แมว</span>
                <div className="w-12 h-2 bg-indigo-100 rounded-full"></div>
              </div>

              {/* Icon badge */}
              <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                <Brain size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {getTranslation('auto.review', language)}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {getTranslation('auto.test_your_memory_and_reinforce', language)}
            </p>
          </Link>
          </motion.div>
          
          {/* Pairs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
          <Link href="/review-pairs" className="group flex flex-col bg-white border-2 border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-fuchsia-300 active:translate-y-0 active:shadow-md transition-all duration-300">
            {/* Illustration */}
            <div className="mb-6 w-full h-40 bg-fuchsia-50/50 rounded-2xl border-2 border-fuchsia-100 flex items-center justify-center group-hover:bg-fuchsia-50 transition-colors relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(#fae8ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
               
               {/* Grid representation of pairs */}
               <div className="grid grid-cols-2 gap-3 relative z-10 w-48">
                 <div className="h-10 bg-white rounded-xl shadow-sm border-2 border-slate-100 flex items-center justify-center group-hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-8 h-2 bg-slate-200 rounded-full"></div>
                 </div>
                 <div className="h-10 bg-fuchsia-100 rounded-xl shadow-sm border-2 border-fuchsia-300 flex items-center justify-center group-hover:-translate-y-0.5 transition-all duration-300 text-fuchsia-600 font-bold text-[13px]">
                    {getTranslation('auto.cat', language)}
                 </div>
                 
                 <div className="h-10 bg-fuchsia-500 rounded-xl shadow-md border-2 border-fuchsia-600 flex items-center justify-center group-hover:translate-y-0.5 transition-all duration-300 delay-75 text-white font-bold text-lg pt-1">
                    แมว
                 </div>
                 <div className="h-10 bg-white rounded-xl shadow-sm border-2 border-slate-100 flex items-center justify-center group-hover:translate-y-0.5 transition-all duration-300 delay-75">
                    <div className="w-8 h-2 bg-slate-200 rounded-full"></div>
                 </div>
               </div>

              {/* Icon badge */}
              <div className="absolute top-3 left-3 bg-fuchsia-100 text-fuchsia-600 p-2 rounded-xl">
                <BookOpen size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {getTranslation('auto.pairs', language)}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {getTranslation('auto.match_words_with_their_transla', language)}
            </p>
          </Link>
          </motion.div>

          {/* Writing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          >
          <button 
            onClick={() => setWritingConfigModalOpen(true)}
            className="group flex flex-col bg-white border-2 border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-sky-300 active:translate-y-0 active:shadow-md transition-all duration-300 text-left"
          >
            {/* Illustration */}
            <div className="mb-6 w-full h-40 bg-sky-50/50 rounded-2xl border-2 border-sky-100 flex flex-col items-center justify-center gap-4 group-hover:bg-sky-50 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Input field */}
              <div className="w-3/4 h-11 bg-white rounded-xl border-2 border-slate-200 shadow-inner flex items-center px-4 gap-0.5 relative z-10">
                <span className="text-sky-500 font-bold text-xl leading-none pt-1">ห</span>
                <span className="text-sky-500 font-bold text-xl leading-none pt-1">ม</span>
                <div className="w-0.5 h-5 bg-sky-400 animate-pulse ml-0.5"></div>
              </div>
              
              {/* Keyboard */}
              <div className="flex flex-col gap-2 w-3/4 relative z-10">
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm border-b-2 border-slate-200 flex items-center justify-center group-hover:-translate-y-0.5 transition-all"><span className="text-sm text-slate-400 pt-0.5">ด</span></div>
                  <div className="w-8 h-8 bg-sky-500 rounded-lg shadow-sm border-b-2 border-sky-600 flex items-center justify-center group-hover:-translate-y-0.5 transition-all delay-75"><span className="text-sm text-white pt-0.5">า</span></div>
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm border-b-2 border-slate-200 flex items-center justify-center group-hover:-translate-y-0.5 transition-all delay-150"><span className="text-sm text-slate-400 pt-0.5">ก</span></div>
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm border-b-2 border-slate-200 flex items-center justify-center group-hover:-translate-y-0.5 transition-all delay-200"><span className="text-sm text-slate-400 pt-0.5">ห</span></div>
                </div>
              </div>

              {/* Icon badge */}
              <div className="absolute top-3 left-3 bg-sky-100 text-sky-600 p-2 rounded-xl">
                <Pencil size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {getTranslation('auto.writing', language)}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {getTranslation('auto.practice_structural_sentence_b', language)}
            </p>
          </button>
          </motion.div>

          {/* Speaking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          >
          <button 
            onClick={() => setSpeakingConfigModalOpen(true)}
            className="group flex flex-col bg-white border-2 border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 active:translate-y-0 active:shadow-md transition-all duration-300 text-left"
          >
            {/* Illustration */}
            <div className="mb-6 w-full h-40 bg-orange-50/50 rounded-2xl border-2 border-orange-100 flex flex-col items-center justify-center gap-4 group-hover:bg-orange-50 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffedd5_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Voice Waves */}
              <div className="flex items-end justify-center gap-1.5 h-16 relative z-10">
                <div className="w-2 h-6 bg-orange-300 rounded-full group-hover:animate-[bounce_1s_infinite_100ms] transition-all"></div>
                <div className="w-2 h-10 bg-orange-400 rounded-full group-hover:animate-[bounce_1s_infinite_200ms] transition-all"></div>
                <div className="w-2 h-14 bg-orange-500 rounded-full group-hover:animate-[bounce_1s_infinite_300ms] transition-all"></div>
                <div className="w-2 h-8 bg-orange-400 rounded-full group-hover:animate-[bounce_1s_infinite_400ms] transition-all"></div>
                <div className="w-2 h-4 bg-orange-300 rounded-full group-hover:animate-[bounce_1s_infinite_500ms] transition-all"></div>
              </div>

              {/* Icon badge */}
              <div className="absolute top-3 left-3 bg-orange-100 text-orange-600 p-2 rounded-xl">
                <Mic size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {getTranslation('auto.speaking', language)}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {getTranslation('auto.practice_your_pronunciation_wi', language)}
            </p>
          </button>
          </motion.div>

          {/* Tone Analyzer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
          >
            <Link href="/practice/tone-analyzer" className="group flex flex-col bg-white border-2 border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 active:translate-y-0 active:shadow-md transition-all duration-300 h-full">
              {/* Illustration */}
              <div className="mb-6 w-full h-40 bg-teal-50/50 rounded-2xl border-2 border-teal-100 flex flex-col items-center justify-center gap-2 group-hover:bg-teal-50 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ccfbf1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                
                <div className="flex items-center gap-3 relative z-10 bg-white px-4 py-2 rounded-xl shadow-sm border-2 border-teal-200 group-hover:-translate-y-1 transition-all duration-300">
                  <span className="text-2xl font-bold font-thai text-teal-600">มาก</span>
                  <span className="text-slate-300 font-bold">=</span>
                  <span className="font-bold text-teal-500 uppercase tracking-widest text-xs">Falling</span>
                </div>

                {/* Icon badge */}
                <div className="absolute top-3 left-3 bg-teal-100 text-teal-600 p-2 rounded-xl">
                  <Wand2 size={20} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {language === 'en' ? 'Tone Analyzer' : 'Calculateur de Tons'}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {language === 'en' ? 'Deconstruct any Thai syllable to understand its tone rules.' : 'Déconstruisez n\'importe quelle syllabe thaï pour comprendre son ton.'}
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
