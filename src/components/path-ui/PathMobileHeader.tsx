import { BookOpen, User, Menu, Globe, Mic, Coins, Star, Flame } from 'lucide-react';
import Link from 'next/link';
import PWAInstallButton from '../ui/PWAInstallButton';
import { getTranslation } from "@/hooks/useTranslation";
import { useProgressStore } from "@/lib/store";
import { Typography } from '../ui/Typography';

interface PathMobileHeaderProps {
  showHeader: boolean;
  mounted: boolean;
  language: string;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  pageTitleKey?: string;
  pathType?: 'learn' | 'alphabet' | 'speak';
}

export default function PathMobileHeader({
  showHeader,
  mounted,
  language,
  setIsUnitsModalOpen,
  setIsMobileMenuOpen,
  pageTitleKey = 'sidebar.vocabulary',
  pathType = 'learn'
}: PathMobileHeaderProps) {
  const { xp, goldCoins, currentStreak } = useProgressStore();

  return (
    <header className={`bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[calc(3.75rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden sticky top-0 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="flex items-center w-full h-full px-4 md:px-8">

        {/* GAUCHE : Compte toujours pour 2 blocs (flex-1 assure 50% de l'espace dispo) */}
        <div className="flex-2 flex items-center justify-start z-10">
          {/* Slot 1 : PWA (Espace toujours réservé même si le composant renvoie null) */}
          <div className="w-8 flex items-center justify-start mr-2">
            {mounted && <PWAInstallButton />}
          </div>

          {/* Slot 2 : Langue */}
          <div className="w-8 flex items-center justify-start">
            {mounted && (
              <button
                onClick={() => useProgressStore.getState().setShowLanguageModal(true)}
                className="flex items-center justify-center text-slate-500 font-extrabold text-sm uppercase"
              >
                {language}
              </button>
            )}
          </div>
        </div>

        {/* CENTRE : Statistiques (shrink-0 l'empêche de s'écraser) */}
        <div className="shrink-0 flex items-center justify-center z-0">
          {mounted && (
            <div className='flex items-center gap-4 bg-slate-100 rounded-full px-4 py-1.5'>
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <Typography variant="small" className="text-slate-800 leading-none">{xp}</Typography>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins size={16} className="text-yellow-400 fill-yellow-400" />
                <Typography variant="small" className="text-slate-800 leading-none">{goldCoins || 0}</Typography>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame size={16} className={currentStreak > 0 ? 'text-orange-400 fill-orange-400' : 'text-slate-300'} />
                <Typography variant="small" className={`${currentStreak > 0 ? 'text-slate-800' : 'text-slate-400'} leading-none`}>{currentStreak}</Typography>
              </div>
            </div>
          )}
        </div>

        {/* DROITE : Compte toujours pour 2 blocs (Miroir parfait de la gauche) */}
        <div className="flex-2 flex items-center justify-end z-10">
          {/* Slot Fantôme (Vide) : Équilibre le bouton "Langue" de gauche */}
          <div className="w-8"></div>

          {/* Slot Menu Burger : Équilibre le bouton "PWA" de gauche */}
          <div className="w-8 flex items-center justify-end">
            {mounted && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center justify-end py-2 text-slate-600 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}