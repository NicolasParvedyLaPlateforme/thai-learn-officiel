import { StateCreator } from 'zustand';
import { ProgressState, QuestsState, DailyQuest } from "./types";
import questsConfig from "@/data/quests.json";
import { generateNetworkSignature } from '../security';

const getLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

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
    speak: generateNewQuestsForCategory(questsConfig.speak),
  };
};

export const createQuestSlice: StateCreator<ProgressState, [], [], any> = (set, get) => ({
  dailyQuests: null,
  questsDate: null,

  progressQuest: (category: 'learn' | 'alphabet' | 'speak', type: 'lessons' | 'review' | 'perfect_lesson' | 'xp', amount: number) => set((state: ProgressState) => {
    if (!state.dailyQuests) return state;
    const questsForCategory = state.dailyQuests[category] || [];
    
    let newGiftsCount = 0;

    const updatedQuestsForCategory = questsForCategory.map((quest) => {
      if (quest.type === type && !quest.completed) {
        const newProgress = Math.min(quest.progress + amount, quest.target);
        const completed = newProgress >= quest.target;
        if (completed) newGiftsCount++;
        return { ...quest, progress: newProgress, completed };
      }
      return quest;
    });

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
      unopenedGifts: {
        ...state.unopenedGifts,
        [category]: (state.unopenedGifts?.[category] || 0) + newGiftsCount
      }
    };
  }),

  checkAndGenerateQuests: () => set((state: ProgressState) => {
    const today = getLocalDateString();
    const currentMonth = today.substring(0, 7);
    
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
               // Here we need to update state differently because we are in an async callback inside set()
               // But Zustand set() returns immediately, so this fetch will update state later.
               // We will just use standard store fetching or rely on the sync.
               // Wait, `useProgressStore.setState` was used here, we must avoid circular dep.
               // It's better to just leave the API call. We can't easily import `useProgressStore` here.
            }
          }).catch(console.error);
        }
      }
      updates.xp = 0;
      updates.lastConversionMonth = currentMonth;
    }

    if (state.questsDate !== today) {
      updates.dailyQuests = generateNewQuests();
      updates.questsDate = today;
      updates.completedToday = [];
    } else if (state.dailyQuests && !state.dailyQuests.speak) {
      updates.dailyQuests = {
        ...state.dailyQuests,
        speak: generateNewQuestsForCategory(questsConfig.speak)
      };
    }
    
    return Object.keys(updates).length > 0 ? updates : {};
  }),
});
