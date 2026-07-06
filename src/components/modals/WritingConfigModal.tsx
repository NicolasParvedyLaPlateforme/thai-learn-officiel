'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Word, Phrase } from "@/types";
import { getVocabularyServer, getLightweightLessons } from "@/actions/course";
import { Button } from "../ui/Button";
import { ResponsiveModal } from "../ui/ResponsiveModal";
import CheckboxOption from "../ui/CheckboxOption";
import { VocabularySelector } from "../ui/VocabularySelector";
import { LessonSelector } from "../ui/LessonSelector";

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

      <VocabularySelector
        isLoading={isLoadingVocab}
        vocabulary={currentVocabulary}
        selectedWordIds={selectedWordIds}
        onToggleWord={toggleWordSelection}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        language={language}
      />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {getTranslation('auto.difficulty_options', language)}
        </h3>

        <label className="flex items-start gap-4 cursor-pointer group">
          <CheckboxOption
            checked={hideThai}
            onChange={setHideThai}
            title={getTranslation('auto.hide_thai_translation', language)}
            description={getTranslation('auto.do_not_display_the_thai_charac', language)}
          />
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.hide_thai_translation', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.do_not_display_the_thai_charac', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={hideThai} onChange={e => setHideThai(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <CheckboxOption
            checked={hideTranslation}
            onChange={setHideTranslation}
            title={getTranslation('auto.hide_standard_translation', language)}
            description={getTranslation('auto.only_show_the_phonetic_spellin', language)}
          />
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.hide_standard_translation', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.only_show_the_phonetic_spellin', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={hideTranslation} onChange={e => setHideTranslation(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <CheckboxOption
            checked={disableDictionaryClick}
            onChange={setDisableDictionaryClick}
            title={getTranslation('auto.disable_hint_clicks', language)}
            description={getTranslation('auto.prevent_clicking_on_a_phrase_p', language)}
          />
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.disable_hint_clicks', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.prevent_clicking_on_a_phrase_p', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={disableDictionaryClick} onChange={e => setDisableDictionaryClick(e.target.checked)} />
        </label>

        <label className="flex items-start gap-4 cursor-pointer group">
          <CheckboxOption
            checked={hideCharacterHints}
            onChange={setHideCharacterHints}
            title={getTranslation('auto.hide_character_tips', language)}
            description={getTranslation('auto.hide_the_informative_bulb_tips', language)}
          />
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