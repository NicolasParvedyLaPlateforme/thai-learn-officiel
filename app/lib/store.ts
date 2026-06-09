import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { generateNetworkSignature } from './security';
import questsConfig from '../data/quests.json';
import { Exercise } from '../types';

export interface InProgressLessonState {
  exercises: Exercise[];
  currentIndex: number;
  mistakes: number;
  timeLeft: number | null;
  initialTime: number | null;
  lastUpdated: number;
}

export type AppLanguage = 'fr' | 'en' | 'de' | 'es' | 'it';

export interface WritingConfig {
  lessonId: string | 'all';
  selectedWordIds: string[] | null; // null means all words from the lesson/lessons
  hideThai: boolean;
  hideTranslation: boolean;
  disableDictionaryClick: boolean;
  hideCharacterHints: boolean;
}

export interface SpeakingConfig {
  lessonId: string | 'all';
  selectedWordIds: string[] | null;
  requiredAccuracy: number;
  strictMode?: boolean;
}

export interface ReviewConfig {
  showWordHints: boolean;
  showUsefulVocab: boolean;
  includeDistractors: boolean;
  limitDistractors: number;
}

export interface DailyQuest {
  id: string;
  type: 'lessons' | 'review' | 'perfect_lesson' | 'xp';
  target: number;
  progress: number;
  rewardXp: number;
  completed: boolean;
  titleEn: string;
  titleFr: string;
  titleDe?: string;
  titleEs?: string;
  titleIt?: string;
}

export interface QuestsState {
  learn: DailyQuest[];
  alphabet: DailyQuest[];
}

const generateNewQuestsForCategory = (categoryConfig: any[]): DailyQuest[] => {
  const shuffled = [...categoryConfig].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  return selected.map((q, index) => ({
    id: `q_${Date.now()}_${index}`,
    type: q.type as any,
    target: q.target,
    progress: 0,
    rewardXp: q.rewardXp,
    completed: false,
    titleEn: q.titleEn,
    titleFr: q.titleFr,
    titleDe: q.titleDe,
    titleEs: q.titleEs,
    titleIt: q.titleIt,
  }));
};

const generateNewQuests = (): QuestsState => {
  return {
    learn: generateNewQuestsForCategory(questsConfig.learn),
    alphabet: generateNewQuestsForCategory(questsConfig.alphabet),
  };
};

const getLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getSecretKey = () => process.env.NEXT_PUBLIC_STORAGE_SECRET || 'default-secret-fallback-key-2026';

const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(name);
      if (!value) return null;

      // Migration: si la donnée est déjà en clair (commence par '{'), on la retourne telle quelle.
      // Au prochain changement d'état, Zustand sauvegardera et chiffrera tout automatiquement.
      if (value.startsWith('{')) {
        return value;
      }

      // Tentative de déchiffrement
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

interface ProgressState {
  _hasHydrated: boolean;
  language: AppLanguage;
  languageSetByUser: boolean;
  completedLessons: string[];
  completedToday: string[];
  unlockedLessons: string[];
  lessonLevels: Record<string, number>;
  xp: number;
  goldCoins: number;
  lastConversionMonth: string | null;
  pendingGoldConversion: { oldXp: number, newCoins: number } | null;
  clearPendingGoldConversion: () => void;
  seenAlphabets: string[]; // Keep track of seen alphabet letters
  isExerciseRunning: boolean;
  setExerciseRunning: (state: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  autoDetectLanguage: () => void;
  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean) => { xp: number, isFirstTime: boolean, key: string };
  completeLesson: (lessonId: string, fallbackXp: number, playedLevel?: number, earnedStars?: number, isBilan?: boolean) => void;
  addXp: (amount: number) => void;
  unlockLessonManual: (lessonId: string) => void;
  resetProgress: () => void;
  resetLessonLevel: (lessonId: string) => void;
  markAlphabetSeen: (letter: string) => void;
  showRomanization: boolean;
  setShowRomanization: (show: boolean) => void;
  writingConfig: WritingConfig;
  setWritingConfig: (config: Partial<WritingConfig>) => void;
  speakingConfig: SpeakingConfig;
  setSpeakingConfig: (config: Partial<SpeakingConfig>) => void;
  reviewConfig: ReviewConfig;
  setReviewConfig: (config: Partial<ReviewConfig>) => void;
  lastActiveUnitIndex: number;
  setLastActiveUnitIndex: (index: number) => void;
  lastPlayedLessonId: string | null;
  lastPlayedLessonType: 'learn' | 'alphabet' | null;
  setLastPlayedLesson: (id: string, type: 'learn' | 'alphabet') => void;
  lessonStars: Record<string, number[]>; // Maps lessonId to array of stars for each level
  hiddenInstructions: string[];
  hideInstruction: (key: string) => void;
  unhideInstruction: (key: string) => void;
  hasSeenCommunityModal: boolean;
  setHasSeenCommunityModal: (seen: boolean) => void;
  showCommunityModal: boolean;
  setShowCommunityModal: (show: boolean) => void;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
  toneAnalyzerModalWord: string | null;
  setToneAnalyzerModalWord: (word: string | null) => void;
  conversationStars: Record<string, number[]>;
  completedConversations: Record<string, number>;
  completeConversation: (convId: string, level: number, stars?: number) => void;

