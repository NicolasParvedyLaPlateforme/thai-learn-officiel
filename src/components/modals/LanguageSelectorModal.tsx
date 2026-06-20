'use client';

import React from 'react';
import { useProgressStore, AppLanguage } from "@/lib/store";
import { Globe, X } from 'lucide-react';
import { m as motion , AnimatePresence } from "motion/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

const languages: { code: AppLanguage, name: string, flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

export function LanguageSelectorModal() {
  const { showLanguageModal, setShowLanguageModal, language, setLanguage } = useProgressStore();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {showLanguageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={() => setShowLanguageModal(false)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm"
          >
            <Card className="overflow-hidden flex flex-col border-none shadow-2xl bg-white/95">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <Typography variant="h4" className="text-slate-800">
                     {t('sidebar.language')}
                  </Typography>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLanguageModal(false)}
                  className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                      language === l.code
                        ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 font-bold shadow-sm'
                        : 'border-transparent bg-transparent hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{l.flag}</span>
                      <span className="text-lg">{l.name}</span>
                    </div>
                    {language === l.code && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
