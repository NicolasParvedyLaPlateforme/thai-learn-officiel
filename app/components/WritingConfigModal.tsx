'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../lib/store';
import { CourseData, Word, Phrase } from '../types';
import { X, Check } from 'lucide-react';
import { getVocabularyServer, getLightweightLessons } from '../actions/course';

export function WritingConfigModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const { language, completedLessons, writingConfig, setWritingConfig } = useProgressStore();
  
  const [selectedLessonId, setSelectedLessonId] = useState<string | 'all'>(writingConfig.lessonId);
  const [selectedWordIds, setSelectedWordIds] = useState<string[] | null>(writingConfig.selectedWordIds);
  
  const [hideThai, setHideThai] = useState(writingConfig.hideThai);
  const [hideTranslation, setHideTranslation] = useState(writingConfig.hideTranslation);
  const [disableDictionaryClick, setDisableDictionaryClick] = useState(writingConfig.disableDictionaryClick);
  const [hideCharacterHints, setHideCharacterHints] = useState(writingConfig.hideCharacterHints);

  const [currentVocabulary, setCurrentVocabulary] = useState<(Word | Phrase)[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [isLoadingVocab, setIsLoadingVocab] = useState(false);

  // Synchronize on open
  useEffect(() => {
    if (isOpen) {
      setSelectedLessonId(writingConfig.lessonId);
      setSelectedWordIds(writingConfig.selectedWordIds);
      setHideThai(writingConfig.hideThai);
      setHideTranslation(writingConfig.hideTranslation);
      setDisableDictionaryClick(writingConfig.disableDictionaryClick);
      setHideCharacterHints(writingConfig.hideCharacterHints);
      
      // Fetch available lessons metadata once
      getLightweightLessons().then(setLessonsList);
    }
  }, [isOpen, writingConfig]);

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
  useEffect(() => { setMounted(true); }, []);

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
    setWritingConfig({
      lessonId: selectedLessonId,
      selectedWordIds,
      hideThai,
      hideTranslation,
      disableDictionaryClick,
      hideCharacterHints
    });
    onClose();
    router.push('/writing');
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-extrabold text-slate-800">
            {language === 'en' ? 'Writing Configuration' : 'Configuration d\'écriture'}
          </h2>
          <button 
             onClick={onClose}
             className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          
          {/* Lesson Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Lesson to practice' : 'Leçon à pratiquer'}
            </h3>
            <select 
              value={selectedLessonId}
              onChange={(e) => {
                 setSelectedLessonId(e.target.value);
                 setSelectedWordIds(null); // reset selection
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">{language === 'en' ? 'All seen lessons' : 'Toutes les leçons vues'}</option>
              {lessonsList.filter(l => completedLessons.includes(l.id)).map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {language === 'en' && lesson.titleEn ? lesson.titleEn : lesson.title}
                </option>
              ))}
            </select>
            {completedLessons.length === 0 && (
              <p className="text-amber-600 text-sm italic">{language === 'en' ? 'You need to complete some lessons first.' : 'Vous devez d\'abord compléter quelques leçons.'}</p>
            )}
          </div>

          {/* Words Selection */}
          {currentVocabulary.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Vocabulary' : 'Vocabulaire'}
                </h3>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {language === 'en' ? 'All' : 'Tout'}
                  </button>
                  <button onClick={deselectAll} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                    {language === 'en' ? 'None' : 'Aucun'}
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

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Difficulty Options' : 'Options de difficulté'}
            </h3>
            
            <label className="flex items-start gap-4 cursor-pointer group">
               <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideThai ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                 {hideThai && <Check size={16} strokeWidth={3} />}
               </div>
               <div>
                 <div className="font-bold text-slate-700">{language === 'en' ? 'Hide Thai translation' : 'Cacher le mot thaï'}</div>
                 <div className="text-sm text-slate-500">{language === 'en' ? 'Do not display the thai characters to copy' : 'Ne pas afficher les caractères thaï à recopier'}</div>
               </div>
               <input type="checkbox" className="hidden" checked={hideThai} onChange={e => setHideThai(e.target.checked)} />
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
               <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideTranslation ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                 {hideTranslation && <Check size={16} strokeWidth={3} />}
               </div>
               <div>
                 <div className="font-bold text-slate-700">{language === 'en' ? 'Hide standard translation' : 'Cacher la traduction usuelle'}</div>
                 <div className="text-sm text-slate-500">{language === 'en' ? 'Only show the phonetic spelling, no french/english translation' : 'N\'afficher que la phonétique sans traduction'}</div>
               </div>
               <input type="checkbox" className="hidden" checked={hideTranslation} onChange={e => setHideTranslation(e.target.checked)} />
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
               <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${disableDictionaryClick ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                 {disableDictionaryClick && <Check size={16} strokeWidth={3} />}
               </div>
               <div>
                 <div className="font-bold text-slate-700">{language === 'en' ? 'Disable hint clicks' : 'Désactiver les clics sur les mots'}</div>
                 <div className="text-sm text-slate-500">{language === 'en' ? 'Prevent clicking on a phrase part to reveal the Thai word' : 'Empêcher de cliquer sur une partie de la phrase pour révéler le mot thaï'}</div>
               </div>
               <input type="checkbox" className="hidden" checked={disableDictionaryClick} onChange={e => setDisableDictionaryClick(e.target.checked)} />
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
               <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideCharacterHints ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                 {hideCharacterHints && <Check size={16} strokeWidth={3} />}
               </div>
               <div>
                 <div className="font-bold text-slate-700">{language === 'en' ? 'Hide character tips' : 'Cacher les petites astuces'}</div>
                 <div className="text-sm text-slate-500">{language === 'en' ? 'Hide the informative bulb tips between each character' : 'Cacher les indices du type 💡 qui apparaissent entre chaque caractère'}</div>
               </div>
               <input type="checkbox" className="hidden" checked={hideCharacterHints} onChange={e => setHideCharacterHints(e.target.checked)} />
            </label>

          </div>

        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
           <button 
             onClick={handleStart}
             disabled={(selectedWordIds !== null && selectedWordIds.length === 0) || completedLessons.length === 0}
             className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg py-4 rounded-xl border-b-4 border-emerald-700 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 uppercase tracking-widest"
           >
             {language === 'en' ? 'Start' : 'Commencer'}
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
