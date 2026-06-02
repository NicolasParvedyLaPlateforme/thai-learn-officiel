'use client';

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { DetectiveLevel, DetectiveObject } from '../../types';
import { useProgressStore } from '../../lib/store';
import { Volume2, Search, CheckCircle2, Maximize, Minimize } from 'lucide-react';
import { playThaiTTS } from '../../lib/tts';
import confetti from 'canvas-confetti';

interface Props {
  level: DetectiveLevel;
}

export default function DetectiveGame({ level }: Props) {
  const { language } = useProgressStore();

  const [objects, setObjects] = useState<DetectiveObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [levelState, setLevelState] = useState<'intro' | 'playing' | 'completed'>('intro');
  // Niveau 1 = Thaï + FR, Niveau 2 = Thaï uniquement
  const [difficulty, setDifficulty] = useState<1 | 2>(1);
  const [mistakes, setMistakes] = useState(0);
  const [foundObjects, setFoundObjects] = useState<DetectiveObject[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialisation (mélanger les objets pour que ce ne soit pas toujours dans le même ordre)
  useEffect(() => {
    if (level.objects && level.objects.length > 0) {
      // Shuffle array
      const shuffled = [...level.objects].sort(() => 0.5 - Math.random());
      setObjects(shuffled);
    }
  }, [level]);

  // Handle escape key for fullscreen exit
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
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        // Force landscape if supported on mobile
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => { });
        }
      } catch (e) {
        // Ignore errors
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch (e) {
        // Ignore errors
      }
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
    const xPixel = e.clientX - rect.left;
    const yPixel = e.clientY - rect.top;

    const xPct = (xPixel / rect.width) * 100;
    const yPct = (yPixel / rect.height) * 100;

    // Calculer la distance entre le clic et le centre de l'objet (en considérant que le rayon est basé sur la largeur)
    // Pour être juste, il faut convertir les pct en pixels pour calculer la vraie distance
    const targetXPixel = (currentObj.x / 100) * rect.width;
    const targetYPixel = (currentObj.y / 100) * rect.height;
    const targetRadiusPixel = (currentObj.radius / 100) * rect.width;

    const dx = xPixel - targetXPixel;
    const dy = yPixel - targetYPixel;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= targetRadiusPixel) {
      // Found it!
      handleCorrect();
    } else {
      // Missed
      handleMistake();
    }
  };

  const handleCorrect = () => {
    playThaiTTS('ถูกต้อง'); // correct (tuk-tong)

    // Confetti effect at the bottom of the screen
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
      colors: ['#10B981', '#F59E0B'], // Emerald and Amber
      zIndex: isFullscreen ? 150 : 100 // Ensure confetti is above fullscreen overlay
    });

    const currentObj = objects[currentIndex];
    setFoundObjects([...foundObjects, currentObj]);

    if (currentIndex + 1 >= objects.length) {
      // Finished
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
    // Vibrate si possible
    if (navigator.vibrate) navigator.vibrate(200);
  };

  if (!level.objects || level.objects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Ce niveau ne contient aucun objet à trouver.
      </div>
    );
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
          {language === 'en'
            ? `Find ${objects.length} hidden objects in the image.`
            : `Trouve les ${objects.length} objets cachés dans l'image.`}
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={() => startGame(1)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all"
          >
            Niveau 1 (Thaï + Traduction)
          </button>
          <button
            onClick={() => startGame(2)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all"
          >
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
          {language === 'en'
            ? `You found all ${objects.length} objects with ${mistakes} mistakes.`
            : `Tu as trouvé les ${objects.length} objets avec ${mistakes} erreurs.`}
        </p>

        <button
          onClick={() => setLevelState('intro')}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-sm transition-all"
        >
          {language === 'en' ? 'Play Again' : 'Rejouer'}
        </button>
      </div>
    );
  }

  const currentObj = objects[currentIndex];

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[100] bg-slate-900 flex flex-col" : "flex flex-col h-full"}>

      {/* Top HUD - Floating if fullscreen, normal if not */}
      <div className={isFullscreen
        ? "absolute top-4 left-4 right-4 z-10 flex items-start justify-between pointer-events-none"
        : "bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex items-center justify-between"
      }>

        <div className={`flex items-center gap-4 pointer-events-auto ${isFullscreen ? 'bg-white/95 backdrop-blur-sm p-2 pr-4 rounded-full shadow-lg' : ''}`}>
          <button
            onClick={(e) => { e.stopPropagation(); playThaiTTS(currentObj.th); }}
            className="w-12 h-12 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <div>
            <h3 className="text-2xl font-bold font-thai text-slate-800">
              {currentObj.th}
            </h3>
            {difficulty === 1 && (
              <p className="text-slate-500 font-medium text-sm leading-tight">
                {language === 'en' ? currentObj.en : currentObj.fr}
              </p>
            )}
          </div>
        </div>

        <div className={`pointer-events-auto flex items-center gap-4 ${isFullscreen ? 'bg-white/95 backdrop-blur-sm p-2 px-4 rounded-full shadow-lg' : 'text-right'}`}>
          <div>
            {!isFullscreen && (
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                {language === 'en' ? 'Progress' : 'Progression'}
              </div>
            )}
            <div className={`font-black text-emerald-500 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
              {currentIndex} / {objects.length}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors shrink-0 ml-2"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div
        className={`w-full bg-slate-800 shadow-inner flex-1 flex items-center justify-center overflow-hidden min-h-0 ${isFullscreen ? 'h-full rounded-none' : 'rounded-2xl max-h-[70vh]'}`}
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
            style={{ width: 'auto', height: 'auto', maxHeight: isFullscreen ? '100dvh' : '70vh' }}
          />

          {/* Found objects overlay (circle highlights) */}
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
    </div>
  );
}
