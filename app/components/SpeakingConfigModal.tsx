'use client';

import { getTranslation } from '../hooks/useTranslation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../lib/store';
import { Word, Phrase } from '../types';
import { X, Check } from 'lucide-react';
import { getVocabularyServer, getLightweightLessons } from '../actions/course';
import { Drawer } from 'vaul';

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

  // Synchronize on open
  useEffect(() => {
    if (isOpen) {
      setSelectedLessonId(speakingConfig.lessonId);
      setSelectedWordIds(speakingConfig.selectedWordIds);
      setRequiredAccuracy(speakingConfig.requiredAccuracy || 50);
      setStrictMode(speakingConfig.strictMode || false);
      
      // Fetch available lessons metadata once
      getLightweightLessons().then(setLessonsList);
    }
  }, [isOpen, speakingConfig]);

  // Fetch vocabulary when selection changes
  useEffect(() => {
    if (isOpen) {
      setIsLoadingVocab(true);
      getVocabularyServer(selectedLessonId, completedLessons).then((vocab) => {
        setCurrentVocabulary(vocab);
        setIsLoadingVocab(false);
      });
    }
  }, [isOpen, selectedLessonId, completedLessons]);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen || !mounted) return null;

  const toggleWordSelection = (id: string) => {
    if (selectedWordIds === null) {
      // By default all are selected, so if we toggle one off, we include all EXCEPT this one
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

  const isWordSelected = (id: string) => {
    if (selectedWordIds === null) return true;
    return selectedWordIds.includes(id);
  };

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

  const renderContent = () => (
    <>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-extrabold text-slate-800">
          {getTranslation('auto.speaking_configuration', language)}
        </h2>
        <button 
           onClick={onClose}
           className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar">
          
          {/* Lesson Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation('auto.lesson_to_practice', language)}
            </h3>
            <select 
              value={selectedLessonId}
              onChange={(e) => {
                 setSelectedLessonId(e.target.value);
                 setSelectedWordIds(null); // reset selection
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">{getTranslation('auto.all_seen_lessons', language)}</option>
              {lessonsList.filter(l => completedLessons.includes(l.id)).map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {language === 'en' && lesson.titleEn ? lesson.titleEn : lesson.title}
                </option>
              ))}
            </select>
            {completedLessons.length === 0 && (
              <p className="text-amber-600 text-sm italic">{getTranslation('auto.you_need_to_complete_some_less', language)}</p>
            )}
          </div>

          {/* Accuracy Selection */}
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

          {/* Words Selection */}
          {currentVocabulary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {getTranslation('auto.vocabulary', language)}
                </h3>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {getTranslation('auto.all', language)}
                  </button>
                  <button onClick={deselectAll} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {getTranslation('auto.none', language)}
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl max-h-48 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentVocabulary.map(item => (
                  <button 
                    key={item.id} 
                    type="button"
                    onClick={() => toggleWordSelection(item.id)}
                    className="flex items-center text-left gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isWordSelected(item.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'}`}>
                      {isWordSelected(item.id) && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-thai text-lg truncate">{item.th}</span>
                      <span className="text-xs text-slate-500 truncate">{language === 'en' && item.en ? item.en : item.fr}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
           <button 
             onClick={handleStart}
             disabled={(selectedWordIds !== null && selectedWordIds.length === 0) || completedLessons.length === 0}
             className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg py-4 rounded-xl border-b-4 border-orange-700 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 uppercase tracking-widest"
           >
             {getTranslation('auto.start', language)}
           </button>
        </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[200] max-h-[95vh] outline-none">
            <Drawer.Title className="sr-only">Configuration</Drawer.Title>
            <Drawer.Description className="sr-only">Configure settings</Drawer.Description>
            <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
            </div>
            <div className="pt-4 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              {renderContent()}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {renderContent()}
      </div>
    </div>,
    document.body
  );
}