  // Streaks & Quests
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dailyQuests: QuestsState | null;
  questsDate: string | null;
  recordActivity: () => void;
  progressQuest: (category: 'learn' | 'alphabet', type: 'lessons' | 'review' | 'perfect_lesson' | 'xp', amount: number) => void;
  checkAndGenerateQuests: () => void;
  
  reviewStats: Record<string, Record<number, { bestTime?: number, maxPercentage?: number }>>;
  saveReviewStat: (lessonId: string, level: number, stats: { bestTime?: number, maxPercentage?: number }) => void;
  
  inProgressLessons: Record<string, InProgressLessonState>;
  saveInProgressLesson: (key: string, state: InProgressLessonState | null) => void;

  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  lastMergedEmail: string | null;
  setLastMergedEmail: (email: string | null) => void;
  forceSyncTrigger: number;
  triggerForceSync: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      forceSyncTrigger: 0,
      triggerForceSync: () => set((state) => ({ forceSyncTrigger: state.forceSyncTrigger + 1 })),
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
      language: 'fr',
      languageSetByUser: false,
      completedLessons: [],
      completedToday: [],
      completedConversations: {},
      conversationStars: {},
      unlockedLessons: [],
      lessonLevels: {},
      lessonStars: {},
      xp: 0,
      goldCoins: 0,
      lastConversionMonth: null,
      pendingGoldConversion: null,
      clearPendingGoldConversion: () => set({ pendingGoldConversion: null }),
      hiddenInstructions: [],
      hasSeenCommunityModal: false,
      showCommunityModal: false,
      showLanguageModal: false,
      toneAnalyzerModalWord: null,
      setHasSeenCommunityModal: (seen) => set({ hasSeenCommunityModal: seen }),
      setShowCommunityModal: (show) => set({ showCommunityModal: show }),
      setShowLanguageModal: (show) => set({ showLanguageModal: show }),
      setToneAnalyzerModalWord: (word) => set({ toneAnalyzerModalWord: word }),
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyQuests: null,
      questsDate: null,
      reviewStats: {},
      inProgressLessons: {},
      lastMergedEmail: null,
      setLastMergedEmail: (email) => set({ lastMergedEmail: email }),
      saveInProgressLesson: (key, stateData) => set((state) => {
        const now = Date.now();
        const newInProgress = { ...state.inProgressLessons };
        
        // Nettoyage des vieilles leçons (> 48h)
        for (const k in newInProgress) {
          if (now - newInProgress[k].lastUpdated > 48 * 60 * 60 * 1000) {
            delete newInProgress[k];
          }
        }

        if (stateData === null) {
          delete newInProgress[key];
          return { inProgressLessons: newInProgress };
        }
        return {
          inProgressLessons: {
            ...newInProgress,
            [key]: { ...stateData, lastUpdated: now }
          }
        };
      }),
      
