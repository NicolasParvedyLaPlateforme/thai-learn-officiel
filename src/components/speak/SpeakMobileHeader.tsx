import { BookOpen } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";
import { HeaderActions } from '../layout/HeaderActions';

interface SpeakMobileHeaderProps {
  showHeader: boolean;
  language: string;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function SpeakMobileHeader({
  showHeader,
  language,
  setIsUnitsModalOpen,
  setIsMobileMenuOpen
}: SpeakMobileHeaderProps) {
  return (
    <header className={`bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden sticky top-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center justify-between w-full h-full px-4 md:px-8 gap-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUnitsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors md:hidden"
          >
            <BookOpen size={18} className="text-emerald-600" />
            <span className="font-extrabold text-slate-700 text-sm">{getTranslation('auto.units', language)}</span>
          </button>
        </div>

        <HeaderActions
          language={language}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          hideLanguageOnDesktop={false} // On désactive le md:hidden
        />
      </div>
    </header>
  );
}
