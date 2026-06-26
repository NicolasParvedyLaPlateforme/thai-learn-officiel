import React from 'react';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface DesktopUnitHeaderProps {
    unit: any;
    language: string;
    completedLevels: number;
    maxLevels: number;
    progressPercent: number;
    mounted: boolean;
    masteryKey: string;
    levelsDescription: React.ReactNode;
    onOpenUnitsList: () => void;
}

export const DesktopUnitHeader: React.FC<DesktopUnitHeaderProps> = ({
    unit,
    language,
    completedLevels,
    maxLevels,
    progressPercent,
    mounted,
    masteryKey,
    levelsDescription,
    onOpenUnitsList,
}) => {
    return (
        <div
            onClick={(e) => { e.stopPropagation(); onOpenUnitsList(); }}
            className={`p-8 md:p-10 ${unit.colorClass} rounded-3xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative overflow-hidden cursor-pointer transition-transform min-h-[220px] flex items-center group`}
        >
            {unit.imageUrl && (
                <div
                    className="absolute top-0 right-0 bottom-0 w-[80%] md:w-[70%] z-0 pointer-events-none overflow-hidden"
                    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)', maskImage: 'linear-gradient(to right, transparent 0%, black 40%)' }}
                >
                    <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" priority />
                </div>
            )}

            <div className="relative z-10 w-full md:w-[65%] lg:w-[60%] pr-4 md:pr-8">
                <div className="flex justify-between items-start mb-2">
                    <Typography variant="h2" className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                        {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
                    </Typography>
                </div>
                <Typography variant="p" className={`${unit.lightTextClass || 'text-white/90'} mb-8 font-medium text-lg leading-snug drop-shadow-sm max-w-xl`}>
                    {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
                </Typography>

                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <div className={`flex flex-col`}>
                            <div className={`text-sm text-white font-bold mb-2 flex justify-between uppercase tracking-wide drop-shadow-sm`}>
                                <span>{getTranslation(masteryKey, language)}</span>
                                <span>{completedLevels} / {maxLevels} {getTranslation('auto.levels', language)}</span>
                            </div>
                            <div className={`w-full bg-black/20 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner mb-2`}>
                                <div
                                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left`}
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className={`text-[11px] ${unit.lightTextClass || 'text-white/80'} font-bold drop-shadow-sm`}>
                                {levelsDescription}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {!unit.imageUrl && (
                <div className={`absolute -bottom-10 -right-10 opacity-10 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
                    <BookOpen size={200} />
                </div>
            )}

            <div className="absolute bottom-6 right-6 z-20 hidden md:block">
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => { e.stopPropagation(); onOpenUnitsList(); }}
                    className="flex items-center justify-between p-3.5 pr-4 bg-white/80 backdrop-blur-lg border border-white/60 rounded-[1.25rem] shadow-lg transition-all duration-300 group cursor-pointer min-w-[240px] h-auto hover:bg-white"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100`}>
                            <BookOpen size={20} className={`text-slate-500`} />
                        </div>
                        <div className="flex flex-col text-left whitespace-normal">
                            <span className="font-extrabold text-[15px] text-slate-800 tracking-tight leading-tight">
                                {getTranslation('auto.course_units', language)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                                {getTranslation('auto.change_or_view_units', language)}
                            </span>
                        </div>
                    </div>
                    <div className="w-8 h-8 ml-4 rounded-full bg-slate-50 group-hover:bg-slate-100 border border-slate-100 flex items-center justify-center transition-all">
                        <ChevronLeft size={16} className="text-slate-400 group-hover:text-slate-600 rotate-180 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </Button>
            </div>
        </div>
    );
};