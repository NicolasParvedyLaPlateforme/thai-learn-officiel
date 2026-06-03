'use client';

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { DetectiveLevel, DetectiveObject } from '../../types';
import { useProgressStore } from '../../lib/store';
import { Volume2, Search, CheckCircle2, Maximize, Minimize, ChevronLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { playThaiTTS } from '../../lib/tts';
import confetti from 'canvas-confetti';

interface Props {
  level: DetectiveLevel;
}

export default function DetectiveGame({ level }: Props) {
  const { language, setMobileSidebarOpen } = useProgressStore();

  const [objects, setObjects] = useState<DetectiveObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [levelState, setLevelState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [difficulty, setDifficulty] = useState<1 | 2>(1);
  const [mistakes, setMistakes] = useState(0);
  const [foundObjects, setFoundObjects] = useState<DetectiveObject[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortraitPhone(w < 768 && h > w);
      setIsLandscapePhone(h < 600 && w > h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (level.objects && level.objects.length > 0) {
      const shuffled = [...level.objects].sort(() => 0.5 - Math.random());
      setObjects(shuffled);
    }
  }, [level]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) await docEl.requestFullscreen();
        else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => { });
        }
      } catch (e) { /* ignore */ }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await ((document as any).webkitExitFullscreen)();
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) { /* ignore */ }
    }
  };

  const startGame = (diff: 1 | 2) => {
    setDifficulty(diff);
    setCurrentIndex(0);
    setFoundObjects([]);
    setMistakes(0);
    setLevelState('playing');
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (levelState !== 'playing' || !containerRef.current) return;

    const currentObj = objects[currentIndex];
    if (!currentObj) return;

    const rect = containerRef.current.getBoundingClientRect();
    let containerX, containerY;
    
    if (isPortraitPhone) {
      const screenOffsetX = e.clientX - rect.left;
      const screenOffsetY = e.clientY - rect.top;
      // Rotated 90deg clockwise: screen Y is container X, inverted screen X is container Y
      containerX = screenOffsetY;
      containerY = rect.width - screenOffsetX;
    } else {
      containerX = e.clientX - rect.left;
      containerY = e.clientY - rect.top;
    }

    const unrotatedWidth = isPortraitPhone ? rect.height : rect.width;
    const unrotatedHeight = isPortraitPhone ? rect.width : rect.height;

    const targetXPixel = (currentObj.x / 100) * unrotatedWidth;
    const targetYPixel = (currentObj.y / 100) * unrotatedHeight;
    const targetRadiusPixel = (currentObj.radius / 100) * unrotatedWidth;

    const dx = containerX - targetXPixel;
    const dy = containerY - targetYPixel;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= targetRadiusPixel) {
      handleCorrect();
    } else {
      handleMistake();
    }
  };

  const handleCorrect = () => {
    playThaiTTS('ถูกต้อง');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
      colors: ['#10B981', '#F59E0B'],
      zIndex: isFullscreen || isPortraitPhone ? 150 : 100
    });

    const currentObj = objects[currentIndex];
    setFoundObjects([...foundObjects, currentObj]);

    if (currentIndex + 1 >= objects.length) {
      setTimeout(() => {
        setLevelState('completed');
        if (isFullscreen) toggleFullscreen();
      }, 1000);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMistake = () => {
    setMistakes(m => m + 1);
    if (navigator.vibrate) navigator.vibrate(200);
  };

  if (!level.objects || level.objects.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-slate-500">Ce niveau ne contient aucun objet à trouver.</div>;
  }

  if (levelState === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Search className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          {language === 'en' ? 'Detective Mode' : 'Mode Détective'}
        </h2>
        <p className="text-slate-600 mb-8">
          {language === 'en' ? `Find ${objects.length} hidden objects in the image.` : `Trouve les ${objects.length} objets cachés dans l'image.`}
        </p>

        <div className="w-full space-y-4">
          <button onClick={() => startGame(1)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all">
            Niveau 1 (Thaï + Traduction)
          </button>
          <button onClick={() => startGame(2)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all">
            Niveau 2 (Thaï uniquement)
          </button>
        </div>
      </div>
    );
  }

  if (levelState === 'completed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          {language === 'en' ? 'Mission Accomplished!' : 'Mission Accomplie !'}
        </h2>
        <p className="text-slate-600 mb-8">
          {language === 'en' ? `You found all ${objects.length} objects with ${mistakes} mistakes.` : `Tu as trouvé les ${objects.length} objets avec ${mistakes} erreurs.`}
        </p>
        <button onClick={() => setLevelState('intro')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all">
          {language === 'en' ? 'Play Again' : 'Rejouer'}
        </button>
      </div>
    );
  }

  const currentObj = objects[currentIndex];
  const useSideLayout = isPortraitPhone || isLandscapePhone || (isFullscreen && window.innerHeight < 768);

  const renderGameArea = (isSideLayout: boolean) => (
    <div
      className={`w-full shadow-inner flex-1 flex items-center justify-center overflow-hidden min-h-0 ${isFullscreen ? 'bg-slate-800 h-full rounded-none' : (isSideLayout ? 'bg-slate-900 h-full rounded-none' : 'order-first md:order-last bg-slate-900 md:bg-slate-800 rounded-none md:rounded-2xl max-h-none md:max-h-[85vh]')}`}
    >
      <div 
        className="relative max-w-full max-h-full flex items-center justify-center cursor-crosshair select-none"
        ref={containerRef}
        onClick={handleImageClick}
      >
        <img
          src={level.imageUrl}
          alt="Level"
          className="block max-w-full max-h-full pointer-events-none object-contain"
          style={{ width: 'auto', height: 'auto', maxHeight: isFullscreen || isSideLayout ? '100dvh' : '70vh' }}
        />

        {foundObjects.map(obj => (
          <div
            key={obj.id}
            className="absolute border-4 border-emerald-500/50 bg-emerald-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 animate-in zoom-in"
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              width: `${obj.radius * 2}%`,
              paddingTop: `${obj.radius * 2}%`,
            }}
          />
        ))}
      </div>
    </div>
  );

  if (useSideLayout) {
    return (
      <div 
        className={`z-[100] bg-slate-900 flex flex-row overflow-hidden ${isFullscreen ? 'fixed inset-0' : 'fixed inset-0'}`}
        style={isPortraitPhone ? {
          width: '100vh',
          height: '100vw',
          transform: 'rotate(90deg) translateY(-100%)',
          transformOrigin: 'top left'
        } : undefined}
      >
        {/* Left HUD Panel (20%) */}
        <div 
          className="w-[25%] max-w-[160px] min-w-[110px] bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 px-2 justify-between shrink-0"
          style={{ 
            paddingLeft: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-top))' : 'max(0.5rem, env(safe-area-inset-left))'
          }}
        >
          {/* Top Actions */}
          <div className="flex flex-row gap-2 items-center justify-center w-full">
             <Link href="/detective" className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors">
               <ChevronLeft className="w-6 h-6" />
             </Link>
          </div>

          {/* Middle: Word & Sound */}
          <div className="flex flex-col items-center gap-4 w-full px-1">
            <button
              onClick={(e) => { e.stopPropagation(); playThaiTTS(currentObj.th); }}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 shrink-0"
            >
              <Volume2 className="w-8 h-8" />
            </button>
            <div className="text-center w-full flex-1 overflow-y-auto">
              <h3 className="text-2xl font-bold font-thai text-white leading-tight break-words">
                {currentObj.th}
              </h3>
              {difficulty === 1 && (
                <p className="text-emerald-400/80 font-medium text-sm mt-1 leading-tight line-clamp-2">
                  {language === 'en' ? currentObj.en : currentObj.fr}
                </p>
              )}
            </div>
          </div>

          {/* Bottom: Progress */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 w-full text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                {language === 'en' ? 'Progress' : 'Progression'}
              </div>
              <div className="font-black text-emerald-500 text-lg">
                {currentIndex} / {objects.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right Image Panel */}
        <div 
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{ 
            paddingRight: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-bottom))' : 'max(0.5rem, env(safe-area-inset-right))'
          }}
        >
          {renderGameArea(true)}
        </div>
      </div>
    );
  }

  // Desktop or Large Tablet Portrait Layout
  return (
    <div className="flex flex-col h-full">
      {/* HUD - Top on desktop */}
      <div className="order-first flex items-center justify-between pointer-events-auto bg-white p-4 mb-4 rounded-2xl border border-slate-100 shadow-sm z-10">
        <div className="flex items-center gap-3 bg-transparent p-0 shadow-none">
          <button
            onClick={(e) => { e.stopPropagation(); playThaiTTS(currentObj.th); }}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 shrink-0 bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold font-thai text-slate-800 leading-tight">
              {currentObj.th}
            </h3>
            {difficulty === 1 && (
              <p className="text-slate-500 font-medium text-sm leading-tight">
                {language === 'en' ? currentObj.en : currentObj.fr}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col items-end justify-center">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">
              {language === 'en' ? 'Progress' : 'Progression'}
            </div>
            <div className="font-black text-emerald-600 px-3 py-1.5 rounded-xl text-lg leading-none bg-transparent p-0">
              {currentIndex} / {objects.length}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 shrink-0 ml-1 bg-slate-100 hover:bg-slate-200 text-slate-600 shadow-none border-none"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {renderGameArea(false)}
    </div>
  );
}
