import { X } from "lucide-react";
import { Lesson } from "../../../types";
import { playThaiTTS } from "../../../lib/tts";

interface GlossaryModalProps {
  lesson: Lesson;
  language: string;
  showRomanization: boolean;
  onClose: () => void;
}

export default function GlossaryModal({
  lesson,
  language,
  showRomanization,
  onClose,
}: GlossaryModalProps) {
  return (
    <div className="absolute inset-0 z-[200] flex flex-col bg-white">
      <header className="h-16 px-8 flex items-center shrink-0 border-b border-slate-200 justify-between bg-white sticky top-0">
        <h2 className="text-xl font-bold text-slate-800">
          {language === "en" ? "Vocabulary List" : "Liste de vocabulaire"}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-2"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
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
                {language === "en" ? word.en || word.fr : word.fr}
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
                {language === "en" ? phrase.en || phrase.fr : phrase.fr}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
