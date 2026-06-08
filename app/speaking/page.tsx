'use client';

import { getTranslation } from '../hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '../lib/store';
import { getVocabularyServer, getDictionaryForExerciseServer } from '../actions/course';
import { Word, Phrase } from '../types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SpeakingExercise } from '../components/SpeakingExercise';

export default function SpeakingPage() {
  const router = useRouter();
  const { language, speakingConfig, completedLessons } = useProgressStore();
  const [vocabulary, setVocabulary] = useState<(Word | Phrase)[]>([]);
  const [dictionary, setDictionary] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function loadVocab() {
      const [vocab, dict] = await Promise.all([
        getVocabularyServer(speakingConfig.lessonId, completedLessons),
        getDictionaryForExerciseServer()
      ]);
      let filtered = vocab.filter(item => item.id !== 'w_dots' && item.th !== '...' && item.th !== '___');
      if (speakingConfig.selectedWordIds) {
        filtered = filtered.filter(item => speakingConfig.selectedWordIds!.includes(item.id));
      }
      // Shuffle words
      filtered.sort(() => Math.random() - 0.5);
      setVocabulary(filtered);
      setDictionary(dict as Word[]);
      setLoading(false);
    }
    loadVocab();
  }, [speakingConfig, completedLessons]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <p className="text-xl text-slate-600 mb-6">
          {getTranslation('auto.no_words_selected', language)}
        </p>
        <button onClick={() => router.push('/practice')} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
          {getTranslation('auto.go_back', language)}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center sticky top-0 z-50">
        <button 
          onClick={() => router.push('/practice')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 font-bold text-center text-slate-600">
           {getTranslation('auto.speaking_practice', language)}
        </div>
        <div className="w-10"></div> {/* Spacer to center title */}
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <SpeakingExercise vocabulary={vocabulary} dictionary={dictionary} onComplete={() => router.push('/practice')} />
      </main>
    </div>
  );
}
