'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useProgressStore } from "@/lib/store";
import { X, Check } from 'lucide-react';
import { Drawer } from 'vaul';

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

  const handleStart = () => {
    setReviewConfig({
      showWordHints,
      showUsefulVocab,
      includeDistractors,
    });
    onClose();
    router.push('/review');
  };

  const renderContent = () => (
    <>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-extrabold text-slate-800">
          {getTranslation('auto.review_options', language)}
        </h2>
        <button 
           onClick={onClose}
           className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar">
          
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

      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50">
         <button 
           onClick={handleStart}
           className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg py-4 rounded-xl border-b-4 border-indigo-700 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 uppercase tracking-widest"
         >
           {getTranslation('auto.start_review', language)}
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
