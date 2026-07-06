import React, { useRef, useState } from 'react';
import { Play, PlayCircle, Star, Target, CheckCircle2, Lock, Clock, GraduationCap, Medal, Pencil, RotateCcw, BookOpen, X, Users, ChevronLeft, Flag, Crown, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import IconImage from '../ui/IconImage';
import { buttonVariants } from '../ui/Button';
import { playThaiTTS } from "@/lib/tts";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { m as motion, AnimatePresence } from 'motion/react';
import { DailyQuestsWidget } from '../widgets/DailyQuestsWidget';
import { ConversationObjectiveWidget } from '../widgets/ConversationObjectiveWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import { LeaderboardWidget } from '../widgets/LeaderboardWidget';
import { useProgressStore } from "@/lib/store";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { LessonDetailsStats } from '../path-ui/LessonDetailsStats';
import { getLevelSplit } from "@/lib/levelSplits";
import stepsLearn from "@/data/steps_metadata_learn.json";
import stepsAlphabet from "@/data/steps_metadata_alphabet.json";
import stepsSpeak from "@/data/steps_metadata_speak.json";

const getStepsData = (type: string) => {
  if (type === 'alphabet') return stepsAlphabet;
  if (type === 'speak') return stepsSpeak;
  return stepsLearn;
};

interface Unit {
  id: string;
  title: string;
  titleEn?: string;
  colorClass: string;
  textClass: string;
  startIndex?: number;
  endIndex?: number;
  lessons?: any[];
  imageUrl?: string;
}

interface DesktopSidebarRightProps {
  units: Unit[];
  activeUnitIndex: number;
  onUnitSelect: (index: number) => void;
  language: string;
  globalSuggested?: any;
  lessons: any[];
  lessonLevels: Record<string, number>;
  mounted: boolean;
  maxLevelPerLesson?: number;
  suggestionType?: 'learn' | 'alphabet' | string;
  // Modal props
  selectedLesson?: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  onCloseLesson?: () => void;
  modalLevel?: number | null;
  setModalLevel?: (level: number | null) => void;
  lessonStars?: Record<string, number[]>;
  resetLessonLevel?: (lessonId: string) => void;
  questsCategory?: 'learn' | 'alphabet' | 'speak';
  showUnitsList?: boolean;
  setShowUnitsList?: (show: boolean) => void;
  reviewStats?: Record<string, Record<number, { bestTime?: number, maxPercentage?: number }>>;
}

export function DesktopSidebarRight({
  units,
  activeUnitIndex,
  onUnitSelect,
  language,
  globalSuggested,
  lessons,
  lessonLevels,
  mounted,
  maxLevelPerLesson = 10,
  suggestionType = 'learn',
  selectedLesson,
  onCloseLesson,
  modalLevel = 0,
  setModalLevel,
  lessonStars,
  resetLessonLevel,
  questsCategory = 'learn',
  showUnitsList: externalShowUnitsList,
  setShowUnitsList: externalSetShowUnitsList,
  reviewStats
}: DesktopSidebarRightProps) {
  const [internalShowUnitsList, setInternalShowUnitsList] = useState(false);
  const showUnitsList = externalShowUnitsList !== undefined ? externalShowUnitsList : internalShowUnitsList;
  const setShowUnitsList = externalSetShowUnitsList || setInternalShowUnitsList;

  const [playFullLevel, setPlayFullLevel] = useState(false);
  const [manualPartIndex, setManualPartIndex] = useState<number | null>(null);
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

  React.useEffect(() => {
    setPlayFullLevel(false);
    setManualPartIndex(null);
  }, [modalLevel]);

  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const levelsScrollRef = useRef<HTMLDivElement>(null);

  const [isBrave, setIsBrave] = useState(false);
  React.useEffect(() => {
    const checkBrave = async () => {
      if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
        setIsBrave(true);
      }
    };
    checkBrave();
  }, []);

  const renderContent = () => {
    if (!showUnitsList) {
      return (
        <motion.div
          key="dashboard-view"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full relative flex flex-col bg-white"
        >
          {/* Header Fixed */}
          <div className="w-full px-6 pt-8 pb-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-center shrink-0 z-20">
            <h1 className="text-[26px] font-light font-serif text-slate-800 tracking-wide text-center">
              {getTranslation('auto.my_adventure', language)}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-6 pb-6">
            <div className="w-full flex flex-col gap-0">
              <ConversationObjectiveWidget />
              <DailyQuestsWidget category={questsCategory} />
              <LeaderboardWidget />
            </div>
          </div>

          <div className="w-full mt-auto flex flex-col gap-0 border-t border-slate-100 bg-white z-10 px-6 pb-6 pt-2 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <QuickActionsWidget variant="desktop" pathType={suggestionType as any} units={units} lightweightLessons={lessons} />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="units-view"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16"
      >
        <div className="w-full relative flex flex-col gap-4 group">
          <div className="flex items-center justify-between gap-3 mb-2 px-1 shrink-0">
            <div className="flex items-center gap-3 text-slate-800 font-bold">
              <BookOpen size={20} className="text-slate-400 shrink-0" />
              <h2 className="whitespace-nowrap text-lg text-slate-600">
                {getTranslation('auto.units', language)}
              </h2>
            </div>
            <IconButton
              size="md"
              onClick={() => setShowUnitsList(false)}
              className="bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X size={18} />
            </IconButton>
          </div>
          <div className="flex flex-col gap-3 pb-6 w-full">
            {units.map((u, i) => {
              const isCurrent = i === activeUnitIndex;
              const status = isCurrent ? (getTranslation('auto.in_progress_1', language)) : '';
              const unitLessons = u.lessons ? u.lessons : lessons.slice(u.startIndex || 0, u.endIndex || 0);

              const hasSuggestion = globalSuggested?.type === suggestionType &&
                globalSuggested.id &&
                unitLessons.some((l: any) => l.id === globalSuggested.id);
              const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
              const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + (lessonLevels[l.id] || 0), 0) : 0;
              const progressPercent = mounted && maxLevelsInUnit > 0 ? Math.min(100, (completedLevelsInUnit / maxLevelsInUnit) * 100) : 0;
              const completedLessonsCount = mounted ? unitLessons.filter((l: any) => (lessonLevels[l.id] || 0) >= maxLevelPerLesson).length : 0;
              const totalLessonsCount = unitLessons.length;

              if (isCurrent) {
                return (
                  <div
                    key={u.id}
                    className={`w-full text-left rounded-3xl transition-all relative overflow-hidden flex flex-col p-4 shrink-0 bg-white border cursor-default ${u.colorClass.replace('bg-', 'border-')} shadow-sm`}
                  >
                    {hasSuggestion && (
                      <span className="absolute top-3 right-3 w-3 h-3 bg-amber-400 border-2 border-white rounded-full z-10"></span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      {u.imageUrl ? (
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden relative shadow-sm shrink-0 border-2 ${u.colorClass.replace('bg-', 'border-')}`}>
                          <Image src={u.imageUrl} alt={getLocalizedField(u, 'title', language) || ''} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[20px] text-white ${u.colorClass} shadow-sm shrink-0`}>
                          {i + 1}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 pr-2 py-1">
                        <h3 className="font-extrabold text-[16px] text-slate-800 leading-tight mb-1 whitespace-normal break-words">{getLocalizedField(u, 'title', language)}</h3>
                        <span className={`text-[13px] font-black uppercase tracking-wider ${u.textClass}`}>{status}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${u.colorClass}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="text-[12px] font-medium text-slate-400 select-none">
                      {completedLessonsCount}/{totalLessonsCount} {getTranslation('auto.lessons', language)}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={u.id}
                  onClick={() => onUnitSelect(i)}
                  className="w-full text-left rounded-3xl transition-all relative flex flex-row items-center p-3 shrink-0 bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] group/btn cursor-pointer"
                >
                  {hasSuggestion && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full z-10"></span>
                  )}
                  {u.imageUrl ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative shadow-sm shrink-0 mr-4 border border-slate-100 group-hover/btn:border-slate-200 transition-colors bg-white">
                      <Image src={u.imageUrl} alt={getLocalizedField(u, 'title', language) || ''} fill sizes="64px" className="object-cover opacity-80 group-hover/btn:opacity-100 transition-opacity grayscale-[30%] group-hover/btn:grayscale-0" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-[16px] bg-slate-50 text-slate-400 group-hover/btn:bg-white group-hover/btn:text-slate-600 shrink-0 mr-4 transition-colors border border-slate-100 group-hover/btn:border-slate-200">
                      {i + 1}
                    </div>
                  )}

                  <div className="flex flex-col justify-center min-w-0 overflow-hidden pr-2">
                    <h3 className="font-bold text-[15px] leading-snug text-slate-500 group-hover/btn:text-slate-700 transition-colors whitespace-normal break-words">{getLocalizedField(u, 'title', language)}</h3>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="h-screen sticky top-0 hidden xl:block w-[24rem] flex-shrink-0 relative z-40 bg-white border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

