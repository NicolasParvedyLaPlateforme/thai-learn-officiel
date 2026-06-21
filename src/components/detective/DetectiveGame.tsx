'use client';

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { DetectiveLevel, DetectiveObject } from "@/types";
import { useProgressStore } from "@/lib/store";
import { Volume2, Search, CheckCircle2, Maximize, Minimize, ChevronLeft, Menu, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { playThaiTTS } from "@/lib/tts";
import detectiveData from "@/data/detective.json";
import { Button } from "@/components/ui/Button";

interface Props {
  level: DetectiveLevel;
  initialDiff?: 1 | 2;
}

export default function DetectiveGame({ level, initialDiff }: Props) {

  const { language, setMobileSidebarOpen, completedLessons, completeLesson } = useProgressStore(
    useShallow(state => ({
      language: state.language,
      setMobileSidebarOpen: state.setMobileSidebarOpen,
      completedLessons: state.completedLessons,
      completeLesson: state.completeLesson
    }))
  );
  const [xpAwarded, setXpAwarded] = useState(false);

  const [objects, setObjects] = useState<DetectiveObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [levelState, setLevelState] = useState<'intro' | 'playing' | 'completed'>(initialDiff ? 'playing' : 'intro');
  const [difficulty, setDifficulty] = useState<1 | 2>(initialDiff || 1);
  const [mistakes, setMistakes] = useState(0);
  const [currentMistakes, setCurrentMistakes] = useState(0);
  const [foundObjects, setFoundObjects] = useState<DetectiveObject[]>([]);
  const [showStarLoss, setShowStarLoss] = useState(false);
  const prevStars = useRef(5);


  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLayout, setImgLayout] = useState({ width: 100, height: 100, offsetX: 0, offsetY: 0, unrotatedW: 100, unrotatedH: 100 });
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null); // -- A SUPPRIMER --
  const [isDev, setIsDev] = useState(false);
  const [isTranslationRevealed, setIsTranslationRevealed] = useState(false);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const AUTO_HIGHLIGHT_TIME = 15;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDev(window.location.search.includes('dev=dev'));
    }
  }, []);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    const checkOrientation = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortraitPhone(w < 768 && h > w);
      setIsLandscapePhone(h < 600 && w > h);
      setLayoutTrigger(t => t + 1);

      // Safari iOS PWA fix: Force the browser to reset its touch-layer offset
      window.scrollTo(0, 0);
      if (document.body) {
        const oldHeight = document.body.style.height;
        document.body.style.height = `${window.innerHeight}px`;
        setTimeout(() => {
          document.body.style.height = oldHeight;
        }, 50);
      }
    };

    const handleResize = () => {
      checkOrientation();
      
      // Force layout recalculations during and after the mobile rotation animation
      // We must re-measure window dimensions because iOS updates them AFTER orientationchange
      timeoutIds.forEach(clearTimeout);
      timeoutIds = [
        setTimeout(checkOrientation, 150),
        setTimeout(checkOrientation, 400),
        setTimeout(checkOrientation, 800)
      ];
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!imgRef.current || !containerRef.current) return;

    const updateLayout = () => {
      if (!imgRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const unrotatedW = isPortraitPhone ? rect.height : rect.width;
      const unrotatedH = isPortraitPhone ? rect.width : rect.height;

      const natW = imgRef.current.naturalWidth || 1;
      const natH = imgRef.current.naturalHeight || 1;

      const containerRatio = unrotatedW / unrotatedH;
      const imgRatio = natW / natH;

      let renderedW = unrotatedW;
      let renderedH = unrotatedH;
      let offX = 0;
      let offY = 0;

      if (imgRatio > containerRatio) {
        // Image is wider, letterboxed top/bottom
        renderedH = unrotatedW / imgRatio;
        offY = (unrotatedH - renderedH) / 2;
      } else {
        renderedW = unrotatedH * imgRatio;
        offX = (unrotatedW - renderedW) / 2;
      }

      setImgLayout({ width: renderedW, height: renderedH, offsetX: offX, offsetY: offY, unrotatedW, unrotatedH });
    };

    updateLayout();

    const observer = new ResizeObserver(() => {
      updateLayout();
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isPortraitPhone, layoutTrigger]);

  useEffect(() => {
    if (level.objects && level.objects.length > 0) {
      const shuffled = [...level.objects].sort(() => 0.5 - Math.random());
      setObjects(shuffled);
    }
  }, [level]);

  useEffect(() => {
    if (levelState === 'playing' && objects[currentIndex]) {
      playThaiTTS(objects[currentIndex].th);
      setIsTranslationRevealed(false);
      setIsMagnifierActive(false);
      setTimerSeconds(0);
    }
  }, [currentIndex, levelState, objects]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (levelState === 'playing') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentIndex, levelState]);

  useEffect(() => {
    const stars = Math.max(0, 5 - Math.floor(mistakes / 2));
    if (stars < prevStars.current && levelState === 'playing') {
      setShowStarLoss(true);
      setTimeout(() => setShowStarLoss(false), 2000);
      prevStars.current = stars;
    }
  }, [mistakes, levelState]);

  useEffect(() => {
    if (levelState === 'completed' && !xpAwarded) {
      const lessonId = `detective_${level.id}_diff${difficulty}`;
      const isFirstTime = !completedLessons.includes(lessonId);
      const earnedXp = isFirstTime ? 50 : 20;
      const earnedStars = Math.max(0, 5 - Math.floor(mistakes / 2));
      
      completeLesson(lessonId, earnedXp, 0, earnedStars);
      setXpAwarded(true);
    }
  }, [levelState, xpAwarded, level.id, difficulty, mistakes, completedLessons, completeLesson]);



  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (imgRef.current && (!imgRef.current.complete || imgRef.current.naturalWidth <= 1)) {
      interval = setInterval(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 1) {
          setLayoutTrigger(t => t + 1);
          clearInterval(interval);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [level.imageUrl]);

  const startGame = (diff: 1 | 2) => {
    setDifficulty(diff);
    setCurrentIndex(0);
    setFoundObjects([]);
    setMistakes(0);
    setCurrentMistakes(0);
    prevStars.current = 5;
    setXpAwarded(false);
    setLevelState('playing');
  };

  const handleCorrect = async () => {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
      colors: ['#10B981', '#F59E0B'],
      zIndex: isPortraitPhone ? 150 : 100
    });

    const currentObj = objects[currentIndex];
    setFoundObjects([...foundObjects, currentObj]);
    setCurrentMistakes(0);

    if (currentIndex + 1 >= objects.length) {
      setTimeout(() => {
        setLevelState('completed');
      }, 1000);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMistake = () => {
    setMistakes(m => m + 1);
    setCurrentMistakes(m => m + 1);
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
          {getTranslation('auto.detective_mode', language)}
        </h2>
        <p className="text-slate-600 mb-8">
          {language === 'en' ? `Find ${level.objects?.length || 0} hidden objects in the image.` : `Trouve les ${level.objects?.length || 0} objets cachés dans l'image.`}
        </p>

        <div className="w-full space-y-4">
          <Button onClick={() => startGame(1)} size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 rounded-2xl shadow-sm transition-all">
            Niveau 1 (Thaï + Traduction)
          </Button>
          <Button onClick={() => startGame(2)} size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl shadow-sm transition-all">
            Niveau 2 (Thaï uniquement)
          </Button>
        </div>
      </div>
    );
  }

  if (levelState === 'completed') {
    const currentLevelIndex = detectiveData.findIndex(l => l.id === level.id);
    const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < detectiveData.length - 1 ? detectiveData[currentLevelIndex + 1] : null;
    const earnedStars = Math.max(0, 5 - Math.floor(mistakes / 2));

    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          {getTranslation('auto.mission_accomplished', language)}
        </h2>
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={24}
              className={
                i < earnedStars
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }
            />
          ))}
        </div>
        <p className="text-slate-600 mb-8">
          {language === 'en' ? `You found all ${level.objects?.length || 0} objects with ${mistakes} mistakes.` : `Tu as trouvé les ${level.objects?.length || 0} objets avec ${mistakes} erreurs.`}
        </p>
        <div className="w-full flex flex-col gap-3 px-4 mt-6">
          {nextLevel && (
            <Button onClick={() => { window.location.href = `/detective/level/${nextLevel.id}${initialDiff ? `?diff=${initialDiff}` : ''}`; }} size="lg" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 rounded-2xl shadow-sm transition-all text-center">
              {getTranslation('auto.next_level', language)}
            </Button>
          )}
          <Button onClick={() => initialDiff ? startGame(initialDiff) : setLevelState('intro')} size="lg" className={`w-full ${nextLevel ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} font-bold py-6 rounded-2xl shadow-sm transition-all`}>
            {getTranslation('auto.play_again', language)}
          </Button>
        </div>
      </div>
    );
  }

  if (levelState === 'playing' && objects.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center">
        <Search className="w-12 h-12 animate-pulse text-emerald-500" />
      </div>
    );
  }

  const currentObj = objects[currentIndex];
  const earnedStars = Math.max(0, 5 - Math.floor(mistakes / 2));

  const renderGameArea = () => (
    <div
      className="w-full shadow-inner flex-1 flex items-center justify-center overflow-hidden min-h-0 bg-slate-900 h-full rounded-none"
    >
      <div
        className="relative w-full h-full flex items-center justify-center select-none"
        ref={containerRef}
      >
        <Image
          ref={imgRef}
          src={level.imageUrl}
          alt="Level"
          fill
          priority
          className="block pointer-events-none object-contain"
          onLoad={() => setLayoutTrigger(t => t + 1)}
        />

        {/* This div exactly perfectly overlays the rendered image */}
        <div
          className="absolute"
          style={{
            left: `${imgLayout.offsetX}px`,
            top: `${imgLayout.offsetY}px`,
            width: `${imgLayout.width}px`,
            height: `${imgLayout.height}px`,
            pointerEvents: 'auto',
            touchAction: 'none' // Prevent pull-to-refresh or scrolling on touch
          }}
          // -- DEBUG DEBUT (à supprimer) --
          onPointerDownCapture={(e) => {
            if (!isDev || !currentObj) return;
            const rect = e.currentTarget.getBoundingClientRect();
            let clickX, clickY;
            if (isPortraitPhone) {
              clickX = e.clientY - rect.top;
              clickY = rect.width - (e.clientX - rect.left);
            } else {
              clickX = e.clientX - rect.left;
              clickY = e.clientY - rect.top;
            }
            const targetXPixel = (currentObj.x / 100) * imgLayout.width;
            const targetYPixel = (currentObj.y / 100) * imgLayout.height;
            const targetRadiusPixel = (currentObj.radius / 100) * imgLayout.width;
            const dx = clickX - targetXPixel;
            const dy = clickY - targetYPixel;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            setDebugInfo({
              targetX: targetXPixel.toFixed(1),
              targetY: targetYPixel.toFixed(1),
              clickX: clickX.toFixed(1),
              clickY: clickY.toFixed(1),
              distance: distance.toFixed(1),
              radius: targetRadiusPixel.toFixed(1),
              isHit: distance <= targetRadiusPixel,
              objName: currentObj.th + " (" + currentObj.fr + ")",
              clientY: e.clientY,
              rectTop: rect.top,
              rectHeight: rect.height,
              imgLayoutHeight: imgLayout.height.toFixed(1)
            });
          }}
          // -- DEBUG FIN --
          onPointerDown={(e) => {
            if (levelState === 'playing') {
              handleMistake();
            }
          }}
        >
          {/* Active Hitbox: perfectly aligns and relies on browser's native hit testing */}
          {currentObj && levelState === 'playing' && (
             <>
               {timerSeconds >= AUTO_HIGHLIGHT_TIME && !isMagnifierActive && (
                 <div
                   className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-ping opacity-60 bg-amber-400"
                   style={{
                     left: `${currentObj.x}%`,
                     top: `${currentObj.y}%`,
                     width: `${currentObj.radius * 2.5}%`,
                     paddingTop: `${currentObj.radius * 2.5}%`,
                   }}
                 />
               )}
               {timerSeconds >= AUTO_HIGHLIGHT_TIME && !isMagnifierActive && (
                 <div
                   className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-40 bg-amber-400 blur-sm"
                   style={{
                     left: `${currentObj.x}%`,
                     top: `${currentObj.y}%`,
                     width: `${currentObj.radius * 2.2}%`,
                     paddingTop: `${currentObj.radius * 2.2}%`,
                   }}
                 />
               )}
               <div
                 className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-10"
                 style={{
                   left: `${currentObj.x}%`,
                   top: `${currentObj.y}%`,
                   width: `${currentObj.radius * 2}%`,
                   paddingTop: `${currentObj.radius * 2}%`,
                 }}
                 onPointerDown={(e) => {
                   e.stopPropagation(); // Prevent the mistake handler from firing
                   e.preventDefault();
                   if (levelState === 'playing') {
                     if (isMagnifierActive) setIsMagnifierActive(false);
                     handleCorrect();
                   }
                 }}
               />
             </>
          )}

          {foundObjects.map(obj => (
            <div
              key={obj.id}
              className="absolute border-4 border-emerald-500/50 bg-emerald-500/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 animate-in zoom-in z-0"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                width: `${obj.radius * 2}%`,
                paddingTop: `${obj.radius * 2}%`,
              }}
            />
          ))}

          {/* Magnifier Overlay */}
          {isMagnifierActive && currentObj && levelState === 'playing' && (
            <div 
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at ${currentObj.x}% ${currentObj.y}%, transparent 0%, rgba(0,0,0,0.85) ${Math.max(12, currentObj.radius * 2.5)}%, rgba(0,0,0,0.95) 100%)`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`z-[100] bg-slate-900 flex flex-col overflow-hidden fixed inset-0 font-sans`}
      style={isPortraitPhone ? {
        width: '100vh',
        height: '100vw',
        transform: 'rotate(90deg) translateY(-100%)',
        transformOrigin: 'top left'
      } : undefined}
    >
      {/* Top Image Panel */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{
          paddingLeft: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-top))' : 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-bottom))' : 'max(0.5rem, env(safe-area-inset-right))',
          paddingTop: '0.5rem'
        }}
      >
        {renderGameArea()}
      </div>

      {/* Bottom HUD Panel */}
      <div
        className={`h-14 lg:h-32 bg-white/95 backdrop-blur-md border-t border-slate-100 flex flex-row items-center justify-between shrink-0 w-full z-[120] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]`}
        style={{
          paddingLeft: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-top))' : 'max(1rem, env(safe-area-inset-left))',
          paddingRight: isPortraitPhone ? 'max(0.5rem, env(safe-area-inset-bottom))' : 'max(1rem, env(safe-area-inset-right))',
          paddingBottom: isPortraitPhone ? '0' : 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Left side: Back & Progress */}
        <div className="flex items-center gap-1.5 lg:gap-4 h-full pl-1 lg:pl-2">
          <Link href="/detective" className="p-1.5 lg:p-3 text-slate-500 hover:bg-slate-100 rounded-full transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5 lg:w-8 lg:h-8" />
          </Link>
          <div className="flex flex-col justify-center h-full">
            <div className="flex gap-0.5 lg:gap-1 mb-0.5 lg:mb-1 relative">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={isLandscapePhone || isPortraitPhone ? 10 : 16} className={i < earnedStars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
              ))}
              {showStarLoss && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 z-[200] text-[10px] lg:text-xs font-bold text-rose-500 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 drop-shadow-lg bg-rose-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md border border-rose-200 flex items-center gap-1 whitespace-nowrap">
                  -1 <Star size={isLandscapePhone || isPortraitPhone ? 10 : 12} className="fill-rose-500" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 lg:gap-2">
              <div className="w-16 lg:w-32 h-2 lg:h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(currentIndex / (level.objects?.length || 1)) * 100}%` }} />
              </div>
              <span className="text-[10px] lg:text-sm font-bold text-slate-600 min-w-[1.5rem] lg:min-w-[2rem]">{currentIndex}/{level.objects?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Center: Current Word */}
        <div className="flex-1 flex items-center justify-center gap-2 lg:gap-6 px-1 lg:px-2">
          <button 
            onClick={(e) => { e.stopPropagation(); playThaiTTS(currentObj.th); }} 
            className="w-8 h-8 lg:w-16 lg:h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md lg:shadow-lg shrink-0 transition-transform active:scale-95 border lg:border-2 border-emerald-400"
          >
            <Volume2 className="w-4 h-4 lg:w-8 lg:h-8" />
          </button>
          
          <div className="flex flex-col items-center justify-center min-w-[80px] lg:min-w-[200px]">
            <div className="text-lg lg:text-4xl font-bold font-thai text-slate-800 mb-0 lg:mb-1 tracking-wide">
              {currentObj.th}
            </div>
            <div className="h-4 lg:h-8 flex items-center justify-center">
              {difficulty === 2 ? (
                <span className="text-[9px] lg:text-sm font-bold text-slate-400 uppercase tracking-widest">{getTranslation('auto.hard_mode', language)}</span>
              ) : (
                isTranslationRevealed || currentMistakes >= 2 ? (
                  <span className="text-[10px] lg:text-lg font-bold text-emerald-600 animate-in fade-in slide-in-from-bottom-1 px-2 lg:px-3 py-0 lg:py-0.5 bg-emerald-100/50 rounded-full">
                    {getLocalizedField(currentObj, '', language)}
                  </span>
                ) : (
                  <button onClick={() => setIsTranslationRevealed(true)} className="flex items-center gap-1 lg:gap-1.5 px-2 py-0.5 lg:px-4 lg:py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[9px] lg:text-sm font-bold transition-colors shadow-sm active:scale-95">
                    <Eye className="w-3 h-3 lg:w-4 lg:h-4" /> {getTranslation('auto.show_hint', language)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right side: Magnifying Glass Bonus */}
        <div className="flex items-center justify-end w-[60px] lg:w-[120px] pr-1 lg:pr-2">
          <button 
            onClick={() => setIsMagnifierActive(!isMagnifierActive)}
            className={`relative w-8 h-8 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-md lg:shadow-lg transition-all border lg:border-2 overflow-hidden
              ${isMagnifierActive 
                ? 'bg-amber-400 border-amber-300 text-amber-900 scale-95 shadow-inner' 
                : 'bg-gradient-to-b from-[#4bc4e6] to-[#2c98b8] border-[#227b96] text-white hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            <Search className={`w-4 h-4 lg:w-8 lg:h-8 relative z-10 ${isMagnifierActive ? 'drop-shadow-sm' : 'drop-shadow-md'}`} />
            {/* Shine effect */}
            {!isMagnifierActive && <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50"></div>}
          </button>
        </div>
      </div>

      {/* -- DEBUG MODAL DEBUT (à supprimer) -- */}
      {debugInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white text-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-2 text-sm shadow-xl" style={{ transform: isPortraitPhone ? 'rotate(-90deg)' : 'none' }}>
            <h3 className="font-bold text-lg mb-2 text-indigo-600">Debug PWA Clic</h3>
            <p><strong>Objet :</strong> {debugInfo.objName}</p>
            <p><strong>Cible estimée :</strong> X: {debugInfo.targetX} | Y: {debugInfo.targetY}</p>
            <p><strong>Position cliquée :</strong> X: {debugInfo.clickX} | Y: {debugInfo.clickY}</p>
            <p><strong>Distance (Écart) :</strong> {debugInfo.distance} px</p>
            <p><strong>Périmètre (Rayon) :</strong> {debugInfo.radius} px</p>
            <p><strong>Dans la zone ? :</strong> {debugInfo.isHit ? <span className="text-emerald-500 font-bold">OUI (Touché)</span> : <span className="text-rose-500 font-bold">NON (Raté)</span>}</p>
            <hr className="my-2 border-slate-200" />
            <p className="text-xs text-slate-500"><strong>Détails OS :</strong></p>
            <p className="text-xs text-slate-500">clientY: {debugInfo.clientY} | rectTop: {debugInfo.rectTop}</p>
            <p className="text-xs text-slate-500">rectHeight: {debugInfo.rectHeight} | layoutHeight: {debugInfo.imgLayoutHeight}</p>
            
            <button 
              onClick={() => setDebugInfo(null)}
              className="mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl"
            >
              Fermer la modale
            </button>
          </div>
        </div>
      )}
      {/* -- DEBUG MODAL FIN -- */}
    </div>
  );
}
