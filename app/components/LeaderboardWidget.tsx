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
      <div className="w-full bg-white rounded-2xl border border-slate-100 md:border-2 p-4 shadow-sm flex flex-col gap-3">
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
    <div className="w-full bg-white rounded-2xl md:rounded-[24px] border border-slate-100 md:border-2 p-4 md:p-5 shadow-sm flex flex-col gap-3 md:gap-4 relative group">
      {/* Fond décoratif très subtil */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-50 rounded-full opacity-60 pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100/50 text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
            <Trophy size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] tracking-tight">
            {getTranslation('leaderboard.title', language)}
          </h2>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-1 relative z-10">
        {users.map((user, index) => {
          let medalStyles = "";
          let icon = null;

          if (index === 0) {
            medalStyles = "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-[0_2px_8px_rgba(234,179,8,0.4)] border border-yellow-200/50";
            icon = <Crown size={14} className="stroke-[3]" />;
          } else if (index === 1) {
            medalStyles = "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_2px_8px_rgba(148,163,184,0.4)] border border-slate-200/50";
            icon = <span className="font-black text-[13px]">2</span>;
          } else if (index === 2) {
            medalStyles = "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-[0_2px_8px_rgba(217,119,6,0.4)] border border-amber-600/50";
            icon = <span className="font-black text-[13px]">3</span>;
          } else {
            medalStyles = "bg-slate-100 text-slate-500 font-bold text-[13px]";
            icon = index + 1;
          }

          return (
            <div key={user.id} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group/item">
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${medalStyles}`}>
                  {icon}
                </div>
                <span className="font-bold text-[15px] text-slate-700 truncate max-w-[120px] group-hover/item:text-indigo-600 transition-colors">
                  {user.pseudo}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-600">
                <span className="font-black text-[13px]">{user.xp}</span>
                <span className="font-bold text-[10px] uppercase tracking-wider">XP</span>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/leaderboard"
        className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors relative z-10"
      >
        {getTranslation('leaderboard.view_all', language)}
      </Link>
    </div>
  );
}
