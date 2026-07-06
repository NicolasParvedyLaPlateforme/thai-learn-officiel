import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { DailyQuestsWidget } from '../widgets/DailyQuestsWidget';
import { ConversationObjectiveWidget } from '../widgets/ConversationObjectiveWidget';
import { LeaderboardWidget } from '../widgets/LeaderboardWidget';

export interface QuestsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: 'learn' | 'speak' | 'alphabet';
}

export default function QuestsModal({ isOpen, onOpenChange, category }: QuestsModalProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
        <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] outline-none">
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

          <div className="p-4 md:p-6 pb-12 overflow-y-auto flex flex-col gap-4 md:gap-6">
            <DailyQuestsWidget category={category} />
            <ConversationObjectiveWidget />
            <LeaderboardWidget />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
