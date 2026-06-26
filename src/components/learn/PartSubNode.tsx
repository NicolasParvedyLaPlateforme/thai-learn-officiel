import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PartNodeBubble } from './PartNodeBubble';

interface PartSubNodeProps {
    isMobile: boolean;
    partIdx: number;
    isPartAccessible: boolean;
    isPartCompleted: boolean;
    isNextPart: boolean;
    positionX: number;
    positionY: number;
    unitColor: string;
    unitText: string;
    lessonId: string;
    levelIndex: number;
    totalParts: number;
    stepsCount: number;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

export function PartSubNode({
    isMobile,
    partIdx,
    isPartAccessible,
    isPartCompleted,
    isNextPart,
    positionX,
    positionY,
    unitColor,
    unitText,
    lessonId,
    levelIndex,
    totalParts,
    stepsCount,
    isOpen,
    onToggle,
    onClose
}: PartSubNodeProps) {
    const containerClass = isMobile
        ? "flex lg:hidden absolute left-1/2 top-1/2 z-20"
        : "hidden lg:block absolute left-1/2 top-1/2 z-20";

    const btnSizeClass = isMobile ? "w-10 h-10" : "w-11 h-11";
    const iconSize = isMobile ? 16 : 18;

    const btnStateClass = !isPartAccessible
        ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
        : isPartCompleted
            ? `${unitColor} border-white text-white hover:scale-110 active:scale-95`
            : isNextPart
                ? `bg-white ${unitColor.replace('bg-', 'border-')} ${unitText} hover:scale-110 animate-pulse`
                : "bg-white border-slate-300 text-slate-400 hover:scale-105";

    const btnActiveClass = isOpen ? `scale-110 ring-2 ring-offset-2 ${unitColor.replace('bg-', 'ring-')}` : "";

    return (
        <div
            className={containerClass}
            style={{ transform: `translate(calc(-50% + ${positionX}px), calc(-50% + ${positionY}px))` }}
        >
            <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isPartAccessible) return;
                        onToggle();
                    }}
                    disabled={!isPartAccessible}
                    title={`Partie ${partIdx + 1}`}
                    className={[
                        btnSizeClass,
                        'rounded-full flex items-center justify-center transition-all duration-200',
                        'border-[3px] shadow-lg font-black text-[11px] tracking-wide',
                        btnStateClass,
                        btnActiveClass,
                    ].join(' ')}
                >
                    {isPartCompleted ? (
                        <CheckCircle2 size={iconSize} className="stroke-[2.5]" />
                    ) : (
                        <span>P{partIdx + 1}</span>
                    )}
                </button>

                {isOpen && isPartAccessible && (
                    <PartNodeBubble
                        lessonId={lessonId}
                        levelIndex={levelIndex}
                        partIndex={partIdx}
                        totalParts={totalParts}
                        stepsCount={stepsCount}
                        isCompleted={isPartCompleted}
                        unitColor={unitColor}
                        unitText={unitText}
                        nodeX={positionX}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}