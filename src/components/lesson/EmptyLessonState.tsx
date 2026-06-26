import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { getTranslation } from "@/hooks/useTranslation";

interface EmptyLessonStateProps {
    language: string;
    messageKey?: string;
    onBack?: () => void;
}

export default function EmptyLessonState({
    language,
    messageKey = 'auto.you_must_complete_at_least_one',
    onBack
}: EmptyLessonStateProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push('/practice');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-4 text-center">
                {getTranslation('auto.no_completed_lessons', language)}
            </h1>
            <p className="text-slate-500 mb-8 text-center text-lg font-medium">
                {getTranslation(messageKey, language)}
            </p>

            <Button
                variant="flat"
                size="lg"
                className="flex-1 text-lg uppercase tracking-widest gap-2"
                onClick={handleBack}
            >
                <LogOut size={20} className="rotate-180" />
                {getTranslation('auto.back', language)}
            </Button>
        </div>
    );
}