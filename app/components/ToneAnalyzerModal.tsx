'use client';

import React, { useEffect } from 'react';
import { useProgressStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { ToneAnalyzerContent } from './tone-analyzer/ToneAnalyzerContent';

export function ToneAnalyzerModal() {
  const { toneAnalyzerModalWord, setToneAnalyzerModalWord } = useProgressStore();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToneAnalyzerModalWord(null);
      }
    };
    if (toneAnalyzerModalWord) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toneAnalyzerModalWord, setToneAnalyzerModalWord]);

  return (
    <AnimatePresence>
      {toneAnalyzerModalWord && (
        <div className="fixed inset-0 z-[150] flex flex-col md:items-center md:justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setToneAnalyzerModalWord(null)} 
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative mt-auto md:mt-0 w-full h-[85vh] md:h-auto md:max-h-[90vh] md:w-[600px] flex flex-col rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden bg-[#F5F7FA]"
          >
            {/* Pull pill for mobile */}
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-300 rounded-full z-[60]" />
            
            <ToneAnalyzerContent 
              initialWord={toneAnalyzerModalWord} 
              isModal={true} 
              onClose={() => setToneAnalyzerModalWord(null)} 
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
