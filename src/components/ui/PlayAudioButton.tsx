import { Volume2 } from 'lucide-react';
import { playThaiTTS } from "@/lib/tts";
import { getTranslation } from "@/hooks/useTranslation";

interface PlayAudioButtonProps {
    text: string;
    language: string;
    className?: string;
}

export const PlayAudioButton = ({ text, language, className = "" }: PlayAudioButtonProps) => {
    return (
        <button
            onClick={() => playThaiTTS(text)}
            className={`text-emerald-500 hover:text-emerald-600 bg-emerald-50 p-2 rounded-full transition-colors flex-shrink-0 ${className}`}
            title={getTranslation('auto.listen_to_full_phrase', language)}
        >
            <Volume2 size={24} strokeWidth={2.5} />
            <span className="sr-only">{"Écouter l'audio"}</span>
        </button>
    );
};