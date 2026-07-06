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
    // 1. Remplacement des hauteurs fixes (h-12) par des hauteurs minimales (min-h-[3rem])
    // Ajout de max-w-full et h-auto pour permettre l'expansion fluide
    const baseClasses = "rounded-2xl font-medium flex flex-col items-center justify-center min-w-[3rem] sm:min-w-[4rem] min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem] h-auto px-3 py-2 font-thai border-2 border-slate-200 max-w-full transition-all duration-200";

    // 2. Logique de taille de texte dynamique selon la longueur de la chaîne
    const getDynamicTextSize = (content: React.ReactNode) => {
        if (typeof content === 'string') {
            if (content.length > 18) return "text-sm sm:text-base"; // Phrases très longues
            if (content.length > 10) return "text-lg sm:text-xl";   // Mots longs / Petites phrases
        }
        return "text-2xl sm:text-3xl"; // Taille par défaut pour les mots courts
    };

    // 3. Classes de texte communes (alignement, wrap, hauteur de ligne adaptée)
    // On utilise leading-tight plutôt que leading-none pour que le texte sur plusieurs lignes ne se chevauche pas.
    const textClasses = `leading-tight text-center break-words whitespace-normal max-w-full ${getDynamicTextSize(text)}`;

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
            <div className={`bg-slate-100 text-slate-500 border-2 border-slate-200 pointer-events-none ${baseClasses} ${className}`}>
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
                className={`bg-white text-slate-700 border-2 border-slate-200 border-b-4 shadow-sm ${baseClasses} ${className}`}
            >
                <span className={textClasses}>{text}</span>
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
            className={`${textColorClass} ${borderColorClass} ${baseClasses} ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-px'} ${className}`}
        >
            <span className={textClasses}>{text}</span>
        </button>
    );
};