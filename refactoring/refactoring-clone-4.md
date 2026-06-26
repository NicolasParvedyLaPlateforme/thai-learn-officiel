# Opportunité de refactoring : Fonction dupliquée

Trouvé dans 2 emplacements différents.

## Emplacement 1
**Fichier :** `NicolasParvedyLaPlateforme-thai-learn-officiel-523025c/src/components/learn/LearnMobileHeader.tsx`
**Lignes :** 16 - 44

```tsx
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
            {/* <span className="font-extrabold text-slate-700 text-sm">{getTranslation('auto.units', language)}</span> */}
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
```

## Emplacement 2
**Fichier :** `NicolasParvedyLaPlateforme-thai-learn-officiel-523025c/src/components/speak/SpeakMobileHeader.tsx`
**Lignes :** 12 - 39

```tsx
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
```

