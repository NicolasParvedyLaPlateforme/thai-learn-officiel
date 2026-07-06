import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { Check } from "lucide-react";
import { Word, Phrase } from "@/types";

interface VocabularySelectorProps {
    isLoading: boolean;
    vocabulary: (Word | Phrase)[];
    selectedWordIds: string[] | null;
    onToggleWord: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    language: string;
}

export function VocabularySelector({
    isLoading,
    vocabulary,
    selectedWordIds,
    onToggleWord,
    onSelectAll,
    onDeselectAll,
    language
}: VocabularySelectorProps) {
    if (!isLoading && vocabulary.length === 0) return null;

    const isWordSelected = (id: string) => {
        if (selectedWordIds === null) return true;
        return selectedWordIds.includes(id);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {getTranslation('auto.vocabulary', language)}
                </h3>
                <div className="flex gap-2">
                    <button onClick={onSelectAll} disabled={isLoading} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md disabled:opacity-50">
                        {getTranslation('auto.all', language)}
                    </button>
                    <button onClick={onDeselectAll} disabled={isLoading} className="text-xs font-bold text-slate-500 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md disabled:opacity-50">
                        {getTranslation('auto.none', language)}
                    </button>
                </div>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl max-h-48 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="flex items-center text-left gap-3 p-2 rounded-lg">
                            <div className="w-5 h-5 rounded border border-slate-200 bg-slate-200 animate-pulse shrink-0"></div>
                            <div className="flex flex-col min-w-0 flex-1 gap-1.5 py-1">
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
                                <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    vocabulary.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggleWord(item.id)}
                            className="flex items-center text-left gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isWordSelected(item.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'}`}>
                                {isWordSelected(item.id) && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-thai text-lg truncate">{item.th}</span>
                                <span className="text-xs text-slate-500 truncate">{getLocalizedField(item, '', language)}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}