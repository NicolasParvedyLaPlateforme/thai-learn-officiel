/**
 * next-mode-utils.ts
 * Logique pure (sans état React) pour le mode automatique /next.
 * Calcule le prochain exercice à lancer selon la progression de l'utilisateur.
 */

import { getLevelSplit } from '@/lib/levelSplits';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NextModeStep {
  type: 'parts' | 'full';
  levelIndex: number; // 0-indexed (0 = niveau 1, 10 = ultime)
}

export interface NextLessonResult {
  lessonId: string;
  levelIndex: number;      // 0-indexed
  type: 'parts' | 'full'; // parts = mode slice, full = niveau entier
  partIndex: number | null;
  totalParts: number;
  isUltimate: boolean;
}

// ─── Séquence globale ────────────────────────────────────────────────────────

/**
 * Séquence complète des étapes pour le mode /next :
 *
 * Phase 1 — Parts des niveaux 1 à 4 (levelIndex 0 à 3)
 * Phase 2+3 interleaved — Full niveau N débloque parts du niveau N+4
 *   Full niveau 1 → Parts niveau 5
 *   Full niveau 2 → Parts niveau 6
 *   ...
 *   Full niveau 6 → Parts niveau 10
 * Phase 4 — Niveau Ultime (levelIndex 10)
 */
