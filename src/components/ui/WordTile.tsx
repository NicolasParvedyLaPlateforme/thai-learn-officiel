import React from 'react';
import { m as motion } from "motion/react";

interface WordTileProps {
    text?: React.ReactNode;
    variant?: 'dots' | 'blank' | 'filled' | 'interactive' | 'scored' | 'bank';
    status?: 'default' | 'correct' | 'incorrect' | 'perfect' | 'good' | 'bad';
    score?: number;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    layoutId?: string;
}

export const WordTile: React.FC<WordTileProps> = ({
    text,
    variant = 'interactive',
    status = 'default',
    score,
    onClick,
    disabled = false,
    className = '',
    layoutId
}) => {
    // Flat design base classes: rounded-xl, thin border, proper padding
    const baseClasses = "rounded-xl font-medium flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[4rem] min-h-[3rem] sm:min-h-[3.5rem] h-auto px-4 py-2 font-thai max-w-full transition-all duration-200 border border-slate-200";

    const getDynamicTextSize = (content: React.ReactNode) => {
        if (typeof content === 'string') {
            if (content.length > 18) return "text-sm sm:text-base";
            if (content.length > 10) return "text-base sm:text-lg";
        }
        return "font-thai font-normal text-3xl sm:text-4xl ";
    };

    const textClasses = `leading-tight text-center break-words whitespace-normal max-w-full ${getDynamicTextSize(text)}`;

    if (variant === 'dots') {
        return (
            <div className={`bg-transparent border-dashed border-slate-300 text-slate-400 ${baseClasses} ${className}`}>
                <span className="leading-none text-xl">...</span>
            </div>
        );
    }

    if (variant === 'blank') {
        return (
            <div className={`bg-transparent border-dashed border-slate-300 text-slate-400 ${baseClasses} ${className}`}>
                <span className="leading-none text-xl sm:text-2xl font-sans text-slate-300">—</span>
            </div>
        );
    }

    if (variant === 'filled') {
        return (
            <div className={`bg-slate-100 text-slate-600 border-slate-200 pointer-events-none ${baseClasses} ${className}`}>
                <span className={textClasses}>{text}</span>
            </div>
        );
    }

    if (variant === 'bank') {
        const Comp = layoutId ? motion.div : 'div';
        return (
            // @ts-ignore - framer-motion props
            <Comp
                layoutId={layoutId}
                className={`bg-white text-slate-800 shadow-sm hover:shadow-md ${baseClasses} ${className}`}
            >
                <span className={textClasses}>{text}</span>
            </Comp>
        );
    }

    if (variant === 'scored') {
        let colorClass = "text-emerald-700 border-emerald-300 bg-emerald-50";
        if (status === 'bad') colorClass = "text-rose-700 border-rose-300 bg-rose-50";
        else if (status === 'good') colorClass = "text-amber-700 border-amber-300 bg-amber-50";

        const Comp = layoutId ? motion.div : 'div';

        return (
            // @ts-ignore - framer-motion props
            <Comp
                layoutId={layoutId}
                className={`shadow-sm ${colorClass} ${baseClasses} ${className}`}
            >
                <span className={textClasses}>{text}</span>
                {score !== undefined && score < 100 && (
                    <span className="text-[10px] font-bold mt-1 opacity-80 font-sans">{score}%</span>
                )}
            </Comp>
        );
    }

    // Default Interactive Variant
    let textColorClass = "text-slate-800";
    let borderColorClass = "border-slate-200 bg-white";

    if (status === 'correct') {
        textColorClass = "text-emerald-700";
        borderColorClass = "border-emerald-400 bg-emerald-50";
    } else if (status === 'incorrect') {
        textColorClass = "text-rose-600";
        borderColorClass = "border-rose-300 bg-rose-50";
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${textColorClass} ${borderColorClass} ${baseClasses} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-50 active:scale-[0.98]'} ${className}`}
        >
            <span className={textClasses}>{text}</span>
        </button>
    );
};