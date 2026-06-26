import BaseMobileHeader from '../path-ui/BaseMobileHeader';

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
    <BaseMobileHeader
      showHeader={showHeader}
      language={language}
      setIsUnitsModalOpen={setIsUnitsModalOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      showUnitsLabel={true}
    />
  );
}
