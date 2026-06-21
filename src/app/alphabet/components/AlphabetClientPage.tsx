'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getAlphabetLessons } from "@/lib/alphabet-utils";

import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";
import { DesktopLessonLevelsView } from "@/components/learn/DesktopLessonLevelsView";
import ALPHABET_BASE_UNITS from "@/data/alphabet_units.json";
import AlphabetDesktopTimeline from "@/components/alphabet/AlphabetDesktopTimeline";
import AlphabetMobileTimeline from "@/components/alphabet/AlphabetMobileTimeline";
import PathLayout from "@/components/path-ui/PathLayout";

// Imports for inline modals
import { AnimatePresence } from 'motion/react';
import { Drawer } from 'vaul';
import { BookOpen, X, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
const AlphabetLessonModal = dynamic(() => import('@/components/alphabet/AlphabetLessonModal'), { ssr: false });
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import { ConversationObjectiveWidget } from "@/components/widgets/ConversationObjectiveWidget";
import { LeaderboardWidget } from "@/components/widgets/LeaderboardWidget";

export default function AlphabetClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const { dailyQuests, language } = useProgressStore();
  const alphabetQuests = dailyQuests?.alphabet || [];
  
  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  
  const { consonants, vowels } = useMemo(() => getAlphabetLessons(), []);

  const UNITS = useMemo(() => [
    {
      ...ALPHABET_BASE_UNITS[0],
      lessons: consonants
    },
    {
      ...ALPHABET_BASE_UNITS[1],
      lessons: vowels
    }
  ], [consonants, vowels]);

  const allLessons = useMemo(() => [...consonants, ...vowels], [consonants, vowels]);

  const suggestedLessonId = globalSuggested?.type === 'alphabet' ? globalSuggested.id : null;

  return (
    <PathLayout
      pathType="alphabet"
      units={UNITS}
      lessons={allLessons}
      quests={alphabetQuests}
      globalSuggested={globalSuggested}
      suggestedLessonId={suggestedLessonId}
      maxLevelPerLesson={3}
      renderMobileTimeline={(props) => <AlphabetMobileTimeline {...props} alphabetQuests={alphabetQuests} />}
      renderDesktopTimeline={(props) => <AlphabetDesktopTimeline {...props} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="alphabet" maxLevelPerLesson={3} />}
      renderLessonModal={(props) => <AlphabetLessonModal {...props} />}
      renderUnitsModal={({ isOpen, onOpenChange, language, units, activeUnitIndex, onUnitSelect }) => (
        <AnimatePresence>
          {isOpen && (
            <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]" onClick={() => onOpenChange(false)} />
                <Drawer.Content className="bg-white flex flex-col rounded-t-3xl mt-24 fixed bottom-0 left-0 right-0 z-[120] max-h-[85vh] outline-none">
                  <div className="p-4 bg-white rounded-t-3xl shrink-0 flex items-center justify-center sticky top-0 z-10 border-b border-slate-100">
                    <div className="w-12 h-1.5 shrink-0 rounded-full bg-slate-200 mb-6 absolute top-3" />
                    <Drawer.Title className="text-xl font-extrabold text-slate-800 mt-2">
                      Unités d'Alphabet
                    </Drawer.Title>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
                  >
                    <X size={20} />
                  </button>
                  <div className="p-6 flex flex-col gap-4 overflow-y-auto pb-12 hide-scrollbar">
                    {units.map((unit: any, index: number) => {
                       const title = getLocalizedField(unit, 'title', language);
                       const isActive = index === activeUnitIndex;
                       return (
                         <button
                           key={index}
                           onClick={() => {
                             onUnitSelect(index);
                             onOpenChange(false);
                           }}
                           className={`w-full flex items-center gap-4 p-4 rounded-3xl border text-left transition-all shadow-sm ${
                             isActive 
                               ? `bg-${unit.colorClass}-50 ${unit.borderClass}`
                               : 'bg-white border-slate-100 hover:shadow-md hover:border-slate-200'
                           }`}
                         >
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                             isActive ? `bg-${unit.colorClass}-500` : 'bg-slate-300'
                           }`}>
                             <BookOpen size={24} />
                           </div>
                           <div className="flex flex-col flex-1">
                             <div className={`text-sm font-bold uppercase mb-1 ${isActive ? unit.textClass : 'text-slate-500'}`}>
                               UNITÉ {index + 1}
                             </div>
                             <div className={`font-extrabold ${isActive ? 'text-slate-800' : 'text-slate-700'}`}>
                               {title}
                             </div>
                           </div>
                           {isActive && (
                             <div className={unit.textClass}>
                               <CheckCircle size={24} strokeWidth={2.5} />
                             </div>
                           )}
                         </button>
                       );
                    })}
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          )}
        </AnimatePresence>
      )}
      renderQuestsModal={({ isOpen, onOpenChange }) => (
        <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
            <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-[120] max-h-[85vh] outline-none">
              <Drawer.Title className="sr-only">Quests</Drawer.Title>
              <Drawer.Description className="sr-only">View your daily quests and objectives</Drawer.Description>
              <div className="w-full flex justify-center py-3 shrink-0 bg-white z-10 rounded-t-3xl border-b border-slate-100">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="p-4 md:p-6 pb-12 overflow-y-auto flex flex-col gap-4 md:gap-6 hide-scrollbar">
                <DailyQuestsWidget category="alphabet" />
                <ConversationObjectiveWidget />
                <LeaderboardWidget />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    />
  );
}
