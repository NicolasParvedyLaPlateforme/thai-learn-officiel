import { BookOpen, User, Menu } from 'lucide-react';
import Link from 'next/link';
import PWAInstallButton from '../../components/PWAInstallButton';
import { getTranslation } from '../../hooks/useTranslation';
import { useProgressStore } from '../../lib/store';

interface LearnMobileHeaderProps {
  showHeader: boolean;
  mounted: boolean;
  language: string;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function LearnMobileHeader({
  showHeader,
  mounted,
  language,
  setIsUnitsModalOpen,
  setIsMobileMenuOpen
}: LearnMobileHeaderProps) {
  return (
    <header className={`bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[calc(3.75rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden sticky top-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
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

        <div className="flex items-center gap-2">
          {mounted && <PWAInstallButton />}
          {mounted && (
            <button
              onClick={() => useProgressStore.getState().setShowLanguageModal(true)}
              className="flex items-center justify-center px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-extrabold text-sm hover:bg-slate-200 transition-colors uppercase"
            >
              {language}
            </button>
          )}

          {mounted && (
            <div className="flex items-center gap-2 relative">
              <Link
                href="/profile"
                className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <User size={18} />
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center justify-center p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
