'use client';

import React, { useEffect, useState } from 'react';
import { useProgressStore } from '../lib/store';
import { X, Heart, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function CommunityModal() {
  const pathname = usePathname();
  const { 
    hasSeenCommunityModal, 
    setHasSeenCommunityModal, 
    showCommunityModal, 
    setShowCommunityModal,
    language 
  } = useProgressStore();

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only auto-show if we haven't seen it AND we are on the /learn page
    if (!hasSeenCommunityModal && mounted && pathname === '/learn') {
      setShowCommunityModal(true);
      setHasSeenCommunityModal(true); // Don't show automatically next time unless they clear storage.
    }
  }, [hasSeenCommunityModal, setHasSeenCommunityModal, setShowCommunityModal, mounted, pathname]);

  // Adjust logic: If they never checked "Don't show again", we might want to keep showing it? 
  // Let's say we show it once automatically. If they check "Don't show again", we set a persisted flag.
  // Wait, hasSeenCommunityModal IS the persisted flag. 
  // Let's refine:
  // hasSeenCommunityModal means "User checked 'Do not show again'".
  // So on mount, if !hasSeenCommunityModal, we setShowCommunityModal(true). 
  // We should do this only once per session if not checked, but let's just do it on first visit.

  if (!mounted || !showCommunityModal) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      setHasSeenCommunityModal(true);
    }
    setShowCommunityModal(false);
  };

  const isFr = language === 'fr';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
              <Heart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isFr ? "Projet Communautaire" : "Community Project"}
              </h2>
              <p className="text-emerald-700 text-sm font-medium">
                {isFr ? "Application 100% gratuite" : "100% free application"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-slate-600">
          <p>
            {isFr 
              ? "Bienvenue ! Cette application est actuellement en cours de développement. Elle est entièrement gratuite et créée pour aider la communauté à apprendre le thaï." 
              : "Welcome! This application is currently in development. It is completely free and created to help the community learn Thai."}
          </p>
          <p>
            {isFr 
              ? "Puisque nous sommes toujours en phase de création, il est possible que vous rencontriez quelques erreurs dans les exercices ou les traductions."
              : "Since we are still building it, you might find some errors in the exercises or translations."}
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-medium text-slate-800 mb-2">
              {isFr ? "Vos retours sont précieux" : "Your feedback is valuable"}
            </p>
            <p className="text-sm mb-3">
              {isFr 
                ? "N'hésitez pas à faire vos retours, signaler des bugs, ou suggérer des améliorations sur notre fil Reddit :"
                : "Feel free to share feedback, report bugs, or suggest improvements on our Reddit thread:"}
            </p>
            <a 
              href="https://www.reddit.com/r/learnthai/comments/1t8plhg/la_d%C3%A9termination_paie_malgr%C3%A9_la_critique/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
            >
              <ExternalLink size={16} />
              {isFr ? "Rejoindre la discussion Reddit" : "Join the Reddit discussion"}
            </a>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
              <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm font-medium select-none">
              {isFr ? "Ne plus afficher ce message" : "Don't show this message again"}
            </span>
          </label>
        </div>
        
        <div className="p-6 pt-0">
          <button 
            onClick={handleClose}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors"
          >
            {isFr ? "Continuer vers l'application" : "Continue to application"}
          </button>
        </div>
      </div>
    </div>
  );
}
