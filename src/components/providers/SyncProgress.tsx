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
        unopenedGifts: state.unopenedGifts,
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
    store.unopenedGifts
  ]);

  return null;
}