      saveReviewStat: (lessonId, level, stats) => set((state) => {
        const lessonStats = state.reviewStats[lessonId] || {};
        const currentLevelStats = lessonStats[level] || {};
        
        let newBestTime = currentLevelStats.bestTime;
        if (stats.bestTime !== undefined) {
          if (newBestTime === undefined || stats.bestTime < newBestTime) {
            newBestTime = stats.bestTime;
          }
        }
        
        let newMaxPercentage = currentLevelStats.maxPercentage;
        if (stats.maxPercentage !== undefined) {
          if (newMaxPercentage === undefined || stats.maxPercentage > newMaxPercentage) {
            newMaxPercentage = stats.maxPercentage;
          }
        }
        
        return {
          reviewStats: {
            ...state.reviewStats,
            [lessonId]: {
              ...lessonStats,
              [level]: {
                bestTime: newBestTime,
                maxPercentage: newMaxPercentage
              }
            }
          }
        };
      }),
      
      recordActivity: () => set((state) => {
        const today = getLocalDateString();
        if (state.lastActiveDate === today) return {}; // Already active today
        
        let newStreak = state.currentStreak;
        if (state.lastActiveDate) {
          const lastDate = new Date(state.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        return {
          lastActiveDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak)
        };
      }),

      progressQuest: (category, type, amount) => set((state) => {
        if (!state.dailyQuests) return state; // or handle initialization
        const questsForCategory = state.dailyQuests[category] || [];
        
        const updatedQuestsForCategory = questsForCategory.map((quest) => {
          if (quest.type === type && !quest.completed) {
            const newProgress = Math.min(quest.progress + amount, quest.target);
            const completed = newProgress >= quest.target;
            return { ...quest, progress: newProgress, completed };
          }
          return quest;
        });

        // Add reward XP for newly completed quests
        const newlyCompletedQuests = updatedQuestsForCategory.filter(
          (q, i) => q.completed && !questsForCategory[i].completed
        );
        const earnedXp = newlyCompletedQuests.reduce((acc, q) => acc + q.rewardXp, 0);

        return {
          dailyQuests: {
            ...state.dailyQuests,
            [category]: updatedQuestsForCategory,
          },
          xp: state.xp + earnedXp,
        };
      }),

      checkAndGenerateQuests: () => set((state) => {
        const today = getLocalDateString();
        const currentMonth = today.substring(0, 7); // YYYY-MM
        
        let updates: Partial<ProgressState> = {};
        
        // --- Monthly Gold Coin Conversion Logic ---
        if (state.lastConversionMonth !== currentMonth) {
          if (state.xp >= 100) {
            const newCoins = Math.floor(state.xp / 100);
            updates.goldCoins = (state.goldCoins || 0) + newCoins;
            updates.pendingGoldConversion = {
              oldXp: state.xp,
              newCoins: newCoins
            };
            
            // Sync avec l'API
            if (typeof window !== 'undefined' && newCoins > 0) {
              const payload = { goldAmount: newCoins };
              const timestamp = Date.now();
              const signature = generateNetworkSignature(payload, timestamp);
              
              fetch('/api/user/sync-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload, timestamp, signature })
              }).then(res => res.json()).then(data => {
                if (data.success && data.newGoldCoins !== undefined) {
                  useProgressStore.setState({ goldCoins: data.newGoldCoins });
                }
              }).catch(console.error);
            }
          }
          updates.xp = 0; // Reset XP at the end of the month
          updates.lastConversionMonth = currentMonth;
        }

        if (state.questsDate !== today) {
          updates.dailyQuests = generateNewQuests();
          updates.questsDate = today;
          updates.completedToday = []; // Reset completed today
        }
        
        return Object.keys(updates).length > 0 ? updates : {};
      }),

