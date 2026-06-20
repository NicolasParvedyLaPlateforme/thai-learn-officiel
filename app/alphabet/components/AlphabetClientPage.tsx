'use client';

import { useMemo } from 'react';
import { useProgressStore } from '../../lib/store';
import { getAlphabetLessons } from '../../lib/alphabet-utils';

import { useGlobalSuggestedLesson } from '../../lib/useGlobalSuggestedLesson';
import { DesktopLessonLevelsView } from '../../components/learn/DesktopLessonLevelsView';
import ALPHABET_BASE_UNITS from '../../data/alphabet_units.json';
import AlphabetDesktopTimeline from '../../components/alphabet/AlphabetDesktopTimeline';
import AlphabetMobileTimeline from '../../components/alphabet/AlphabetMobileTimeline';
import PathLayout from '../../components/path-ui/PathLayout';

// Imports for inline modals
import { AnimatePresence } from 'motion/react';
import { Drawer } from 'vaul';
import { BookOpen } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import { DailyQuestsWidget } from '../../components/widgets/DailyQuestsWidget';

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
      renderUnitsModal={({ isOpen, onOpenChange, language, units, activeUnitIndex, onUnitSelect }) => (
        <AnimatePresence>
          {isOpen && (
            <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]" onClick={() => onOpenChange(false)} />
                <Drawer.Content className="bg-white flex flex-col rounded-t-3xl mt-24 fixed bottom-0 left-0 right-0 z-[120] max-h-[85vh] outline-none">
                  <div className="p-4 bg-white rounded-t-3xl shrink-0 flex items-center justify-center sticky top-0 z-10 border-b border-slate-100">
                    <div className="w-12 h-1.5 shrink-0 rounded-full bg-slate-200 mb-6 absolute top-3" />
                    <h2 className="text-xl font-extrabold text-slate-800 mt-2">
                      {getTranslation('units.title', language)}
                    </h2>
                  </div>
                  <div className="p-6 flex flex-col gap-4 overflow-y-auto pb-12 hide-scrollbar">
                    {units.map((unit: any, index: number) => {
                       const title = getLocalizedField(unit, '', language);
                       const isActive = index === activeUnitIndex;
                       return (
                         <button
                           key={index}
                           onClick={() => {
                             onUnitSelect(index);
                             onOpenChange(false);
                           }}
                           className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                             isActive 
                               ? `bg-${unit.colorClass}-50 ${unit.borderClass}`
                               : 'bg-white border-slate-200 hover:border-slate-300'
                           }`}
                         >
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                             isActive ? `bg-${unit.colorClass}-500` : 'bg-slate-300'
                           }`}>
                             <BookOpen size={24} />
                           </div>
                           <div className="flex flex-col flex-1">
                             <div className="text-sm font-bold text-slate-500 mb-1">
                               {getTranslation('unit', language)} {index + 1}
                             </div>
                             <div className={`font-extrabold ${isActive ? unit.textClass : 'text-slate-700'}`}>
                               {title}
                             </div>
                           </div>
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
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}></div>
              <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar">
                <DailyQuestsWidget />
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    />
  );
}
