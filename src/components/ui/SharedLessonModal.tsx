import { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { Clock } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";

interface SharedLessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  isReviewOrMastery: boolean;
  isMastery: boolean;
  modalLevel: number;
  lessonId: string;
  reviewStats?: Record<string, Record<number, any>>;
  children: ReactNode;
  footer: ReactNode;
}

export default function SharedLessonModal({
  isOpen,
  onOpenChange,
  language,
  isReviewOrMastery,
  isMastery,
  modalLevel,
  lessonId,
  reviewStats,
  children,
  footer
}: SharedLessonModalProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
        <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[95vh] outline-none">
          <Drawer.Title className="sr-only">Course Details</Drawer.Title>
          <Drawer.Description className="sr-only">Choose a level or start practice</Drawer.Description>
          <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
            <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
          </div>
          
          <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar pt-6">
            {children}

            {isReviewOrMastery && (
              <div className="px-7 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                    {isMastery
                      ? (getTranslation('auto.stats_mastery', language))
                      : (`${getTranslation('auto.stats', language) || 'Stats'} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`)
                    }
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const stats = reviewStats?.[lessonId]?.[modalLevel];
                    if (stats?.bestTime !== undefined && stats.bestTime !== null) {
                      const m = Math.floor(stats.bestTime / 60);
                      const s = stats.bestTime % 60;
                      return (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Clock size={20} className="stroke-[2.5]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-emerald-800 font-bold text-[15px]">
                              {getTranslation('auto.best_time', language)}
                            </span>
                            <span className="text-emerald-600 font-medium text-sm">
                              {m}min {s}s
                            </span>
                          </div>
                        </div>
                      );
                    } else if (stats?.maxPercentage !== undefined && stats.maxPercentage !== null) {
                      return (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-rose-800 font-bold text-[15px]">
                              {getTranslation('auto.best_survival', language)}
                            </span>
                            <span className="text-rose-600 font-medium text-sm">
                              {stats.maxPercentage}%
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">
                          {getTranslation('auto.not_completed_yet', language)}
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            {footer}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
