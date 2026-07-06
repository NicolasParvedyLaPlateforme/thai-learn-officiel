import { X } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";

interface ExerciseHeaderProps {
    progress: number;
    onClose: () => void;
    title: string;
    showRomanization?: boolean;
    onToggleRomanization?: () => void;
    forceHideRomanization?: boolean;
    language: string;
}

export default function ExerciseHeader({
    progress,
    onClose,
    title,
    showRomanization,
    onToggleRomanization,
    forceHideRomanization,
    language
}: ExerciseHeaderProps) {
    return (
        <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
            <div className="flex items-center gap-6 w-full max-w-2xl mx-auto h-full px-4 flex-1">
                <button
                    onClick={onClose}
                    aria-label={"Fermer l'exercice"}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {!forceHideRomanization && onToggleRomanization && showRomanization !== undefined && (
                    <button
                        onClick={onToggleRomanization}
                        className={`mr-2 w-9 h-9 flex flex-col items-center justify-center rounded-xl font-bold border-2 transition-colors ${showRomanization ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "border-slate-200 text-slate-400 bg-white hover:bg-slate-100"}`}
                        title={showRomanization ? getTranslation('auto.hide_pronunciation', language) : getTranslation('auto.show_pronunciation', language)}
                    >
                        <span className="text-xs font-mono">{showRomanization ? 'aA' : 'ก'}</span>
                    </button>
                )}
                <div className="font-bold text-slate-400">{title}</div>
            </div>
        </header>
    );
}