import { Exercise } from '../../types';

export interface InProgressLessonState {
  exercises: Exercise[];
  currentIndex: number;
  mistakes: number;
  timeLeft: number | null;
  initialTime: number | null;
  completedPhraseIds?: string[];
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
  speak: DailyQuest[];
}

export interface ProgressState {
  _hasHydrated: boolean;
  language: AppLanguage;
  languageSetByUser: boolean;
  completedLessons: string[];
  completedToday: string[];
  unlockedLessons: string[];
  lessonLevels: Record<string, number>;
  lessonPartsCompleted: Record<string, number[]>;
  xp: number;
  goldCoins: number;
  lastConversionMonth: string | null;
  pendingGoldConversion: { oldXp: number, newCoins: number } | null;
  clearPendingGoldConversion: () => void;
  unopenedGifts: { learn: number, alphabet: number, speak: number };
  claimGift: (category: 'learn' | 'alphabet' | 'speak') => { xp: number, coins: number } | null;
  seenAlphabets: string[]; // Keep track of seen alphabet letters
  isExerciseRunning: boolean;
  setExerciseRunning: (state: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  autoDetectLanguage: () => void;
  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean, isPart?: boolean, isFullLongLevel?: boolean, partIndex?: number | null) => { xp: number, maxXp: number, isFirstTime: boolean, key: string };
  completeLesson: (lessonId: string, fallbackXp: number, playedLevel?: number, earnedStars?: number, isBilan?: boolean, isFromParts?: boolean) => void;
  completeLessonPart: (lessonId: string, fallbackXp: number, playedLevel: number, partIndex: number, totalParts: number, earnedStars?: number, isBilan?: boolean) => void;
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
  lastPlayedLessonType: 'learn' | 'alphabet' | 'speak' | null;
  setLastPlayedLesson: (id: string, type: 'learn' | 'alphabet' | 'speak') => void;
  lessonStars: Record<string, number[]>; // Maps lessonId to array of stars for each level
  speakCompletedLessons: string[];
  speakLessonLevels: Record<string, number>;
  speakLessonStars: Record<string, number[]>;
  completeSpeakLesson: (lessonId: string, fallbackXp: number, playedLevel?: number, earnedStars?: number) => void;
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
  progressQuest: (category: 'learn' | 'alphabet' | 'speak', type: 'lessons' | 'review' | 'perfect_lesson' | 'xp', amount: number) => void;
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
