import { BookOpen, ChevronDown } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface BannerUnitsButtonProps {
  onClick: () => void;
  language: string;
  className?: string;
}

export default function BannerUnitsButton({ onClick, language, className }: BannerUnitsButtonProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-xl transition-all shadow-sm active:scale-95 text-white",
        className
      )}
    >
      <BookOpen size={16} />
      <span className="font-extrabold text-[13px] tracking-wide">{getTranslation('auto.units', language) || "Unités"}</span>
      <ChevronDown size={16} />
    </button>
  );
}
