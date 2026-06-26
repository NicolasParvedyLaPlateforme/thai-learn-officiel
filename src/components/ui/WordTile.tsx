import React from 'react';

interface WordTileProps {
    text?: React.ReactNode;
    variant?: 'dots' | 'blank' | 'filled' | 'interactive';
    status?: 'default' | 'correct' | 'incorrect';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export const WordTile: React.FC<WordTileProps> = ({
    text,
    variant = 'interactive',
    status = 'default',
    onClick,
    disabled = false,
    className = ''
}) => {
    const baseClasses = "rounded-xl font-medium flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-16 px-2 sm:px-3";

    if (variant === 'dots') {
        return (
            <div className={`bg-transparent border-2 border-dashed border-slate-300 text-slate-400 font-thai ${baseClasses} ${className}`}>
                <span className="leading-none text-2xl sm:text-3xl">...</span>
            </div>
        );
    }

    if (variant === 'blank') {
        return (
            <div className={`bg-transparent border-2 border-dashed border-slate-300 text-slate-400 ${baseClasses} ${className}`}>
                <span className="leading-none text-xl sm:text-2xl opacity-50 font-sans">___</span>
            </div>
        );
    }

    if (variant === 'filled') {
        return (
            <div className={`bg-slate-100 text-slate-500 text-center border-2 border-slate-200 font-thai pointer-events-none ${baseClasses} ${className}`}>
                <span className="leading-none text-2xl sm:text-3xl">{text}</span>
            </div>
        );
    }

    let textColorClass = "text-slate-700";
    let borderColorClass = "border-slate-200";

    if (status === 'correct') {
        textColorClass = "text-emerald-600";
    } else if (status === 'incorrect') {
        textColorClass = "text-rose-500";
        borderColorClass = "border-rose-300";
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`bg-white text-center border-2 border-b-4 ${textColorClass} ${borderColorClass} shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 font-thai ${baseClasses} ${disabled ? 'opacity-70 cursor-not-allowed hover:translate-y-0' : ''} ${className}`}
        >
            <span className="leading-none text-2xl sm:text-3xl">{text}</span>
        </button>
    );
};