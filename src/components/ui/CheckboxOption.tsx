import { Check } from "lucide-react";

// Ajoute ceci en dehors de ta fonction WritingConfigModal
interface CheckboxOptionProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    title: string;
    description: string;
}

const CheckboxOption = ({ checked, onChange, title, description }: CheckboxOptionProps) => {
    return (
        <label className="flex items-start gap-4 cursor-pointer group">
            <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                {checked && <Check size={16} strokeWidth={3} />}
            </div>
            <div>
                <div className="font-bold text-slate-700">{title}</div>
                <div className="text-sm text-slate-500">{description}</div>
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
        </label>
    );
};

export default CheckboxOption