      seenAlphabets: [],
      isExerciseRunning: false,
      setExerciseRunning: (state) => set({ isExerciseRunning: state }),
      showRomanization: true,
      setShowRomanization: (show) => set({ showRomanization: show }),
      writingConfig: {
        lessonId: 'all',
        selectedWordIds: null,
        hideThai: false,
        hideTranslation: false,
        disableDictionaryClick: false,
        hideCharacterHints: false,
      },
      speakingConfig: {
        lessonId: 'all',
        selectedWordIds: null,
        requiredAccuracy: 50,
        strictMode: false,
      },
      reviewConfig: {
        showWordHints: true,
        showUsefulVocab: true,
        includeDistractors: true,
        limitDistractors: 2,
      },
      lastActiveUnitIndex: 0,
      setLastActiveUnitIndex: (index) => set({ lastActiveUnitIndex: index }),
      lastPlayedLessonId: null,
      lastPlayedLessonType: null,
      setLastPlayedLesson: (id, type) => set({ lastPlayedLessonId: id, lastPlayedLessonType: type }),
      hideInstruction: (key) => set((state) => ({ 
        hiddenInstructions: state.hiddenInstructions.includes(key) 
          ? state.hiddenInstructions 
          : [...state.hiddenInstructions, key] 
      })),
      unhideInstruction: (key) => set((state) => ({ 
        hiddenInstructions: state.hiddenInstructions.filter((k) => k !== key) 
      })),
      setWritingConfig: (config) => set((state) => ({ writingConfig: { ...state.writingConfig, ...config } })),
      setSpeakingConfig: (config) => set((state) => ({ speakingConfig: { ...state.speakingConfig, ...config } })),
      setReviewConfig: (config) => set((state) => ({ reviewConfig: { ...state.reviewConfig, ...config } })),

      completeConversation: (convId, level, stars = 3) => {
        set((state) => {
          const currentLevel = state.completedConversations[convId] ?? -1;
          const currentStars = state.conversationStars[convId] ? [...state.conversationStars[convId]] : [0, 0, 0, 0];
          
          if (level >= 0 && level <= 3) {
              currentStars[level] = Math.max(currentStars[level], stars);
          }

          if (level > currentLevel) {
            return {
              completedConversations: {
                ...state.completedConversations,
                [convId]: level
              },
              conversationStars: {
                ...state.conversationStars,
                [convId]: currentStars
              }
            };
          }
          return {
              conversationStars: {
                ...state.conversationStars,
                [convId]: currentStars
              }
          };
        });
        get().recordActivity();
        get().progressQuest('learn', 'lessons', 1);
        if (stars >= 3) {
          get().progressQuest('learn', 'perfect_lesson', 1);
        }
        
        // Ajouter l'XP !
        const { xp: expectedXp } = get().getExpectedXp(convId, level, false);
        if (expectedXp > 0) {
          get().addXp(expectedXp);
        }
        get().triggerForceSync();
      },

