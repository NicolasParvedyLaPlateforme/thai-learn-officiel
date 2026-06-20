import { StateCreator } from 'zustand';
import { ProgressState, AppLanguage, WritingConfig, SpeakingConfig, ReviewConfig } from "./types";

export const createConfigSlice: StateCreator<ProgressState, [], [], any> = (set, get) => ({
  _hasHydrated: false,
  setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
  language: 'fr',
  languageSetByUser: false,
  setLanguage: (lang: AppLanguage) => set({ language: lang, languageSetByUser: true, showLanguageModal: false }),
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

  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open: boolean) => set({ isMobileSidebarOpen: open }),
  
  showCommunityModal: false,
  setShowCommunityModal: (show: boolean) => set({ showCommunityModal: show }),
  hasSeenCommunityModal: false,
  setHasSeenCommunityModal: (seen: boolean) => set({ hasSeenCommunityModal: seen }),
  
  showLanguageModal: false,
  setShowLanguageModal: (show: boolean) => set({ showLanguageModal: show }),
  
  toneAnalyzerModalWord: null,
  setToneAnalyzerModalWord: (word: string | null) => set({ toneAnalyzerModalWord: word }),

  hiddenInstructions: [],
  hideInstruction: (key: string) => set((state: ProgressState) => ({ 
    hiddenInstructions: state.hiddenInstructions.includes(key) 
      ? state.hiddenInstructions 
      : [...state.hiddenInstructions, key] 
  })),
  unhideInstruction: (key: string) => set((state: ProgressState) => ({ 
    hiddenInstructions: state.hiddenInstructions.filter((k) => k !== key) 
  })),

  showRomanization: true,
  setShowRomanization: (show: boolean) => set({ showRomanization: show }),

  writingConfig: {
    lessonId: 'all',
    selectedWordIds: null,
    hideThai: false,
    hideTranslation: false,
    disableDictionaryClick: false,
    hideCharacterHints: false,
  },
  setWritingConfig: (config: Partial<WritingConfig>) => set((state: ProgressState) => ({ writingConfig: { ...state.writingConfig, ...config } })),

  speakingConfig: {
    lessonId: 'all',
    selectedWordIds: null,
    requiredAccuracy: 50,
    strictMode: false,
  },
  setSpeakingConfig: (config: Partial<SpeakingConfig>) => set((state: ProgressState) => ({ speakingConfig: { ...state.speakingConfig, ...config } })),

  reviewConfig: {
    showWordHints: true,
    showUsefulVocab: true,
    includeDistractors: true,
    limitDistractors: 2,
  },
  setReviewConfig: (config: Partial<ReviewConfig>) => set((state: ProgressState) => ({ reviewConfig: { ...state.reviewConfig, ...config } })),

  lastMergedEmail: null,
  setLastMergedEmail: (email: string | null) => set({ lastMergedEmail: email }),

  forceSyncTrigger: 0,
  triggerForceSync: () => set((state: ProgressState) => ({ forceSyncTrigger: state.forceSyncTrigger + 1 })),
});
