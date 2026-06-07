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
          const localState = useProgressStore.getState();
          // Si le compte en base de données est vide (nouveau compte)
          // mais qu'il y a une progression locale, on ne l'écrase PAS.
          // Le deuxième useEffect (sauvegarde) se chargera d'envoyer la progression locale vers la DB.
          const isDbEmpty = result.data.xp === 0 && (!result.data.completedLessons || result.data.completedLessons.length === 0);
          const hasLocalProgress = localState.xp > 0 || localState.completedLessons.length > 0;

          if (isDbEmpty && hasLocalProgress) {
            console.log("Nouveau compte détecté : Conservation de la progression locale pour l'envoyer en base de données.");
          } else {
            useProgressStore.setState(result.data);
          }
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
        questsDate: state.questsDate,
        completedToday: state.completedToday,
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
    store.reviewStats,
    store.dailyQuests,
    store.questsDate,
    store.completedToday
  ]);

  return null;
}