      setLanguage: (lang) => set({ language: lang, languageSetByUser: true, showLanguageModal: false }),
      autoDetectLanguage: () => {
        const state = get();
        if (!state.languageSetByUser && typeof window !== 'undefined' && window.navigator && window.navigator.language) {
          const browserLang = window.navigator.language.toLowerCase();
          if (browserLang.startsWith('en')) {
            set({ language: 'en' });
          } else if (browserLang.startsWith('de')) {
            set({ language: 'de' });
          } else if (browserLang.startsWith('es')) {
            set({ language: 'es' });
          } else if (browserLang.startsWith('it')) {
            set({ language: 'it' });
          } else if (browserLang.startsWith('fr')) {
            set({ language: 'fr' });
          }
        }
      },
      getExpectedXp: (lessonId, levelIndex, isBilan) => {
        const state = get();
        const completedToday = state.completedToday || [];
        let isFirstTime = false;
        let xp = 0;
        let key = '';

        if (lessonId.startsWith('detective_')) {
           key = lessonId;
           isFirstTime = !completedToday.includes(key);
           xp = isFirstTime ? 50 : 20;
        } else if (levelIndex === 10) {
           key = `learn_${lessonId}_level-10`;
           isFirstTime = !completedToday.includes(key);
           xp = isFirstTime ? 200 : 50;
        } else if (isBilan) {
           key = `learn_${lessonId}_level-${levelIndex}`;
           isFirstTime = !completedToday.includes(key);
           xp = isFirstTime ? 50 : 25;
        } else {
           const type = (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) ? 'alphabet' : 'learn';
           key = `${type}_${lessonId}_level-${levelIndex}`;
           isFirstTime = !completedToday.includes(key);
           xp = isFirstTime ? 20 : 5;
        }

        return { xp, isFirstTime, key };
      },
      completeLesson: (lessonId, fallbackXp, playedLevel, earnedStars = 3, isBilan = false) => {
        const state = get();
        const currentLevel = state.lessonLevels[lessonId] || 0;
        const actualPlayedLevel = playedLevel !== undefined ? playedLevel : currentLevel;
        
        const { xp: calculatedXp, isFirstTime, key } = state.getExpectedXp(lessonId, actualPlayedLevel, isBilan);
        const finalXp = lessonId.startsWith('detective_') ? calculatedXp : (calculatedXp || fallbackXp);

        set((state) => {
          let newLevel = currentLevel;
          if (playedLevel !== undefined) {
            if (playedLevel === currentLevel) {
               newLevel = Math.min(currentLevel + 1, 10);
            }
          } else {
             newLevel = Math.min(currentLevel + 1, 10);
          }
          
          const currentStars = state.lessonStars[lessonId] ? [...state.lessonStars[lessonId]] : Array(10).fill(0);
          if (playedLevel !== undefined && playedLevel >= 0 && playedLevel < 10) {
             currentStars[playedLevel] = Math.max(currentStars[playedLevel], earnedStars);
          }
          
          let type: 'learn' | 'alphabet' = 'learn';
          if (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) {
            type = 'alphabet';
          }

          const newCompletedToday = state.completedToday || [];
          const updatedCompletedToday = isFirstTime ? [...newCompletedToday, key] : newCompletedToday;

          return {
            completedLessons: state.completedLessons.includes(lessonId) 
              ? state.completedLessons 
              : [...state.completedLessons, lessonId],
            completedToday: updatedCompletedToday,
            lessonLevels: {
              ...state.lessonLevels,
              [lessonId]: newLevel
            },
            lessonStars: {
              ...state.lessonStars,
              [lessonId]: currentStars
            },
            xp: state.xp + finalXp,
            lastPlayedLessonId: lessonId,
            lastPlayedLessonType: type
          };
        });
        
        get().recordActivity();
        
        let type: 'learn' | 'alphabet' = 'learn';
        if (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) {
          type = 'alphabet';
        }

        get().progressQuest(type, 'lessons', 1);
        get().progressQuest(type, 'xp', finalXp);
        if (earnedStars >= 3) {
          get().progressQuest(type, 'perfect_lesson', 1);
        }
        get().triggerForceSync();
      },
      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        get().recordActivity();
        get().progressQuest('learn', 'xp', amount);

        // Sync avec l'API
        if (typeof window !== 'undefined' && amount > 0) {
          const payload = { xpAmount: amount };
          const timestamp = Date.now();
          const signature = generateNetworkSignature(payload, timestamp);
          
          fetch('/api/user/sync-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload, timestamp, signature })
          }).then(res => res.json()).then(data => {
            if (data.success && data.newXp !== undefined) {
              useProgressStore.setState({ xp: data.newXp });
            }
          }).catch(console.error);
        }
      },
      unlockLessonManual: (lessonId) => set((state) => ({
        unlockedLessons: state.unlockedLessons 
          ? (state.unlockedLessons.includes(lessonId) ? state.unlockedLessons : [...state.unlockedLessons, lessonId])
          : [lessonId]
      })),
      resetProgress: () => set({ 
        completedLessons: [], 
        completedToday: [],
        completedConversations: {},
        conversationStars: {},
        unlockedLessons: [], 
        lessonLevels: {}, 
        lessonStars: {}, 
        xp: 0, 
        goldCoins: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        reviewStats: {},
        dailyQuests: null,
        questsDate: null,
        seenAlphabets: [],
        lastMergedEmail: null,
        inProgressLessons: {}
      }),
      resetLessonLevel: (lessonId) => set((state) => ({
        lessonLevels: {
          ...state.lessonLevels,
          [lessonId]: 0
        },
        lessonStars: {
          ...state.lessonStars,
          [lessonId]: Array(10).fill(0)
        }
      })),
      markAlphabetSeen: (letter) => set((state) => ({
        seenAlphabets: state.seenAlphabets.includes(letter) 
          ? state.seenAlphabets 
          : [...state.seenAlphabets, letter]
      })),
    }),
    {
      name: 'thai-learning-progress',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['_hasHydrated', 'isExerciseRunning', 'showCommunityModal', 'showLanguageModal', 'isMobileSidebarOpen', 'toneAnalyzerModalWord'].includes(key))
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