export const NEXT_MODE_SEQUENCE: NextModeStep[] = [
  // Phase 1 : parts niveaux 1-4
  { type: 'parts', levelIndex: 0 },
  { type: 'parts', levelIndex: 1 },
  { type: 'parts', levelIndex: 2 },
  { type: 'parts', levelIndex: 3 },
  // Phase 2+3 : full N → parts N+4
  { type: 'full',  levelIndex: 0 }, // full niveau 1
  { type: 'parts', levelIndex: 4 }, // parts niveau 5
  { type: 'full',  levelIndex: 1 }, // full niveau 2
  { type: 'parts', levelIndex: 5 }, // parts niveau 6
  { type: 'full',  levelIndex: 2 }, // full niveau 3
  { type: 'parts', levelIndex: 6 }, // parts niveau 7
  { type: 'full',  levelIndex: 3 }, // full niveau 4
  { type: 'parts', levelIndex: 7 }, // parts niveau 8
  { type: 'full',  levelIndex: 4 }, // full niveau 5
  { type: 'parts', levelIndex: 8 }, // parts niveau 9
  { type: 'full',  levelIndex: 5 }, // full niveau 6
  { type: 'parts', levelIndex: 9 }, // parts niveau 10
  // Phase 4 : Ultime
  { type: 'full',  levelIndex: 10 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Vérifie si toutes les parts d'un niveau donné sont complétées pour une leçon.
 */
function arePartsComplete(
  lessonId: string,
  levelIndex: number,
  lesson: any,
  lessonPartsCompleted: Record<string, number[]>
): boolean {
  const totalParts = getLevelSplit(levelIndex, lesson);
  const key = `${lessonId}_level-${levelIndex}`;
  const done = lessonPartsCompleted[key] || [];
  return done.length >= totalParts;
}

/**
 * Retourne le premier partIndex non complété pour un niveau.
 * Retourne null si toutes les parts sont déjà faites.
 */
function getNextPart(
  lessonId: string,
  levelIndex: number,
  lesson: any,
  lessonPartsCompleted: Record<string, number[]>
): { partIndex: number; totalParts: number } | null {
  const totalParts = getLevelSplit(levelIndex, lesson);
  const key = `${lessonId}_level-${levelIndex}`;
  const done = lessonPartsCompleted[key] || [];

  for (let i = 0; i < totalParts; i++) {
    if (!done.includes(i)) {
      return { partIndex: i, totalParts };
    }
  }
  return null;
}

/**
 * Vérifie si le niveau entier a déjà été complété (fullLevelsCompleted).
 */
function isFullLevelComplete(
  lessonId: string,
  levelIndex: number,
  fullLevelsCompleted: Record<string, number[]>,
  lessonStars?: Record<string, number[]>
): boolean {
  if (levelIndex === 10) {
    // Niveau Ultime : vérifié via lessonStars[lessonId][10] > 0
    const stars = lessonStars?.[lessonId] || [];
    return (stars[10] || 0) > 0;
  }
  const completed = fullLevelsCompleted[lessonId] || [];
  return completed.includes(levelIndex);
}

/**
 * Vérifie si un levelIndex est accessible pour une leçon.
 * Une leçon est accessible si lessonLevels[lessonId] >= levelIndex.
 */
function isLevelAccessible(
  lessonId: string,
  levelIndex: number,
  lessonLevels: Record<string, number>
): boolean {
  if (levelIndex === 10) {
    // Ultime = accessible quand lessonLevels >= 10
    return (lessonLevels[lessonId] || 0) >= 10;
  }
  return (lessonLevels[lessonId] || 0) >= levelIndex;
}

// ─── Algorithme principal ────────────────────────────────────────────────────

/**
 * Identifie si une leçon est un "Bilan" (révision d'unité).
 * Même détection que le reste du projet (levelSplits, LessonClientPage, etc.)
 */
function isBilanLesson(lesson: any): boolean {
  return (
    lesson.isReview === true ||
    lesson.id?.startsWith('bilan-') ||
    lesson.id?.includes('-bilan') ||
    lesson.title?.toLowerCase().includes('bilan') ||
    lesson.titleEn?.toLowerCase().includes('review')
  );
}

/**
 * Vérifie si toutes les leçons d'une liste ont leur niveau Ultime (levelIndex=10) terminé.
 */
function areAllUltimatesComplete(
  lessons: any[],
  fullLevelsCompleted: Record<string, number[]>,
  lessonStars: Record<string, number[]>
): boolean {
  return lessons.every((l) =>
    isFullLevelComplete(l.id, 10, fullLevelsCompleted, lessonStars)
  );
}

/**
 * Calcule le prochain exercice à lancer en mode /next.
 *
 * Règle des bilans :
 *   Les leçons de type "Bilan" (révision d'unité) ne sont proposées
 *   qu'une fois que tous les niveaux Ultimes des leçons normales sont terminés.
 *
 * @param unitLessons - Leçons de l'unité du jour (dans l'ordre)
 * @param lessonLevels - Record<lessonId, levelReached>
 * @param lessonPartsCompleted - Record<lessonId_level-X, number[]>
 * @param fullLevelsCompleted - Record<lessonId, number[]>
 * @param lessonStars - Record<lessonId, number[]>
 * @param dailySeed - Nombre aléatoire fixe pour la journée (pour mélanger les leçons de façon stable)
 * @returns NextLessonResult ou null si tout est complété
 */
export function computeNextLesson(
  unitLessons: any[],
  lessonLevels: Record<string, number>,
  lessonPartsCompleted: Record<string, number[]>,
  fullLevelsCompleted: Record<string, number[]>,
  lessonStars: Record<string, number[]>,
  dailySeed: number
): NextLessonResult | null {
  if (!unitLessons || unitLessons.length === 0) return null;

  // Séparer les leçons normales des bilans
  const regularLessons = unitLessons.filter((l) => !isBilanLesson(l));
  const bilanLessons = unitLessons.filter((l) => isBilanLesson(l));

  // Mélanger de manière pseudo-aléatoire mais stable pour la journée
  const shuffledRegular = shuffleWithSeed([...regularLessons], dailySeed);
  const shuffledBilan   = shuffleWithSeed([...bilanLessons],   dailySeed + 1);

  // ── Étape 1 : Appliquer la séquence complète sur les leçons normales ─────
  const regularResult = runSequence(
    shuffledRegular,
    lessonLevels,
    lessonPartsCompleted,
    fullLevelsCompleted,
    lessonStars
  );
  if (regularResult) return regularResult;

  // ── Étape 2 : Les bilans ne démarrent qu'une fois tous les Ultimes normaux terminés ──
  if (bilanLessons.length === 0) return null;

  if (!areAllUltimatesComplete(regularLessons, fullLevelsCompleted, lessonStars)) {
    // Les leçons normales ne sont pas toutes au niveau Ultime : pas encore de bilan
    return null;
  }

  // ── Étape 3 : Appliquer la séquence sur les bilans ───────────────────────
  return runSequence(
    shuffledBilan,
    lessonLevels,
    lessonPartsCompleted,
    fullLevelsCompleted,
    lessonStars
  );
}

/**
 * Applique la séquence de progression sur une liste de leçons.
 *
 * Ordre d'itération : LEÇON EN PREMIER, puis niveaux au sein de la leçon.
 *
 * Phase 1 — Parts des niveaux 1 à 4, leçon par leçon :
 *   Leçon A : parts niv.1 → parts niv.2 → parts niv.3 → parts niv.4
 *   Leçon B : parts niv.1 → parts niv.2 → parts niv.3 → parts niv.4
 *   ...
 *
 * Phase 2+3 — Paires (Full niv.N → Parts niv.N+4), leçon par leçon :
 *   Pour chaque paire i (0..5) :
 *     Leçon A : Full niv.i → Parts niv.(i+4)
 *     Leçon B : Full niv.i → Parts niv.(i+4)
 *     ...
 *   Puis paire suivante.
 *
 * Phase 4 — Niveau Ultime, leçon par leçon.
 */
function runSequence(
  lessons: any[],
  lessonLevels: Record<string, number>,
  lessonPartsCompleted: Record<string, number[]>,
  fullLevelsCompleted: Record<string, number[]>,
  lessonStars: Record<string, number[]>
): NextLessonResult | null {
  if (lessons.length === 0) return null;

  // ── Phase 1 : Parts des niveaux 1-4 (Progression Verticale) ────────────────
  for (const lesson of lessons) {
    let hasMoreParts = true;
    let targetPartIndex = 0;
    
    while (hasMoreParts) {
      hasMoreParts = false;
      for (const levelIndex of [0, 1, 2, 3]) {
        // Vertical unlock: to access levelIndex, Part 1 (index 0) of levelIndex - 1 must be completed.
        let isVerticallyAccessible = true;
        if (levelIndex > 0) {
          const prevKey = `${lesson.id}_level-${levelIndex - 1}`;
          const prevDone = lessonPartsCompleted[prevKey] || [];
          isVerticallyAccessible = prevDone.includes(0);
        }
        
        if (!isVerticallyAccessible) continue;
        
        const totalParts = lesson ? getLevelSplit(levelIndex, lesson) : 1;
        if (targetPartIndex < totalParts) {
          hasMoreParts = true;
          
          const key = `${lesson.id}_level-${levelIndex}`;
          const done = lessonPartsCompleted[key] || [];
          
          if (!done.includes(targetPartIndex)) {
            return {
              lessonId: lesson.id,
              levelIndex,
              type: 'parts',
              partIndex: targetPartIndex,
              totalParts,
              isUltimate: false,
            };
          }
        }
      }
      targetPartIndex++;
    }
  }

  // ── Phase 2+3 : Paires Full niv.i → Parts niv.(i+4), leçon par leçon ───
  //   i=0 : Full niv.1 → Parts niv.5
  //   i=1 : Full niv.2 → Parts niv.6
  //   ...
  //   i=5 : Full niv.6 → Parts niv.10
  for (let i = 0; i <= 5; i++) {
    const fullLevelIndex  = i;      // 0..5  (niveaux 1..6)
    const partsLevelIndex = i + 4;  // 4..9  (niveaux 5..10)

    for (const lesson of lessons) {
      // a) Le Full level doit être fait d'abord (prérequis du parts level suivant)
      if (isLevelAccessible(lesson.id, fullLevelIndex, lessonLevels)) {
        if (!isFullLevelComplete(lesson.id, fullLevelIndex, fullLevelsCompleted, lessonStars)) {
          return {
            lessonId: lesson.id,
            levelIndex: fullLevelIndex,
            type: 'full',
            partIndex: null,
            totalParts: 1,
            isUltimate: false,
          };
        }
      }

      // b) Une fois le Full terminé, les parts du niveau débloqué
      if (isLevelAccessible(lesson.id, partsLevelIndex, lessonLevels)) {
        const nextPart = getNextPart(lesson.id, partsLevelIndex, lesson, lessonPartsCompleted);
        if (nextPart) {
          return {
            lessonId: lesson.id,
            levelIndex: partsLevelIndex,
            type: 'parts',
            partIndex: nextPart.partIndex,
            totalParts: nextPart.totalParts,
            isUltimate: false,
          };
        }
      }
    }
  }

  // ── Phase 4 : Niveau Ultime (levelIndex 10), leçon par leçon ────────────
  for (const lesson of lessons) {
    if (!isLevelAccessible(lesson.id, 10, lessonLevels)) continue;
    if (!isFullLevelComplete(lesson.id, 10, fullLevelsCompleted, lessonStars)) {
      return {
        lessonId: lesson.id,
        levelIndex: 10,
        type: 'full',
        partIndex: null,
        totalParts: 1,
        isUltimate: true,
      };
    }
  }

  return null; // Tout est complété pour ce groupe de leçons
}


/**
 * Construit l'URL de leçon à partir du résultat de computeNextLesson.
 */
export function buildNextLessonUrl(result: NextLessonResult): string {
  const levelParam = result.levelIndex + 1; // URL = 1-indexed
  const base = `/lesson/${result.lessonId}?level=${levelParam}&from=next`;

  if (result.type === 'parts' && result.totalParts > 1 && result.partIndex !== null) {
    return `${base}&part=${result.partIndex}&totalParts=${result.totalParts}`;
  }

  // Mode full (ou parts avec totalParts=1) : pas de paramètre part
  return base;
}

// ─── Gestion de l'unité du jour ───────────────────────────────────────────────

/**
 * Retourne la date locale sous forme "YYYY-MM-DD".
 */
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Sélectionne (ou réutilise) l'unité du jour.
 * Si la date a changé, tire un nouvel index au hasard.
 */
export function getDailyUnitIndex(
  totalUnits: number,
  stored: { unitIndex: number; date: string } | null
): number {
  const today = getLocalDateString();
  if (stored && stored.date === today) {
    return stored.unitIndex;
  }
  // Tirage aléatoire d'une nouvelle unité
  return Math.floor(Math.random() * totalUnits);
}

// ─── Utilitaire ──────────────────────────────────────────────────────────────

/**
 * Mélange un tableau avec un seed numérique (Fisher-Yates pseudo-aléatoire).
 * Garantit que l'ordre est stable pour une même valeur de seed.
 */
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
