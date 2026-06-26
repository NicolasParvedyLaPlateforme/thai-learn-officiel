'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Word, Phrase } from "@/types";
import { Check } from 'lucide-react';
import { getVocabularyServer, getLightweightLessons } from "@/actions/course";
import { Button } from "../ui/Button";
import { ResponsiveModal } from "../ui/ResponsiveModal";

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

  useEffect(() => {
    if (isOpen) {
      setSelectedLessonId(writingConfig.lessonId);
      setSelectedWordIds(writingConfig.selectedWordIds);
      setHideThai(writingConfig.hideThai);
      setHideTranslation(writingConfig.hideTranslation);
      setDisableDictionaryClick(writingConfig.disableDictionaryClick);
      setHideCharacterHints(writingConfig.hideCharacterHints);

      getLightweightLessons().then(setLessonsList);
    }
  }, [isOpen, writingConfig]);

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

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation('auto.writing_configuration', language)}
      footer={
        <Button variant="gamified" size="lg" className="w-full rounded-xl uppercase tracking-widest" onClick={handleStart} disabled={(selectedWordIds !== null && selectedWordIds.length === 0) || completedLessons.length === 0} >
          {getTranslation('auto.start', language)}
        </Button>
      }
    >
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {getTranslation('auto.lesson_to_practice', language)}
        </h3>
        <select
          value={selectedLessonId}
          onChange={(e) => {
            setSelectedLessonId(e.target.value);
            setSelectedWordIds(null);
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

      {(isLoadingVocab || currentVocabulary.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation('auto.vocabulary', language)}
            </h3>
            <div className="flex gap-2">
              <button onClick={selectAll} disabled={isLoadingVocab} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md disabled:opacity-50">
                {getTranslation('auto.all', language)}
              </button>
              <button onClick={deselectAll} disabled={isLoadingVocab} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md disabled:opacity-50">
                {getTranslation('auto.none', language)}
              </button>
            </div>
          </div>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl max-h-48 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {isLoadingVocab ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center text-left gap-3 p-2 rounded-lg">
                  <div className="w-5 h-5 rounded border border-slate-200 bg-slate-200 animate-pulse shrink-0"></div>
                  <div className="flex flex-col min-w-0 flex-1 gap-1.5 py-1">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              currentVocabulary.map(item => (
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
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {getTranslation('auto.difficulty_options', language)}
        </h3>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideThai ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
            {hideThai && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.hide_thai_translation', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.do_not_display_the_thai_charac', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={hideThai} onChange={e => setHideThai(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideTranslation ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
            {hideTranslation && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.hide_standard_translation', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.only_show_the_phonetic_spellin', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={hideTranslation} onChange={e => setHideTranslation(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${disableDictionaryClick ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
            {disableDictionaryClick && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.disable_hint_clicks', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.prevent_clicking_on_a_phrase_p', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={disableDictionaryClick} onChange={e => setDisableDictionaryClick(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${hideCharacterHints ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
            {hideCharacterHints && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.hide_character_tips', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.hide_the_informative_bulb_tips', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={hideCharacterHints} onChange={e => setHideCharacterHints(e.target.checked)} />
        </label>
      </div>
    </ResponsiveModal>
  );
}