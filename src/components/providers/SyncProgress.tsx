"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useProgressStore } from "@/lib/store";
import { getProgress, saveProgress } from "@/actions/syncProgress";
import { generateNetworkSignature } from "@/lib/security";

export default function SyncProgress() {
  const { data: session, status } = useSession();
  const store = useProgressStore();
  const isInitialSyncDone = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastForceSyncRef = useRef(0);

  // Sync DB to Zustand on login
  useEffect(() => {
    async function syncFromDb() {
      if (status === "authenticated" && !isInitialSyncDone.current) {
        const result = await getProgress();
        if (result.success && result.data) {
          const localState = useProgressStore.getState();
          let dbState = result.data as any;
          
          const migrationKey = 'migration_level_8_9_reset_v5';
          if (!window.localStorage.getItem(migrationKey)) {
             let migrated = false;
             if (dbState.lessonLevels) {
               Object.keys(dbState.lessonLevels).forEach(lessonId => {
                 if (dbState.lessonLevels[lessonId] > 7) {
                   dbState.lessonLevels[lessonId] = 7;
                   migrated = true;
                 }
                 if (dbState.lessonStars && dbState.lessonStars[lessonId]) {
                   dbState.lessonStars[lessonId][7] = 0;
                   dbState.lessonStars[lessonId][8] = 0;
                   migrated = true;
                 }
               });
             }
             if (dbState.lessonPartsCompleted) {
               Object.keys(dbState.lessonPartsCompleted).forEach(key => {
                 if (key.endsWith('_level-7') || key.endsWith('_level-8')) {
                   delete dbState.lessonPartsCompleted[key];
                   migrated = true;
                 }
               });
             }
             if (dbState.inProgressLessons) {
               Object.keys(dbState.inProgressLessons).forEach(key => {
                 if (key.includes('_7') || key.includes('_8')) {
                   delete dbState.inProgressLessons[key];
                   migrated = true;
                 }
               });
             }
             window.localStorage.setItem(migrationKey, 'true');
             if (migrated) {
                saveProgress(dbState);
             }
          }

          // Patch: Auto-validate missing parts for fully completed levels
          let partsFixMigrated = false;
          if (dbState.lessonLevels) {
            Object.keys(dbState.lessonLevels).forEach(lessonId => {
              const maxLevelCompleted = dbState.lessonLevels[lessonId];
              for (let level = 0; level < maxLevelCompleted; level++) {
                const partsKey = `${lessonId}_level-${level}`;
                
                if (!dbState.lessonPartsCompleted) {
                  dbState.lessonPartsCompleted = {};
                }
                
                const currentParts = dbState.lessonPartsCompleted[partsKey] || [];
                const neededParts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                let changed = false;
                
                for (const p of neededParts) {
                  if (!currentParts.includes(p)) {
                    currentParts.push(p);
                    changed = true;
                  }
                }
                
                if (changed) {
                  dbState.lessonPartsCompleted[partsKey] = currentParts;
                  partsFixMigrated = true;
                }
              }
            });
          }

          if (partsFixMigrated) {
            saveProgress(dbState);
          }
          
          // ── Migration: reconstitute fullLevelsCompleted ───────────────────
          // fullLevelsCompleted is not stored in the DB (always comes back as {}).
          // We rebuild it here from lessonLevels before overwriting the store,
          // otherwise this setState would wipe any locally-migrated value.
          // Rule: if lessonLevel[id] = N, levels 0..N-1 have been fully completed.
          if (dbState.lessonLevels) {
            const rebuiltFullLevels: Record<string, number[]> = { ...(dbState.fullLevelsCompleted || {}) };
            Object.entries(dbState.lessonLevels as Record<string, number>).forEach(([lessonId, level]) => {
              if (
                lessonId.startsWith('speak_') ||
                lessonId.startsWith('alphabet_') ||
                lessonId.startsWith('alpha-')
              ) return;
              const numLevel = Number(level);
              if (numLevel <= 0) return;
              const existing = rebuiltFullLevels[lessonId] || [];
              const levelsToAdd: number[] = [];
              for (let i = 0; i < numLevel; i++) {
                if (!existing.includes(i)) levelsToAdd.push(i);
              }
              if (levelsToAdd.length > 0) {
                rebuiltFullLevels[lessonId] = [...existing, ...levelsToAdd];
              }
            });
            dbState.fullLevelsCompleted = rebuiltFullLevels;
          }

          const userEmail = session?.user?.email || null;
          useProgressStore.setState({ ...dbState, lastMergedEmail: userEmail });
        }
        isInitialSyncDone.current = true;
      }
    }
    syncFromDb();
  }, [status]);

  // Sync Zustand to DB on changes
  useEffect(() => {
    if (status !== "authenticated" || !isInitialSyncDone.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const performSync = async () => {
      const state = useProgressStore.getState();
      
      const dataToSave = {
        lastConversionMonth: state.lastConversionMonth,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        completedLessons: state.completedLessons,
        unlockedLessons: state.unlockedLessons,
        lessonLevels: state.lessonLevels,
        lessonStars: state.lessonStars,
        speakCompletedLessons: state.speakCompletedLessons,
        speakLessonLevels: state.speakLessonLevels,
        speakLessonStars: state.speakLessonStars,
        seenAlphabets: state.seenAlphabets,
        conversationStars: state.conversationStars,
        completedConversations: state.completedConversations,
        hiddenInstructions: state.hiddenInstructions,
        reviewStats: state.reviewStats,
        dailyQuests: state.dailyQuests,
        questsDate: state.questsDate,
        completedToday: state.completedToday,
        inProgressLessons: state.inProgressLessons,
        lessonPartsCompleted: state.lessonPartsCompleted,
        fullLevelsCompleted: state.fullLevelsCompleted,
        unopenedGifts: state.unopenedGifts,
        nextModeUnit: state.nextModeUnit,
      };

      const timestamp = Date.now();
      const signature = generateNetworkSignature(dataToSave, timestamp);

      await saveProgress(dataToSave, timestamp, signature);
    };

    if (store.forceSyncTrigger !== lastForceSyncRef.current) {
      lastForceSyncRef.current = store.forceSyncTrigger;
      performSync();
      return;
    }

    timeoutRef.current = setTimeout(performSync, 2000); // Debounce time: 2 seconds

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    status,
    store.forceSyncTrigger,
    store.lastConversionMonth,
    store.currentStreak,
    store.completedLessons,
    store.unlockedLessons,
    store.lessonLevels,
    store.lessonStars,
    store.speakCompletedLessons,
    store.speakLessonLevels,
    store.speakLessonStars,
    store.seenAlphabets,
    store.completedConversations,
    store.reviewStats,
    store.dailyQuests,
    store.questsDate,
    store.completedToday,
    store.inProgressLessons,
    store.lessonPartsCompleted,
    store.fullLevelsCompleted,
    store.unopenedGifts,
    store.nextModeUnit
  ]);

  return null;
}
