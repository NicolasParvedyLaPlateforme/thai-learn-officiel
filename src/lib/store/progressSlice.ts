import { StateCreator } from 'zustand';
import { ProgressState } from "./types";
import { generateNetworkSignature } from '../security';

const getLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const createProgressSlice: StateCreator<ProgressState, [], [], any> = (set, get) => ({
  xp: 0,
  goldCoins: 0,
  lastConversionMonth: null,
  pendingGoldConversion: null,
  clearPendingGoldConversion: () => set({ pendingGoldConversion: null }),
  unopenedGifts: { learn: 0, alphabet: 0, speak: 0 },
  
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,

  claimGift: (category: 'learn' | 'alphabet' | 'speak') => {
    const state = get();
    const giftsAvailable = state.unopenedGifts?.[category] || 0;
    if (giftsAvailable <= 0) return null;

    const r1 = Math.random();
    const xpAmount = Math.floor(20 + Math.pow(r1, 2) * 280); 
    
    const r2 = Math.random();
    const getsCoins = r2 < 0.20;
    const coinsAmount = getsCoins ? Math.floor(Math.random() * 3) + 1 : 0;

    set((s: ProgressState) => ({
      unopenedGifts: {
        ...s.unopenedGifts,
        [category]: Math.max(0, (s.unopenedGifts?.[category] || 0) - 1)
      },
      xp: s.xp + xpAmount,
      goldCoins: s.goldCoins + coinsAmount
    }));
    
    get().triggerForceSync();

    return { xp: xpAmount, coins: coinsAmount };
  },

  recordActivity: () => set((state: ProgressState) => {
    const today = getLocalDateString();
    if (state.lastActiveDate === today) return {};
    
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

  addXp: (amount: number) => {
    set((state: ProgressState) => ({ xp: state.xp + amount }));
    get().recordActivity();
    get().progressQuest('learn', 'xp', amount);

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
          set({ xp: data.newXp });
        }
      }).catch(console.error);
    }
  },

});
