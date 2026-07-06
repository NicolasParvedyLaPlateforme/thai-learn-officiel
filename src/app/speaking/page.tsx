'use client';

import { getTranslation, useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { getVocabularyServer, getDictionaryForExerciseServer } from "@/actions/course";
import { Word, Phrase } from "@/types";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SpeakingExercise } from "@/components/speak/SpeakingExercise";

export default function SpeakingPage() {
  const router = useRouter();
  const { language, speakingConfig, completedLessons } = useProgressStore();
  const [vocabulary, setVocabulary] = useState<(Word | Phrase)[]>([]);
  const [dictionary, setDictionary] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <Button onClick={() => router.push('/practice')} variant="orange" className="px-6 py-3 rounded-xl font-bold transition-colors">
          {getTranslation('auto.go_back', language)}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center sticky top-0 z-50 gap-4">
        <IconButton 
          size="md"
          onClick={() => router.push('/practice')}
          className="shrink-0 text-slate-400 hover:bg-slate-100"
        >
          <ArrowLeft size={24} />
        </IconButton>
        <div className="flex-1 flex items-center gap-4">
           <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${vocabulary.length > 0 ? (currentIndex / vocabulary.length) * 100 : 0}%` }}></div>
           </div>
           <div className="text-sm font-bold text-slate-400 shrink-0">
              {currentIndex} / {vocabulary.length}
           </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <SpeakingExercise 
          vocabulary={vocabulary} 
          dictionary={dictionary} 
          currentIndex={currentIndex}
          onNext={(isSuccess) => {
            if (currentIndex + 1 < vocabulary.length) {
              setCurrentIndex(currentIndex + 1);
            } else {
              router.push('/practice');
            }
          }} 
        />
      </main>
    </div>
  );
}
