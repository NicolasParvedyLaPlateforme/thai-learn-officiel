import BaseMobileHeader from '../path-ui/BaseMobileHeader';

interface LearnMobileHeaderProps {
  showHeader: boolean;
  mounted: boolean; // unused but kept for compatibility
  language: string;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function LearnMobileHeader({
  showHeader,
  language,
  setIsUnitsModalOpen,
  setIsMobileMenuOpen
}: LearnMobileHeaderProps) {
  return (
    <BaseMobileHeader
      showHeader={showHeader}
      language={language}
      setIsUnitsModalOpen={setIsUnitsModalOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      showUnitsLabel={false}
    />
  );
}
