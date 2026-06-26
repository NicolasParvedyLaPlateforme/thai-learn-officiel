'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Word, Phrase } from "@/types";
import { getVocabularyServer, getLightweightLessons } from "@/actions/course";
import { ResponsiveModal } from "../ui/ResponsiveModal";
import { VocabularySelector } from "../ui/VocabularySelector";
import { LessonSelector } from "../ui/LessonSelector";

export function SpeakingConfigModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const { language, completedLessons, speakingConfig, setSpeakingConfig } = useProgressStore();

  const [selectedLessonId, setSelectedLessonId] = useState<string | 'all'>(speakingConfig.lessonId);
  const [selectedWordIds, setSelectedWordIds] = useState<string[] | null>(speakingConfig.selectedWordIds);
  const [requiredAccuracy, setRequiredAccuracy] = useState<number>(speakingConfig.requiredAccuracy || 50);
  const [strictMode, setStrictMode] = useState<boolean>(speakingConfig.strictMode || false);

  const [currentVocabulary, setCurrentVocabulary] = useState<(Word | Phrase)[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [isLoadingVocab, setIsLoadingVocab] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedLessonId(speakingConfig.lessonId);
      setSelectedWordIds(speakingConfig.selectedWordIds);
      setRequiredAccuracy(speakingConfig.requiredAccuracy || 50);
      setStrictMode(speakingConfig.strictMode || false);
      getLightweightLessons().then(setLessonsList);
    }
  }, [isOpen, speakingConfig]);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingVocab(true);
      getVocabularyServer(selectedLessonId, completedLessons).then((vocab) => {
        setCurrentVocabulary(vocab);
        setIsLoadingVocab(false);
      });
    }
  }, [isOpen, selectedLessonId, completedLessons]);

  const toggleWordSelection = (id: string) => {
    if (selectedWordIds === null) {
      setSelectedWordIds(currentVocabulary.map(v => v.id).filter(vid => vid !== id));
    } else {
      if (selectedWordIds.includes(id)) {
        setSelectedWordIds(selectedWordIds.filter(vid => vid !== id));
      } else {
        setSelectedWordIds([...selectedWordIds, id]);
      }
    }
  };

  const selectAll = () => setSelectedWordIds(null);
  const deselectAll = () => setSelectedWordIds([]);

  const handleStart = () => {
    setSpeakingConfig({
      lessonId: selectedLessonId,
      selectedWordIds,
      requiredAccuracy,
      strictMode,
    });
    onClose();
    router.push('/speaking');
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation('auto.speaking_configuration', language)}
      footer={
        <button
          onClick={handleStart}
          disabled={(selectedWordIds !== null && selectedWordIds.length === 0) || completedLessons.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg py-4 rounded-xl border-b-4 border-orange-700 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 uppercase tracking-widest"
        >
          {getTranslation('auto.start', language)}
        </button>
      }
    >
      <LessonSelector
        language={language}
        selectedLessonId={selectedLessonId}
        onLessonChange={(id) => {
          setSelectedLessonId(id);
          setSelectedWordIds(null);
        }}
        lessonsList={lessonsList}
        completedLessons={completedLessons}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {language === 'en' ? 'Required Pronunciation Accuracy' : 'Précision de prononciation requise'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setRequiredAccuracy(50); setStrictMode(false); }}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${requiredAccuracy === 50 ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {language === 'en' ? '50% (Lenient)' : '50% (Tolérant)'}
          </button>
          <button
            onClick={() => { setRequiredAccuracy(80); setStrictMode(false); }}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${requiredAccuracy === 80 ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {language === 'en' ? '80% (Strict)' : '80% (Strict)'}
          </button>
          <button
            onClick={() => { setRequiredAccuracy(100); setStrictMode(false); }}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${requiredAccuracy === 100 && !strictMode ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {language === 'en' ? '100% (With Help)' : '100% (Avec aide)'}
          </button>
          <button
            onClick={() => { setRequiredAccuracy(100); setStrictMode(true); }}
            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${requiredAccuracy === 100 && strictMode ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            {language === 'en' ? '100% (Ultimate)' : '100% (Ultime)'}
          </button>
        </div>
      </div>

      <VocabularySelector
        isLoading={isLoadingVocab}
        vocabulary={currentVocabulary}
        selectedWordIds={selectedWordIds}
        onToggleWord={toggleWordSelection}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        language={language}
      />
    </ResponsiveModal>
  );
}