import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

import { ProgressState } from './store/types';
import { createProgressSlice } from './store/progressSlice';
import { createLessonSlice } from './store/lessonSlice';
import { createQuestSlice } from './store/questSlice';
import { createConfigSlice } from './store/configSlice';

export * from './store/types';

const getSecretKey = () => process.env.NEXT_PUBLIC_STORAGE_SECRET || 'default-secret-fallback-key-2026';

const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(name);
      if (!value) return null;

      if (value.startsWith('{')) {
        return value;
      }

      const bytes = CryptoJS.AES.decrypt(value, getSecretKey());
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        console.warn("Échec du déchiffrement du localStorage (donnée corrompue ou clé modifiée).");
        return null;
      }

      return decryptedString;
    } catch (e) {
      console.warn("localStorage not available or decryption error", e);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const encryptedValue = CryptoJS.AES.encrypt(value, getSecretKey()).toString();
      window.localStorage.setItem(name, encryptedValue);
    } catch (e) {
      console.warn("localStorage not available, unable to save state", e);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch (e) {
      console.warn("localStorage not available", e);
    }
  },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (...a) => ({
      ...createProgressSlice(...a),
      ...createLessonSlice(...a),
      ...createQuestSlice(...a),
      ...createConfigSlice(...a),
    }),
    {
      name: 'thai-learning-progress',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['_hasHydrated', 'isExerciseRunning', 'showCommunityModal', 'showLanguageModal', 'isMobileSidebarOpen', 'toneAnalyzerModalWord'].includes(key))
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && typeof window !== 'undefined') {
          const migrationKey = 'migration_level_8_9_reset_v5';
          if (!window.localStorage.getItem(migrationKey)) {
             let migrated = false;
             const newLessonLevels = { ...state.lessonLevels };
             const newLessonPartsCompleted = { ...state.lessonPartsCompleted };
             const newInProgress = { ...state.inProgressLessons };
             const newLessonStars = { ...state.lessonStars };
             
             Object.keys(newLessonLevels).forEach(lessonId => {
               if (newLessonLevels[lessonId] > 7) {
                 newLessonLevels[lessonId] = 7; 
                 migrated = true;
               }
               if (newLessonStars[lessonId]) {
                 newLessonStars[lessonId][7] = 0;
                 newLessonStars[lessonId][8] = 0;
                 migrated = true;
               }
             });

             Object.keys(newLessonPartsCompleted).forEach(key => {
               if (key.endsWith('_level-7') || key.endsWith('_level-8')) {
                 delete newLessonPartsCompleted[key];
                 migrated = true;
               }
             });

             Object.keys(newInProgress).forEach(key => {
               if (key.includes('_7') || key.includes('_8')) {
                 delete newInProgress[key];
                 migrated = true;
               }
             });

             if (migrated) {
               useProgressStore.setState({
                 lessonLevels: newLessonLevels,
                 lessonPartsCompleted: newLessonPartsCompleted,
                 inProgressLessons: newInProgress,
                 lessonStars: newLessonStars
               });
             }
             window.localStorage.setItem(migrationKey, 'true');
          }
        }
      }
    }
  )
);
