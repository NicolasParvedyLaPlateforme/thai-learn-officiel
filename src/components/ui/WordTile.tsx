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
    const baseClasses = "rounded-2xl font-medium flex items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-14 md:h-16 px-2 sm:px-3 font-thai";

    if (variant === 'dots') {
        return (
            <div className={`bg-transparent border-2 border-dashed border-slate-300 text-slate-400 ${baseClasses} ${className}`}>
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
            <div className={`bg-slate-100 text-slate-500 text-center border-2 border-slate-200 pointer-events-none ${baseClasses} ${className}`}>
                <span className="leading-none text-2xl sm:text-3xl">{text}</span>
            </div>
        );
    }

    if (variant === 'bank') {
        const Comp = layoutId ? motion.div : 'div';
        return (
            // @ts-ignore - framer-motion props
            <Comp
                layoutId={layoutId}
                className={`bg-white text-slate-700 border-2 border-slate-200 border-b-4 shadow-sm py-2 ${baseClasses} ${className}`}
            >
                <span className="text-3xl font-medium leading-none">{text}</span>
            </Comp>
        );
    }

    if (variant === 'scored') {
        let colorClass = "text-emerald-700 border-emerald-300 bg-emerald-50";
        if (status === 'bad') colorClass = "text-red-700 border-red-300 bg-red-50";
        else if (status === 'good') colorClass = "text-amber-700 border-amber-300 bg-amber-50";

        const Comp = layoutId ? motion.div : 'div';

        return (
            // @ts-ignore - framer-motion props
            <Comp
                layoutId={layoutId}
                className={`flex flex-col border-2 shadow-sm py-2 ${colorClass} ${baseClasses} ${className}`}
            >
                <span className="text-3xl font-medium leading-none">{text}</span>
                {score !== undefined && score < 100 && (
                    <span className="text-[10px] font-bold mt-1 opacity-80 font-sans">{score}%</span>
                )}
            </Comp>
        );
    }

    // Default Interactive Variant
    let textColorClass = "text-slate-700";
    let borderColorClass = "border-slate-200";

    if (status === 'correct') {
        textColorClass = "text-emerald-600";
        borderColorClass = "border-emerald-500 border-b-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]";
    } else if (status === 'incorrect') {
        textColorClass = "text-rose-500";
        borderColorClass = "border-rose-300";
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={` ${textColorClass} ${borderColorClass} ${baseClasses} ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
        >
            <span className="leading-none text-2xl sm:text-3xl">{text}</span>
        </button>
    );
};