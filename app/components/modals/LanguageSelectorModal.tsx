'use client';

import React from 'react';
import { useProgressStore, AppLanguage } from '../../lib/store';
import { Globe, X } from 'lucide-react';
import { m as motion , AnimatePresence } from "motion/react";
import { useTranslation } from '../../hooks/useTranslation';

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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => setShowLanguageModal(false)} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                   {t('sidebar.language')}
                </h2>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                    language === l.code
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium'
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
