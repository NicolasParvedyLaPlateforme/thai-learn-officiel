import { Drawer } from 'vaul';
import { X, Play, BookOpen } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useRouter } from 'next/navigation';
import IconImage from '../ui/IconImage';

export interface ConversationObjectiveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  objective: any;
  language: string;
}

export default function ConversationObjectiveModal({ isOpen, onOpenChange, objective, language }: ConversationObjectiveModalProps) {
  const router = useRouter();

  if (!objective) return null;

  const handlePlay = () => {
    onOpenChange(false);
    if (objective.type === 'vocab') {
      router.push(`/lesson/${objective.lesson.id}?level=1`);
    } else {
      router.push(`/conversations/${objective.conversation.id}${objective.levelToComplete > 0 ? `?level=${objective.levelToComplete}` : ''}`);
    }
  };

  const title = objective.type === 'vocab' 
    ? getLocalizedField(objective.lesson, 'title', language)
    : getLocalizedField(objective.conversation, 'title', language);
    
  const subtitle = objective.type === 'vocab'
    ? getTranslation('auto.missing_vocabulary', language)
    : getTranslation('auto.continue_the_story', language);

  const imageUrl = objective.type === 'vocab'
    ? objective.lesson?.imageUrl || '/images/default-lesson.png'
    : objective.conversation?.imageUrl || '/images/default-conversation.png';

  const objectiveText = objective.type === 'vocab' ? (
    `${getTranslation('auto.complete_level_1_of', language)} ${title}`
  ) : (
    objective.levelToComplete === 0 
      ? (getTranslation('auto.complete_base_conversation', language) || 'Terminer Conversation de base') 
      : `${getTranslation('auto.complete_level_prefix', language) || 'Terminer Niveau'} ${objective.levelToComplete}`
  );

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-[100] max-h-[90vh] outline-none">
          <Drawer.Title className="sr-only">Mission Objective</Drawer.Title>
          <Drawer.Description className="sr-only">Details of the next mission objective</Drawer.Description>
          
          <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-20 absolute top-0">
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white bg-black/20 p-2 rounded-full hover:bg-black/30 backdrop-blur-md transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="w-full h-48 md:h-64 relative bg-slate-800 rounded-t-3xl overflow-hidden shrink-0">
            <IconImage src={imageUrl} alt={title} fill className="object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col gap-1 z-20">
              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg w-max ${objective.type === 'vocab' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {subtitle}
              </span>
              <h3 className="text-2xl font-bold text-white leading-tight mt-1">
                {title}
              </h3>
            </div>
          </div>

          <div className="p-6 pb-12 overflow-y-auto flex flex-col gap-6 items-center text-center">
            <div className="flex flex-col gap-2 items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {getTranslation('auto.objective', language) || 'Objectif'}
              </span>
              <p className="text-lg font-bold text-slate-700">
                {objectiveText}
              </p>
            </div>

            <button
              onClick={handlePlay}
              className={`w-full max-w-sm flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg text-white transition-all active:translate-y-[4px] active:border-b-0 relative overflow-hidden group/btn shadow-md
                ${objective.type === 'vocab' ? 'bg-indigo-500 hover:bg-indigo-400 border-b-[4px] border-indigo-600' : 'bg-emerald-500 hover:bg-emerald-400 border-b-[4px] border-emerald-600'}
              `}
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              {objective.type === 'vocab' ? <BookOpen size={22} /> : <Play size={22} className="fill-current" />}
              <span className="relative z-10">{getTranslation('auto.play_now', language) || 'Jouer maintenant'}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
