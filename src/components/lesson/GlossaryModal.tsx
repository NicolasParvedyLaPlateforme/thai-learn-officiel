import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Lesson } from "@/types";
import { playThaiTTS } from "@/lib/tts";

interface GlossaryModalProps {
  lesson: Lesson;
  language: string;
  showRomanization: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function GlossaryModal({
  lesson,
  language,
  showRomanization,
  isOpen,
  onClose,
}: GlossaryModalProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const content = (
    <div className="max-w-3xl mx-auto space-y-4">
      {lesson.words.map((word) => (
        <div
          key={word.id}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-colors cursor-pointer"
          onClick={() => playThaiTTS(word.th)}
        >
          <div>
            <div className="text-xl font-thai font-semibold text-emerald-600">
              {word.th}
            </div>
            {showRomanization && (
              <div className="text-sm font-bold text-slate-500 mt-1">
                {word.phonetic}
              </div>
            )}
          </div>
          <div className="text-right text-slate-700 font-medium">
            {getLocalizedField(word, '', language)}
          </div>
        </div>
      ))}
      {lesson.phrases.map((phrase) => (
        <div
          key={phrase.id}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between hover:border-emerald-200 transition-colors cursor-pointer gap-2"
          onClick={() => playThaiTTS(phrase.th)}
        >
          <div>
            <div className="text-xl font-thai font-semibold text-emerald-600">
              {phrase.th}
            </div>
            {showRomanization && (
              <div className="text-sm font-bold text-slate-500 mt-1">
                {phrase.phonetic}
              </div>
            )}
          </div>
          <div className="sm:text-right text-slate-700 font-medium">
            {getLocalizedField(phrase, '', language)}
          </div>
        </div>
      ))}

      <div className="pt-6 pb-8">
        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-300 transition-colors text-lg shadow-sm"
        >
          {getTranslation('auto.close_list', language)}
        </button>
      </div>
    </div>
  );

  const headerContent = (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between h-full">
      <h2 className="text-xl font-bold text-slate-800">
        {getTranslation('auto.vocabulary_list', language)}
      </h2>
      <button
        onClick={onClose}
        className="text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors text-sm"
      >
        {getTranslation('auto.close', language)}
      </button>
    </div>
  );

  if (!isMobile) {
    if (!isOpen) return null;
    return (
      <div className="absolute inset-0 z-[200] flex flex-col bg-white">
        <header className="h-16 px-4 md:px-8 shrink-0 border-b border-slate-200 bg-white sticky top-0 flex items-center justify-center">
          {headerContent}
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[200] max-h-[90vh] h-full outline-none">
          <Drawer.Title className="sr-only">Vocabulary List</Drawer.Title>
          <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
            <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
          </div>
          <header className="h-20 pt-4 px-4 shrink-0 border-b border-slate-200 bg-white sticky top-0 flex items-center justify-center">
            {headerContent}
          </header>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {content}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
