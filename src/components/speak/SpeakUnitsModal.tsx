import { Drawer } from 'vaul';
import { X, BookOpen, CheckCircle } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";

interface SpeakUnitsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  language: string;
  units: any[];
  activeUnitIndex: number;
  onUnitSelect: (index: number) => void;
}

export default function SpeakUnitsModal({
  isOpen,
  onOpenChange,
  language,
  units,
  activeUnitIndex,
  onUnitSelect
}: SpeakUnitsModalProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden" />
        <Drawer.Content className="md:hidden bg-[#FAFAFA] flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-[100] max-h-[85vh] outline-none">
          <Drawer.Title className="sr-only">Course Units</Drawer.Title>
          <Drawer.Description className="sr-only">Select a course unit</Drawer.Description>
          <div className="w-full flex justify-center py-3 shrink-0 bg-[#FAFAFA] z-10 rounded-t-3xl border-b border-slate-200/50">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 text-center py-4 border-b border-slate-200/50 shrink-0">
            {getTranslation('auto.course_units', language)}
          </h3>

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-slate-400 bg-slate-100 p-2 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="p-4 overflow-y-auto flex flex-col gap-3 pb-12">
            {units.map((u, i) => {
              const isActive = i === activeUnitIndex;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onUnitSelect(i);
                    onOpenChange(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-white border-emerald-500 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {u.imageUrl ? (
                      <div className={`w-14 h-14 rounded-[14px] overflow-hidden relative shrink-0 border-2 ${isActive ? 'border-emerald-500 shadow-sm' : 'border-slate-200'}`}>
                        <img src={u.imageUrl} alt={getLocalizedField(u, 'title', language)} className={`object-cover w-full h-full ${isActive ? '' : 'opacity-80 grayscale-[30%]'}`} />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <BookOpen size={24} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className={`font-black uppercase text-sm ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {getTranslation('auto.unit', language)} {i + 1}
                      </span>
                      <span className="font-bold text-slate-800">
                        {getLocalizedField(u, 'title', language)}
                      </span>
                    </div>
                  </div>
                  {isActive && <CheckCircle className="text-emerald-500 shrink-0" size={24} />}
                </button>
              )
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
