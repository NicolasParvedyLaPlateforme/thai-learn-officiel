'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [iosBrowserType, setIosBrowserType] = useState<'safari' | 'other' | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUrl(window.location.host);

    // Check if running as PWA (standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      // Safari has "safari" but not "crios", "fxios", "opios", "edgios" or "brave"
      const isSafari = /safari/.test(userAgent) && !/crios|fxios|opios|edgios|duckduckgo|brave/.test(userAgent);
      setIosBrowserType(isSafari ? 'safari' : 'other');
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      return;
    }
    
    // If we don't have the prompt event, we can show a user instruction tooltip or alert
    if (iosBrowserType) {
      setShowIosGuide(true);
    } else {
      alert("L'installation n'est pas supportée sur ce navigateur ou l'application est déjà installée.");
    }
  };

  // Only show on non-standalone
  if (isStandalone) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors md:hidden shrink-0"
        title="Installer l'application"
      >
        <Download size={18} strokeWidth={2.5} />
      </button>

      {/* iOS Install Guide Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showIosGuide && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowIosGuide(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
                
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Download size={32} strokeWidth={2.5} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Installer ThaiLearn</h3>
                
                {iosBrowserType === 'safari' ? (
                  <div className="text-center text-slate-600 space-y-4 font-medium">
                    <p>Pour installer l&apos;application sur votre appareil :</p>
                    <ol className="text-left space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                      <li className="flex items-center gap-3">
                        <span className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm text-slate-700 shrink-0"><Share size={16} /></span>
                        <div><strong>1.</strong> Appuyez sur l&apos;icône <strong>Partager</strong> en bas de l&apos;écran.</div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm text-slate-700 shrink-0"><PlusSquare size={16} /></span>
                        <div><strong>2.</strong> Sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong>.</div>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-center text-slate-600 space-y-4 font-medium">
                    <p>L&apos;installation sur iOS nécessite d&apos;utiliser <strong>Safari</strong>.</p>
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm text-left">
                      <p className="mb-2 break-all"><strong>1.</strong> Ouvrez <span className="font-bold underline">{currentUrl}</span> dans le navigateur Safari (🧭).</p>
                      <p><strong>2.</strong> Appuyez sur le bouton Installer.</p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowIosGuide(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Compris
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
