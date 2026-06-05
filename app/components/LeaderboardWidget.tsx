'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Trophy, Medal } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import { getTranslation } from '../hooks/useTranslation';

interface LeaderboardUser {
  id: string;
  pseudo: string;
  xp: number;
  rank: number;
}

export function LeaderboardWidget() {
  const { language } = useProgressStore();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?limit=3')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex flex-col gap-3">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
            <Trophy size={18} />
          </div>
          <h2 className="font-extrabold text-slate-800 text-sm">
            {getTranslation('leaderboard.title', language)}
          </h2>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-2">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                ${index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' : ''}
                ${index === 1 ? 'bg-slate-100 text-slate-500 border border-slate-200' : ''}
                ${index === 2 ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''}
              `}>
                {index === 0 ? <Crown size={12} className="stroke-[3]" /> : index + 1}
              </div>
              <span className="font-bold text-sm text-slate-700 truncate max-w-[120px]">
                {user.pseudo}
              </span>
            </div>
            <span className="font-bold text-sm text-amber-500">
              {user.xp} XP
            </span>
          </div>
        ))}
      </div>

      <Link 
        href="/leaderboard"
        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
      >
        {getTranslation('leaderboard.view_all', language)}
      </Link>
    </div>
  );
}
