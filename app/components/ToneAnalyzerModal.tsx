'use client';

import React, { useEffect } from 'react';
import { useProgressStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Drawer } from 'vaul';
import { ToneAnalyzerContent } from './tone-analyzer/ToneAnalyzerContent';

export function ToneAnalyzerModal() {
  const { toneAnalyzerModalWord, setToneAnalyzerModalWord } = useProgressStore();
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  if (isMobile) {
    return (
      <Drawer.Root open={!!toneAnalyzerModalWord} onOpenChange={(open) => !open && setToneAnalyzerModalWord(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm" />
          <Drawer.Content className="bg-[#F5F7FA] flex flex-col rounded-t-3xl fixed bottom-0 left-0 right-0 z-[150] max-h-[90vh] outline-none">
            <Drawer.Title className="sr-only">Calculateur de Tons</Drawer.Title>
            <Drawer.Description className="sr-only">Analysez le ton d'un mot thaï</Drawer.Description>
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0" />
            <ToneAnalyzerContent 
              initialWord={toneAnalyzerModalWord || ''} 
              isModal={true} 
              onClose={() => setToneAnalyzerModalWord(null)} 
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <AnimatePresence>
      {toneAnalyzerModalWord && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center">
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-auto min-w-[320px] md:min-w-[500px] max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-[#F5F7FA]"
          >
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
