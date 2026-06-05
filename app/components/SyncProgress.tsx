"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useProgressStore } from "../lib/store";
import { getProgress, saveProgress } from "../actions/syncProgress";

export default function SyncProgress() {
  const { data: session, status } = useSession();
  const store = useProgressStore();
  const isInitialSyncDone = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync DB to Zustand on login
  useEffect(() => {
    async function syncFromDb() {
      if (status === "authenticated" && !isInitialSyncDone.current) {
        const result = await getProgress();
        if (result.success && result.data) {
          useProgressStore.setState(result.data);
        }
        isInitialSyncDone.current = true;
      }
    }
    syncFromDb();
  }, [status]);

  // Sync Zustand to DB on changes
  useEffect(() => {
    if (status !== "authenticated" || !isInitialSyncDone.current) return;

    // Use a small debounce to avoid spamming the database
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const state = useProgressStore.getState();
      
      const dataToSave = {
        xp: state.xp,
        goldCoins: state.goldCoins,
        lastConversionMonth: state.lastConversionMonth,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        completedLessons: state.completedLessons,
        unlockedLessons: state.unlockedLessons,
        lessonLevels: state.lessonLevels,
        lessonStars: state.lessonStars,
        seenAlphabets: state.seenAlphabets,
        conversationStars: state.conversationStars,
        completedConversations: state.completedConversations,
        hiddenInstructions: state.hiddenInstructions,
        reviewStats: state.reviewStats,
        dailyQuests: state.dailyQuests,
      };

      await saveProgress(dataToSave);
    }, 2000); // Debounce time: 2 seconds

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    status,
    store.xp,
    store.goldCoins,
    store.lastConversionMonth,
    store.currentStreak,
    store.completedLessons,
    store.unlockedLessons,
    store.lessonLevels,
    store.lessonStars,
    store.seenAlphabets,
    store.completedConversations,
    store.reviewStats
  ]);

  return null;
}
