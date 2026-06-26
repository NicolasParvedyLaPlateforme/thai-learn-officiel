import { AlphabetItem } from "@/data/alphabet-data";
import { getLocalizedField } from "@/hooks/useTranslation";
import { formatCombiningChar } from "@/lib/alphabet-utils";

interface AlphabetExerciseOptionProps {
    opt: AlphabetItem;
    isSelected: boolean;
    isCorrectState: boolean | null;
    language: string;
    onClick: () => void;
}

export const AlphabetExerciseOption = ({
    opt,
    isSelected,
    isCorrectState,
    language,
    onClick
}: AlphabetExerciseOptionProps) => {
    const getOptionColorClass = (opt: AlphabetItem, isSelected: boolean, isCorrectState: boolean | null) => {
        if (isSelected) {
            if (isCorrectState === true) return 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md';
            if (isCorrectState === false) return 'border-rose-500 bg-rose-50 text-rose-600 shadow-md';
            return 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm';
        }
        if (opt.type === 'vowel') return 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50';
        switch (opt.consonantClass) {
            case 'low': return 'border-blue-200 bg-white text-blue-500 hover:bg-blue-50';
            case 'mid': return 'border-teal-200 bg-white text-teal-600 hover:bg-teal-50';
            case 'high': return 'border-orange-200 bg-white text-orange-500 hover:bg-orange-50';
            default: return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
        }
    };

    return (
        <button
            onClick={onClick}
            className={`
        aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden p-2 md:p-3
        group
        ${isCorrectState !== null ? 'cursor-default' : 'hover:-translate-y-1 cursor-pointer active:scale-95 shadow-sm hover:shadow-md'}
        ${getOptionColorClass(opt, isSelected, isCorrectState)}
      `}
        >
            <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-2 md:mt-4">
                <span className="text-4xl md:text-6xl font-medium z-10 drop-shadow-sm font-thai">
                    {formatCombiningChar(opt.letter)}
                </span>
            </div>
            {(opt.mnemonicHintEn || opt.mnemonicHintFr) && (
                <span className="w-full text-center text-[10px] md:text-xs leading-tight px-0.5 opacity-90 font-semibold mt-1 md:mt-2 mb-1 hidden sm:block">
                    {getLocalizedField(opt, 'mnemonicHint', language)}
                </span>
            )}
        </button>
    );
};