import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppLanguage = 'fr' | 'en';

export interface WritingConfig {
  lessonId: string | 'all';
  selectedWordIds: string[] | null; // null means all words from the lesson/lessons
  hideThai: boolean;
  hideTranslation: boolean;
  disableDictionaryClick: boolean;
  hideCharacterHints: boolean;
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
}

const ALL_QUESTS = [
  { id: 'q_lesson_1', type: 'lessons', target: 1, rewardXp: 20, titleEn: 'Complete 1 Lesson', titleFr: 'Terminer 1 leçon' },
  { id: 'q_lesson_3', type: 'lessons', target: 3, rewardXp: 50, titleEn: 'Complete 3 Lessons', titleFr: 'Terminer 3 leçons' },
  { id: 'q_xp_50', type: 'xp', target: 50, rewardXp: 15, titleEn: 'Earn 50 XP', titleFr: 'Gagner 50 XP' },
  { id: 'q_xp_100', type: 'xp', target: 100, rewardXp: 30, titleEn: 'Earn 100 XP', titleFr: 'Gagner 100 XP' },
  { id: 'q_xp_200', type: 'xp', target: 200, rewardXp: 60, titleEn: 'Earn 200 XP', titleFr: 'Gagner 200 XP' },
  { id: 'q_perfect_1', type: 'perfect_lesson', target: 1, rewardXp: 25, titleEn: 'Get 3 stars on a level', titleFr: 'Obtenir 3 étoiles à un niveau' },
  { id: 'q_perfect_2', type: 'perfect_lesson', target: 2, rewardXp: 55, titleEn: 'Get 3 stars on 2 levels', titleFr: 'Obtenir 3 étoiles sur 2 niveaux' }
];

const generateNewQuests = (): DailyQuest[] => {
  // Shuffle and pick 3 different quests
  const shuffled = [...ALL_QUESTS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  return selected.map((q, index) => ({
    id: `q_${Date.now()}_${index}`, // Unique runtime ID for react rendering tracking
    type: q.type as any,
    target: q.target,
    progress: 0,
    rewardXp: q.rewardXp,
    completed: false,
    titleEn: q.titleEn,
    titleFr: q.titleFr,
  }));
};

const getLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch (e) {
      console.warn("localStorage not available, defaulting to empty", e);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
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
  unlockedLessons: string[];
  lessonLevels: Record<string, number>;
  xp: number;
  seenAlphabets: string[]; // Keep track of seen alphabet letters
  isExerciseRunning: boolean;
  setExerciseRunning: (state: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  autoDetectLanguage: () => void;
  completeLesson: (lessonId: string, earnedXp: number, playedLevel?: number, earnedStars?: number) => void;
  addXp: (amount: number) => void;
  unlockLessonManual: (lessonId: string) => void;
  resetProgress: () => void;
  resetLessonLevel: (lessonId: string) => void;
  markAlphabetSeen: (letter: string) => void;
  showRomanization: boolean;
  setShowRomanization: (show: boolean) => void;
  writingConfig: WritingConfig;
  setWritingConfig: (config: Partial<WritingConfig>) => void;
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
  conversationStars: Record<string, number[]>;
  completedConversations: Record<string, number>;
  completeConversation: (convId: string, level: number, stars?: number) => void;

  // Streaks & Quests
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dailyQuests: DailyQuest[];
  questsDate: string | null;
  recordActivity: () => void;
  progressQuest: (type: 'lessons' | 'review' | 'perfect_lesson' | 'xp', amount: number) => void;
  checkAndGenerateQuests: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      language: 'fr',
      languageSetByUser: false,
      completedLessons: [],
      completedConversations: {},
      conversationStars: {},
      unlockedLessons: [],
      lessonLevels: {},
      lessonStars: {},
      hiddenInstructions: [],
      hasSeenCommunityModal: false,
      showCommunityModal: false,
      setHasSeenCommunityModal: (seen) => set({ hasSeenCommunityModal: seen }),
      setShowCommunityModal: (show) => set({ showCommunityModal: show }),
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyQuests: [],
      questsDate: null,
      
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

      progressQuest: (type, amount) => set((state) => {
        const updatedQuests = state.dailyQuests.map((quest) => {
          if (quest.type === type && !quest.completed) {
            const newProgress = Math.min(quest.progress + amount, quest.target);
            const completed = newProgress >= quest.target;
            return { ...quest, progress: newProgress, completed };
          }
          return quest;
        });

        // Add reward XP for newly completed quests
        const newlyCompletedQuests = updatedQuests.filter(
          (q, i) => q.completed && !state.dailyQuests[i].completed
        );
        const earnedXp = newlyCompletedQuests.reduce((acc, q) => acc + q.rewardXp, 0);

        return {
          dailyQuests: updatedQuests,
          xp: state.xp + earnedXp,
        };
      }),

      checkAndGenerateQuests: () => set((state) => {
        const today = getLocalDateString();
        if (state.questsDate !== today) {
          return {
            questsDate: today,
            dailyQuests: generateNewQuests()
          };
        }
        return {};
      }),

      xp: 0,
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
        get().progressQuest('lessons', 1);
        if (stars >= 3) {
          get().progressQuest('perfect_lesson', 1);
        }
      },

      setLanguage: (lang) => set({ language: lang, languageSetByUser: true }),
      autoDetectLanguage: () => {
        const state = get();
        if (!state.languageSetByUser && typeof window !== 'undefined' && window.navigator && window.navigator.language) {
          const browserLang = window.navigator.language.toLowerCase();
          if (browserLang.startsWith('en')) {
            set({ language: 'en' });
          } else if (browserLang.startsWith('fr')) {
            set({ language: 'fr' });
          }
        }
      },
      completeLesson: (lessonId, earnedXp, playedLevel, earnedStars = 3) => {
        set((state) => {
          const currentLevel = state.lessonLevels[lessonId] || 0;
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
          if (lessonId.startsWith('alphabet_')) {
            type = 'alphabet';
          }

          return {
            completedLessons: state.completedLessons.includes(lessonId) 
              ? state.completedLessons 
              : [...state.completedLessons, lessonId],
            lessonLevels: {
              ...state.lessonLevels,
              [lessonId]: newLevel
            },
            lessonStars: {
              ...state.lessonStars,
              [lessonId]: currentStars
            },
            xp: state.xp + earnedXp,
            lastPlayedLessonId: lessonId,
            lastPlayedLessonType: type
          };
        });
        
        get().recordActivity();
        get().progressQuest('lessons', 1);
        get().progressQuest('xp', earnedXp);
        if (earnedStars >= 3) {
          get().progressQuest('perfect_lesson', 1);
        }
      },
      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        get().recordActivity();
        get().progressQuest('xp', amount);
      },
      unlockLessonManual: (lessonId) => set((state) => ({
        unlockedLessons: state.unlockedLessons 
          ? (state.unlockedLessons.includes(lessonId) ? state.unlockedLessons : [...state.unlockedLessons, lessonId])
          : [lessonId]
      })),
      resetProgress: () => set({ completedLessons: [], unlockedLessons: [], lessonLevels: {}, lessonStars: {}, xp: 0 }),
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
        Object.entries(state).filter(([key]) => !['_hasHydrated', 'isExerciseRunning', 'showCommunityModal'].includes(key))
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
