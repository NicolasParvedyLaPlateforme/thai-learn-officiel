import { Lock } from 'lucide-react';
import { AnimatePresence, m as motion } from 'motion/react';
import { getTranslation } from '../../hooks/useTranslation';

interface SpeakLockedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

export default function SpeakLockedReviewModal({ isOpen, onClose, language }: SpeakLockedReviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
              {getTranslation('auto.review_locked', language)}
            </h3>
            <p className="text-slate-500 font-medium mb-6">
              {getTranslation('auto.to_prove_you_are_ready_for_the', language)}
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all"
            >
              {getTranslation('auto.got_it', language)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
