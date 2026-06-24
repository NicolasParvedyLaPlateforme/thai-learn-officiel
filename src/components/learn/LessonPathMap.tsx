import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { LessonPathMobileNav } from './LessonPathMobileNav';
import { LessonPathNode } from './LessonPathNode';
import { getLevelSplit } from '@/lib/levelSplits';

interface LessonPathMapProps {
  maxLevel: number;
  currentProgress: number;
  modalLevel: number | null;
  setModalLevel: (lvl: number) => void;
  earnedStarsArray: number[];
  unitColor: string;
  unitBorder: string;
  unitText: string;
  language: string;
  lessonId?: string;
  lesson?: any;
  lessonPartsCompleted?: Record<string, number[]>;
  suggestionType?: string;
  initialScrollLevel?: number;
  onReady?: () => void;
  onBack?: () => void;
}

/** Base slot height in px */
const BASE_SLOT_HEIGHT = 290;
/** Extra height per additional part (beyond 1) in the connecting segment */
const EXTRA_PER_PART = 100;

export function LessonPathMap({
  maxLevel,
  currentProgress,
  modalLevel,
  setModalLevel,
  earnedStarsArray,
  unitColor,
  unitBorder,
  unitText,
  language,
  lessonId,
  lesson,
  lessonPartsCompleted,
  suggestionType,
  initialScrollLevel,
  onReady,
  onBack
}: LessonPathMapProps) {
  const nodes = Array.from({ length: maxLevel + 1 }).map((_, i) => i).reverse();

  const effectiveCurrent = currentProgress > maxLevel ? maxLevel : currentProgress;
  const targetScrollLevel = initialScrollLevel !== undefined && initialScrollLevel !== null ? initialScrollLevel : effectiveCurrent;

  /**
   * Compute the div height for a given slot.
   * The slot for levelIndex displays parts of levelIndex-1 along its path.
   * Extra height is based on partsOf(levelIndex-1).
   * Note: mastery slot (index === maxLevel) ALSO gets extra height for parts
   * of the last level (levelIndex-1 = maxLevel-1).
   */
  const getSlotHeight = (index: number): number => {
    if (index === 0) return BASE_SLOT_HEIGHT; // No path below level 0
    const prevParts = lesson ? getLevelSplit(index - 1, lesson) : 1;
    const extra = prevParts > 1 ? (prevParts - 1) * EXTRA_PER_PART : 0;
    return BASE_SLOT_HEIGHT + extra;
  };

  /**
   * Actual pixel distance between center of levelIndex node and center of (levelIndex-1) node.
   * Each slot div's center is at height/2, so:
   *   dist = slotHeight(index)/2 + slotHeight(index-1)/2
   *
   * This is used as the SVG height for the connecting path, ensuring the path
   * ends exactly at the previous node's center (no overshoot / tail).
   */
  const getPathHeight = (index: number): number => {
    if (index <= 0) return 0;
    return getSlotHeight(index) / 2 + getSlotHeight(index - 1) / 2;
  };

  const getOffset = (index: number) => {
    return index % 2 === 0 ? -120 : 120;
  };

  const getMobileOffset = (index: number) => {
    return index % 2 === 0 ? -95 : 95;
  };

  const getImageNameForLevel = (index: number) => {
    switch (index) {
      case 0: return 'find-the-good-traduction-removebg-preview.png';
      case 1: return 'complete-the-sentence.png';
      case 2: return 'build-your-sentence-removebg.png';
      case 3: return 'build-your-sentence-removebg.png';
      case 4: return 'niveau-5-nobg.png';
      case 5: return 'level-6-nobg.png';
      case 6: return 'level-7-nobg.png';
      case 7: return 'level-8-nobg.png';
      case 8: return 'level-9-nobg.png';
      case 9: return 'level-10-nobg.png';
      default: return null;
    }
  };

  /**
   * Generate a cubic bezier SVG path.
   * The SVG top is at top-1/2 of the slot (= this node's center, y=0).
   * The path ends at y=pathHeight = the previous node's center.
   */
  const generatePath = (index: number, isMobile: boolean) => {
    const height = getPathHeight(index);
    const startX = 100 + (isMobile ? getMobileOffset(index) : getOffset(index));
    const endX   = 100 + (isMobile ? getMobileOffset(index - 1) : getOffset(index - 1));
    const c1y = isMobile ? height * 0.8 : height * 0.5;
    const c2y = isMobile ? height * 0.2 : height * 0.5;
    return `M ${startX} 0 C ${startX} ${c1y}, ${endX} ${c2y}, ${endX} ${height}`;
  };

  const currentLevelRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const targetLevel = initialScrollLevel !== undefined ? initialScrollLevel : currentProgress;
  const [activeMobileLevel, setActiveMobileLevel] = useState<number | null>(targetLevel);
  const [isReady, setIsReady] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const isClickScrolling = useRef(false);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMenuVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (activeMobileLevel !== null && carouselRef.current) {
      if (isClickScrolling.current) return; 

      const doScroll = () => {
        const button = carouselRef.current?.querySelector(`[data-nav-level="${activeMobileLevel}"]`) as HTMLElement;
        if (button && carouselRef.current) {
          const container = carouselRef.current;
          const containerRect = container.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          const scrollLeft = container.scrollLeft + (buttonRect.left - containerRect.left) - (containerRect.width / 2) + (buttonRect.width / 2);
          container.scrollTo({ left: scrollLeft, behavior: 'auto' });
        }
      };

      doScroll();
      const t = setTimeout(doScroll, 150);
      return () => clearTimeout(t);
    }
  }, [activeMobileLevel]);

  useEffect(() => {
    if (currentLevelRef.current) {
      setTimeout(() => {
        currentLevelRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
        setTimeout(() => {
          setIsReady(true);
          onReady?.();
        }, 50);
      }, 10);
    } else {
      setIsReady(true);
      onReady?.();
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    // Hystérésis : on ne change de nœud actif que si le nouveau candidat
    // dépasse le nœud actuel d'au moins HYSTERESIS_PX pixels.
    // Cela évite le flicker quand une carte est exactement à la frontière.
    const HYSTERESIS_PX = 40;

    const handleScroll = () => {
      if (isClickScrolling.current) {
        if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
        scrollEndTimer.current = setTimeout(() => {
          isClickScrolling.current = false;
        }, 150);
        return;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const centerY = window.innerHeight / 2;

          // Calculer la distance de chaque nœud au centre
          const distances: { index: number; distance: number }[] = [];
          nodeRefs.current.forEach((node, index) => {
            if (node) {
              const rect = node.getBoundingClientRect();
              const nodeCenter = rect.top + rect.height / 2;
              distances.push({ index, distance: Math.abs(centerY - nodeCenter) });
            }
          });

          if (distances.length === 0) {
            ticking = false;
            return;
          }

          // Trouver le nœud le plus proche
          distances.sort((a, b) => a.distance - b.distance);
          const best = distances[0];

          if (best.distance >= window.innerHeight / 2) {
            ticking = false;
            return;
          }

          setActiveMobileLevel((prev) => {
            if (prev === best.index) return prev;

            // Si un nœud actif existe, vérifier qu'il n'est pas "presque aussi proche"
            if (prev !== null) {
              const currentEntry = distances.find((d) => d.index === prev);
              if (currentEntry) {
                // On ne change que si le nouveau est clairement plus proche (hystérésis)
                if (currentEntry.distance - best.distance < HYSTERESIS_PX) {
                  return prev; // Pas assez d'avance → on garde le nœud actuel
                }
              }
            }

            return best.index;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isUnlockedMastery = currentProgress >= maxLevel;

  return (
    <div className="flex flex-col items-center justify-start w-full relative pt-8 pb-[15vh] lg:pb-[30vh]">
      {/* Floating Back Button (Desktop) */}
      {typeof document !== 'undefined' && createPortal(
        <div 
          className={`hidden lg:block fixed bottom-6 lg:bottom-10 left-6 lg:left-10 z-[100] transition-all duration-500 ease-out ${menuVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        >
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${unitColor} text-white`}
            >
              <ChevronLeft size={28} />
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Horizontal Navigation Bar (Mobile) */}
      <LessonPathMobileNav
        nodes={nodes}
        maxLevel={maxLevel}
        currentProgress={currentProgress}
        activeMobileLevel={activeMobileLevel}
        setActiveMobileLevel={setActiveMobileLevel}
        unitColor={unitColor}
        isUnlockedMastery={isUnlockedMastery}
        menuVisible={menuVisible}
        carouselRef={carouselRef}
        isClickScrolling={isClickScrolling}
        scrollEndTimer={scrollEndTimer}
        onBack={onBack}
      />

      {nodes.map((levelIndex) => (
        <LessonPathNode
          key={levelIndex}
          levelIndex={levelIndex}
          maxLevel={maxLevel}
          currentProgress={currentProgress}
          modalLevel={modalLevel}
          setModalLevel={setModalLevel}
          earnedStarsArray={earnedStarsArray}
          unitColor={unitColor}
          unitBorder={unitBorder}
          unitText={unitText}
          language={language}
          lessonId={lessonId}
          lesson={lesson}
          lessonPartsCompleted={lessonPartsCompleted}
          suggestionType={suggestionType}
          targetScrollLevel={targetScrollLevel}
          activeMobileLevel={activeMobileLevel}
          nodeRefs={nodeRefs}
          currentLevelRef={currentLevelRef}
          getImageNameForLevel={getImageNameForLevel}
          getMobileOffset={getMobileOffset}
          getOffset={getOffset}
          generatePath={generatePath}
          slotHeight={getSlotHeight(levelIndex)}
          pathHeight={getPathHeight(levelIndex)}
        />
      ))}
    </div>
  );
}
