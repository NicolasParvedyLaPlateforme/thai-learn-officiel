import { X } from 'lucide-react';

interface PracticeHeaderProps {
    progress: number;
    title: string;
    onClose: () => void;
    colorClass?: string;
    shadowClass?: string;
}

export default function PracticeHeader({
    progress,
    title,
    onClose,
    colorClass = 'bg-indigo-500',
    shadowClass = 'shadow-[0_0_8px_rgba(99,102,241,0.3)]'
}: PracticeHeaderProps) {
    return (
        <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
            <div className="flex items-center gap-6 w-full max-w-2xl mx-auto h-full px-4 flex-1">
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={24} strokeWidth={2.5} />
                </button>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`${colorClass} h-full transition-all duration-500 rounded-full ${shadowClass}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="font-bold text-slate-400">{title}</div>
            </div>
        </header>
    );
}