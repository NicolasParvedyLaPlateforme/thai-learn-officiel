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
          const dbState = result.data as any;
          
          const isDbEmpty = dbState.xp === 0 && (!dbState.completedLessons || dbState.completedLessons.length === 0);
          const hasLocalProgress = localState.xp > 0 || localState.completedLessons.length > 0;
          const userEmail = session?.user?.email || null;

          if (isDbEmpty && hasLocalProgress) {
            console.log("Nouveau compte détecté : Conservation de la progression locale pour l'envoyer en base de données.");
            useProgressStore.getState().setLastMergedEmail(userEmail);
          } else if (hasLocalProgress && localState.lastMergedEmail !== userEmail) {
            console.log("Fusion des données locales (invité) avec le compte existant...");
            
            const mergedLessonLevels: Record<string, number> = { ...(dbState.lessonLevels || {}) };
            for (const key in localState.lessonLevels) {
              mergedLessonLevels[key] = Math.max(localState.lessonLevels[key] || 0, mergedLessonLevels[key] || 0);
            }

            const mergedLessonStars: Record<string, number[]> = { ...(dbState.lessonStars || {}) };
            for (const key in localState.lessonStars) {
              if (!mergedLessonStars[key]) mergedLessonStars[key] = [...localState.lessonStars[key]];
              else {
                mergedLessonStars[key] = mergedLessonStars[key].map((s, i) => Math.max(s || 0, localState.lessonStars[key][i] || 0));
              }
            }

            const mergedCompletedConversations: Record<string, number> = { ...(dbState.completedConversations || {}) };
            for (const key in localState.completedConversations) {
               mergedCompletedConversations[key] = Math.max(localState.completedConversations[key] || -1, mergedCompletedConversations[key] || -1);
            }

            const mergedConversationStars: Record<string, number[]> = { ...(dbState.conversationStars || {}) };
            for (const key in localState.conversationStars) {
               if (!mergedConversationStars[key]) mergedConversationStars[key] = [...localState.conversationStars[key]];
               else {
                 mergedConversationStars[key] = mergedConversationStars[key].map((s, i) => Math.max(s || 0, localState.conversationStars[key][i] || 0));
               }
            }

            const mergedState = {
              ...dbState,
              xp: (dbState.xp || 0) + (localState.xp || 0), // Addition seulement la première fois !
              goldCoins: (dbState.goldCoins || 0) + (localState.goldCoins || 0),
              currentStreak: Math.max(dbState.currentStreak || 0, localState.currentStreak || 0),
              longestStreak: Math.max(dbState.longestStreak || 0, localState.longestStreak || 0),
              lastConversionMonth: localState.lastConversionMonth || dbState.lastConversionMonth,
              lastActiveDate: localState.lastActiveDate || dbState.lastActiveDate,
              completedLessons: Array.from(new Set([...(dbState.completedLessons || []), ...(localState.completedLessons || [])])),
              unlockedLessons: Array.from(new Set([...(dbState.unlockedLessons || []), ...(localState.unlockedLessons || [])])),
              completedToday: Array.from(new Set([...(dbState.completedToday || []), ...(localState.completedToday || [])])),
              seenAlphabets: Array.from(new Set([...(dbState.seenAlphabets || []), ...(localState.seenAlphabets || [])])),
              lessonLevels: mergedLessonLevels,
              lessonStars: mergedLessonStars,
              completedConversations: mergedCompletedConversations,
              conversationStars: mergedConversationStars,
              dailyQuests: localState.dailyQuests || dbState.dailyQuests,
              questsDate: localState.questsDate || dbState.questsDate,
              reviewStats: { ...(dbState.reviewStats || {}), ...(localState.reviewStats || {}) },
              inProgressLessons: { ...(dbState.inProgressLessons || {}), ...(localState.inProgressLessons || {}) },
              lastMergedEmail: userEmail,
            };

            useProgressStore.setState(mergedState);
          } else if (hasLocalProgress && localState.lastMergedEmail === userEmail) {
            console.log("Mise à jour depuis la DB (pas de double addition de l'XP)...");
            
            // On ne fait PAS d'addition d'XP ici. On prend juste le max pour préserver le jeu hors-ligne après connexion
            const mergedLessonLevels: Record<string, number> = { ...(dbState.lessonLevels || {}) };
            for (const key in localState.lessonLevels) {
              mergedLessonLevels[key] = Math.max(localState.lessonLevels[key] || 0, mergedLessonLevels[key] || 0);
            }

            const mergedLessonStars: Record<string, number[]> = { ...(dbState.lessonStars || {}) };
            for (const key in localState.lessonStars) {
              if (!mergedLessonStars[key]) mergedLessonStars[key] = [...localState.lessonStars[key]];
              else {
                mergedLessonStars[key] = mergedLessonStars[key].map((s, i) => Math.max(s || 0, localState.lessonStars[key][i] || 0));
              }
            }

            const safeState = {
              ...dbState,
              xp: Math.max(dbState.xp || 0, localState.xp || 0), // MAX, pas d'addition
              goldCoins: Math.max(dbState.goldCoins || 0, localState.goldCoins || 0), // MAX
              currentStreak: Math.max(dbState.currentStreak || 0, localState.currentStreak || 0),
              longestStreak: Math.max(dbState.longestStreak || 0, localState.longestStreak || 0),
              lastConversionMonth: localState.lastConversionMonth || dbState.lastConversionMonth,
              lastActiveDate: localState.lastActiveDate || dbState.lastActiveDate,
              completedLessons: Array.from(new Set([...(dbState.completedLessons || []), ...(localState.completedLessons || [])])),
              unlockedLessons: Array.from(new Set([...(dbState.unlockedLessons || []), ...(localState.unlockedLessons || [])])),
              completedToday: Array.from(new Set([...(dbState.completedToday || []), ...(localState.completedToday || [])])),
              seenAlphabets: Array.from(new Set([...(dbState.seenAlphabets || []), ...(localState.seenAlphabets || [])])),
              lessonLevels: mergedLessonLevels,
              lessonStars: mergedLessonStars,
              completedConversations: { ...(dbState.completedConversations || {}), ...(localState.completedConversations || {}) },
              conversationStars: { ...(dbState.conversationStars || {}), ...(localState.conversationStars || {}) },
              dailyQuests: localState.dailyQuests || dbState.dailyQuests,
              questsDate: localState.questsDate || dbState.questsDate,
              reviewStats: { ...(dbState.reviewStats || {}), ...(localState.reviewStats || {}) },
              inProgressLessons: { ...(dbState.inProgressLessons || {}), ...(localState.inProgressLessons || {}) },
              lastMergedEmail: userEmail,
            };

            useProgressStore.setState(safeState);
          } else {
            useProgressStore.setState({ ...dbState, lastMergedEmail: userEmail });
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
