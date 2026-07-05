'use client';

import { useEffect } from 'react';
import { useProgressStore } from '@/lib/store';

/**
 * MigrationRunner — runs one-time data migrations on client mount.
 *
 * Why a component instead of onRehydrateStorage:
 *   zustand/persist commits the rehydrated state BEFORE calling onRehydrateStorage,
 *   so any mutation of the `state` argument in that callback has no effect on the store.
 *   A useEffect runs after the store is fully initialized, making setState() safe.
 */
export default function MigrationRunner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Migration: reconstitute fullLevelsCompleted ────────────────────────
    // When users played levels part-by-part, fullLevelsCompleted was never
    // populated (completeLesson was guarded by isFromParts=false, now fixed).
    // We rebuild it from lessonLevels: if lessonLevel[id] = N, levels 0..N-1 are done.
    const migrationKey = 'migration_fullLevelsCompleted_v2';
    if (!window.localStorage.getItem(migrationKey)) {
      try {
        const state = useProgressStore.getState();
        const lessonLevels = state.lessonLevels || {};
        const currentFullLevelsCompleted = state.fullLevelsCompleted || {};
        const newFullLevelsCompleted: Record<string, number[]> = { ...currentFullLevelsCompleted };
        let migrated = false;

        Object.entries(lessonLevels).forEach(([lessonId, level]) => {
          // Skip speak / alphabet — they don't use the fullLevelsCompleted system
          if (
            lessonId.startsWith('speak_') ||
            lessonId.startsWith('alphabet_') ||
            lessonId.startsWith('alpha-')
          ) return;

          const numLevel = Number(level);
          if (numLevel <= 0) return;

          const existing = newFullLevelsCompleted[lessonId] || [];
          const levelsToAdd: number[] = [];

          // If lessonLevel = N, the user has passed levels 0 through N-1
          for (let i = 0; i < numLevel; i++) {
            if (!existing.includes(i)) {
              levelsToAdd.push(i);
            }
          }

          if (levelsToAdd.length > 0) {
            newFullLevelsCompleted[lessonId] = [...existing, ...levelsToAdd];
            migrated = true;
          }
        });

        if (migrated) {
          useProgressStore.setState({ fullLevelsCompleted: newFullLevelsCompleted });
        }

        window.localStorage.setItem(migrationKey, 'true');
      } catch (e) {
        console.error('[MigrationRunner] fullLevelsCompleted migration failed:', e);
      }
    }
  }, []);

  return null;
}
