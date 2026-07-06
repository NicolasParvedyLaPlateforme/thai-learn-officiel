'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Check } from 'lucide-react';
import { Button } from "../ui/Button";
import { ResponsiveModal } from "../ui/ResponsiveModal";

export function ReviewConfigModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const { language, reviewConfig, setReviewConfig } = useProgressStore();

  const [showWordHints, setShowWordHints] = useState(reviewConfig.showWordHints);
  const [showUsefulVocab, setShowUsefulVocab] = useState(reviewConfig.showUsefulVocab);
  const [includeDistractors, setIncludeDistractors] = useState(reviewConfig.includeDistractors);

  // Synchronize on open
  useEffect(() => {
    if (isOpen) {
      setShowWordHints(reviewConfig.showWordHints);
      setShowUsefulVocab(reviewConfig.showUsefulVocab);
      setIncludeDistractors(reviewConfig.includeDistractors);
    }
  }, [isOpen, reviewConfig]);

  const handleStart = () => {
    setReviewConfig({
      showWordHints,
      showUsefulVocab,
      includeDistractors,
    });
    onClose();
    router.push('/review');
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation('auto.review_options', language)}
      footer={
        <Button variant="indigoGamified" size="lg" className="w-full rounded-xl uppercase tracking-widest" onClick={handleStart}>
          {getTranslation('auto.start_review', language)}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Option 1 */}
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${showWordHints ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-400'}`}>
            {showWordHints && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.word_hints_on_hover', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.show_translation_and_audio_whe', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={showWordHints} onChange={e => setShowWordHints(e.target.checked)} />
        </label>

        {/* Option 2 */}
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${showUsefulVocab ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-400'}`}>
            {showUsefulVocab && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.useful_vocabulary_block', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.show_the_list_of_words_involve', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={showUsefulVocab} onChange={e => setShowUsefulVocab(e.target.checked)} />
        </label>

        {/* Option 3 */}
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${includeDistractors ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-400'}`}>
            {includeDistractors && <Check size={16} strokeWidth={3} />}
          </div>
          <div>
            <div className="font-bold text-slate-700">{getTranslation('auto.false_answers_distractors', language)}</div>
            <div className="text-sm text-slate-500">{getTranslation('auto.include_wrong_choices_in_optio', language)}</div>
          </div>
          <input type="checkbox" className="hidden" checked={includeDistractors} onChange={e => setIncludeDistractors(e.target.checked)} />
        </label>
      </div>
    </ResponsiveModal>
  );
}