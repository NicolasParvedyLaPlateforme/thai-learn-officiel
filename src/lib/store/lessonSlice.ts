import { StateCreator } from 'zustand';
import { ProgressState } from "./types";
import { calculateExpectedXp } from '../xp-utils';
import { calculateLessonLevelAndStars } from '../lesson-utils';
import { completeLessonAction, syncXpAction } from '@/actions/secureProgress';

const getLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const createLessonSlice: StateCreator<ProgressState, [], [], any> = (set, get) => ({
  isExerciseRunning: false,
  setExerciseRunning: (state: boolean) => set({ isExerciseRunning: state }),
  completedLessons: [],
  completedToday: [],
  completedConversations: {},
  conversationStars: {},
  unlockedLessons: [],
  lessonLevels: {},
  lessonPartsCompleted: {},
  lessonStars: {},
  fullLevelsCompleted: {},
  speakCompletedLessons: [],
  speakLessonLevels: {},
  speakLessonStars: {},
  seenAlphabets: [],
  reviewStats: {},
  inProgressLessons: {},
  lastActiveUnitIndex: 0,
  setLastActiveUnitIndex: (index: number) => set({ lastActiveUnitIndex: index }),
  lastPlayedLessonId: null,
  lastPlayedLessonType: null,
  setLastPlayedLesson: (id: string, type: 'learn' | 'alphabet' | 'speak') => set({ lastPlayedLessonId: id, lastPlayedLessonType: type }),

  nextModeUnit: null,
  setNextModeUnit: (data: { unitIndex: number; date: string } | null) => set({ nextModeUnit: data }),

  saveInProgressLesson: (key: string, stateData: any) => set((state: ProgressState) => {
    const now = Date.now();
    if (stateData === null) {
      const newInProgress = { ...state.inProgressLessons };
      delete newInProgress[key];
      return { inProgressLessons: newInProgress };
    }
    return {
      inProgressLessons: {
        [key]: { ...stateData, lastUpdated: now }
      }
    };
  }),
  
  saveReviewStat: (lessonId: string, level: number, stats: { bestTime?: number, maxPercentage?: number }) => set((state: ProgressState) => {
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

  completeConversation: (convId: string, level: number, stars: number = 3) => {
    set((state: ProgressState) => {
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
    
    const { xp: expectedXp } = get().getExpectedXp(convId, level, false);
    if (expectedXp > 0) {
      get().addXp(expectedXp);
    }
    get().triggerForceSync();
  },

  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean, isPart = false, isFullLongLevel = false, partIndex: number | null = null) => {
    const state = get();
    const today = getLocalDateString();
    const completedToday = state.questsDate === today ? (state.completedToday || []) : [];
    return calculateExpectedXp(lessonId, levelIndex, isBilan, isPart, isFullLongLevel, partIndex, completedToday);
  },

  completeLesson: (lessonId: string, fallbackXp: number, playedLevel?: number, earnedStars: number = 3, isBilan: boolean = false, isFromParts: boolean = false) => {
    const state = get();
    const currentLevel = state.lessonLevels[lessonId] || 0;
    const actualPlayedLevel = playedLevel !== undefined ? playedLevel : currentLevel;
    
    let isFullLongLevel = false;
    if (typeof window !== 'undefined') {
      if (actualPlayedLevel === 7 || actualPlayedLevel === 8) isFullLongLevel = true;
    }

    const { xp: calculatedXp, isFirstTime, key } = state.getExpectedXp(lessonId, actualPlayedLevel, isBilan, false, isFullLongLevel);
    
    let bonusXp = 0;
    if (!isFromParts && typeof window !== 'undefined') {
       const reminderLevelStr = localStorage.getItem('recommendedReminderLevel');
       if (reminderLevelStr && parseInt(reminderLevelStr) === actualPlayedLevel) {
           bonusXp = 50;
           // Generate a new random reminder level between 0 and 9
           localStorage.setItem('recommendedReminderLevel', Math.floor(Math.random() * 10).toString());
       }
    }
    
    const finalXp = (isFromParts ? 0 : (lessonId.startsWith('detective_') ? calculatedXp : (calculatedXp || fallbackXp))) + bonusXp;

    const { newLevel, newStars } = calculateLessonLevelAndStars(currentLevel, playedLevel, earnedStars, state.lessonStars[lessonId]);

    set((state: ProgressState) => {
      
      let type: 'learn' | 'alphabet' = 'learn';
      if (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) {
        type = 'alphabet';
      }

      const newCompletedToday = state.completedToday || [];
      const updatedCompletedToday = (isFirstTime && !isFromParts) ? [...newCompletedToday, key] : newCompletedToday;

      const partsKey = `${lessonId}_level-${actualPlayedLevel}`;
      // Quand appelé via isFromParts (chaîne completeLessonPart → completeLesson),
      // les données de parts sont déjà correctes dans le store → on les préserve.
      // Quand appelé directement (jeu en mode niveau entier ou bilan),
      // on marque simplement 1 part complétée [0] pour cohérence avec totalParts = 1.
      const newPartsForKey = isFromParts
        ? (state.lessonPartsCompleted[partsKey] || [0])
        : [0];
        
      const newFullLevelsCompleted = { ...state.fullLevelsCompleted };
      if (!isFromParts) {
        const currentFullLevels = newFullLevelsCompleted[lessonId] || [];
        if (!currentFullLevels.includes(actualPlayedLevel)) {
           newFullLevelsCompleted[lessonId] = [...currentFullLevels, actualPlayedLevel];
        }
      }
      
      return {
        completedLessons: state.completedLessons.includes(lessonId) 
          ? state.completedLessons 
          : [...state.completedLessons, lessonId],
        completedToday: updatedCompletedToday,
        lessonLevels: {
          ...state.lessonLevels,
          [lessonId]: newLevel
        },
        lessonPartsCompleted: {
          ...state.lessonPartsCompleted,
          [partsKey]: newPartsForKey
        },
        lessonStars: {
          ...state.lessonStars,
          [lessonId]: newStars
        },
        fullLevelsCompleted: newFullLevelsCompleted,
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

    if (!isFromParts) {
      get().progressQuest(type, 'lessons', 1);
      if (earnedStars >= 3) {
        get().progressQuest(type, 'perfect_lesson', 1);
      }
    }
    get().progressQuest(type, 'xp', finalXp);
    get().triggerForceSync();

    if (typeof window !== 'undefined' && !isFromParts) {
      completeLessonAction(lessonId, actualPlayedLevel, isBilan, false, isFullLongLevel, null, earnedStars)
        .then(res => {
          if (res.success && res.data) {
            set({ xp: res.data.totalXp });
          }
        }).catch(console.error);
    }
  },

  completeLessonPart: (lessonId: string, fallbackXp: number, playedLevel: number, partIndex: number, totalParts: number, earnedStars: number = 3, isBilan: boolean = false) => {
    const state = get();
    const partsKey = `${lessonId}_level-${playedLevel}`;
    const currentCompletedParts = state.lessonPartsCompleted[partsKey] || [];
    
    const { xp: calculatedXp, isFirstTime, key } = state.getExpectedXp(lessonId, playedLevel, isBilan, true, false, partIndex);
    const finalXp = calculatedXp || fallbackXp;

    set((state: ProgressState) => {
      let type: 'learn' | 'alphabet' = 'learn';
      if (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) {
        type = 'alphabet';
      }

      const newCompletedToday = state.completedToday || [];
      const partTodayKey = key;
      const isPartFirstTimeToday = !newCompletedToday.includes(partTodayKey);
      const updatedCompletedToday = isPartFirstTimeToday ? [...newCompletedToday, partTodayKey] : newCompletedToday;

      const newCompletedParts = [...currentCompletedParts];
      if (!newCompletedParts.includes(partIndex)) {
         newCompletedParts.push(partIndex);
      }

      return {
        completedToday: updatedCompletedToday,
        lessonPartsCompleted: {
          ...state.lessonPartsCompleted,
          [partsKey]: newCompletedParts
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

    if (typeof window !== 'undefined') {
      completeLessonAction(lessonId, playedLevel, isBilan, true, false, partIndex, earnedStars)
        .then(res => {
          if (res.success && res.data) {
            set({ xp: res.data.totalXp });
          }
        }).catch(console.error);
    }

    const updatedState = get();
    const updatedCompletedParts = updatedState.lessonPartsCompleted[partsKey] || [];
    if (updatedCompletedParts.length >= totalParts) {
       updatedState.completeLesson(lessonId, 0, playedLevel, earnedStars, isBilan, true);
    }
  },

  completeSpeakLesson: (lessonId: string, fallbackXp: number, playedLevel?: number, earnedStars: number = 3) => {
    const state = get();
    const currentLevel = state.speakLessonLevels[lessonId] || 0;
    const actualPlayedLevel = playedLevel !== undefined ? playedLevel : currentLevel;
    
    const { xp: calculatedXp, isFirstTime, key } = state.getExpectedXp(`speak_${lessonId}`, actualPlayedLevel, false);
    let finalXp = calculatedXp || fallbackXp;
    if (actualPlayedLevel === 1 && fallbackXp !== undefined) {
       finalXp = fallbackXp;
    }

    const { newLevel, newStars } = calculateLessonLevelAndStars(currentLevel, playedLevel, earnedStars, state.speakLessonStars[lessonId]);

    set((state: ProgressState) => {

      const newCompletedToday = state.completedToday || [];
      const updatedCompletedToday = isFirstTime ? [...newCompletedToday, key] : newCompletedToday;

      return {
        speakCompletedLessons: state.speakCompletedLessons.includes(lessonId) 
          ? state.speakCompletedLessons 
          : [...state.speakCompletedLessons, lessonId],
        completedToday: updatedCompletedToday,
        speakLessonLevels: {
          ...state.speakLessonLevels,
          [lessonId]: newLevel
        },
        speakLessonStars: {
          ...state.speakLessonStars,
          [lessonId]: newStars
        },
        xp: state.xp + finalXp,
        lastPlayedLessonId: lessonId,
        lastPlayedLessonType: 'speak'
      };
    });
    
    get().recordActivity();
    get().progressQuest('speak', 'lessons', 1);
    get().progressQuest('speak', 'xp', finalXp);
    if (earnedStars >= 3) {
      get().progressQuest('speak', 'perfect_lesson', 1);
    }
    get().triggerForceSync();

    if (typeof window !== 'undefined') {
      completeLessonAction(`speak_${lessonId}`, actualPlayedLevel, false, false, false, null, earnedStars)
        .then(res => {
          if (res.success && res.data) {
            set({ xp: res.data.totalXp });
          }
        }).catch(console.error);
    }
  },

  unlockLessonManual: (lessonId: string) => set((state: ProgressState) => ({
    unlockedLessons: state.unlockedLessons 
      ? (state.unlockedLessons.includes(lessonId) ? state.unlockedLessons : [...state.unlockedLessons, lessonId])
      : [lessonId]
  })),

  markAlphabetSeen: (letter: string) => set((state: ProgressState) => ({
    seenAlphabets: state.seenAlphabets.includes(letter) 
      ? state.seenAlphabets 
      : [...state.seenAlphabets, letter]
  })),

  resetLessonLevel: (lessonId: string) => set((state: ProgressState) => {
    const newLessonPartsCompleted = { ...state.lessonPartsCompleted };
    Object.keys(newLessonPartsCompleted).forEach(key => {
      if (key.startsWith(`${lessonId}_level-`)) {
        delete newLessonPartsCompleted[key];
      }
    });
    
    const newCompletedToday = (state.completedToday || []).filter(key => {
       return !key.includes(`${lessonId}_level-`);
    });

    return {
      lessonLevels: {
        ...state.lessonLevels,
        [lessonId]: 0
      },
      lessonStars: {
        ...state.lessonStars,
        [lessonId]: Array(10).fill(0)
      },
      lessonPartsCompleted: newLessonPartsCompleted,
      completedToday: newCompletedToday
    };
  }),

  resetProgress: () => set({ 
    completedLessons: [], 
    completedToday: [],
    completedConversations: {},
    conversationStars: {},
    unlockedLessons: [], 
    lessonLevels: {}, 
    lessonPartsCompleted: {},
    lessonStars: {}, 
    fullLevelsCompleted: {},
    speakCompletedLessons: [], 
    speakLessonLevels: {}, 
    speakLessonStars: {}, 
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

});
