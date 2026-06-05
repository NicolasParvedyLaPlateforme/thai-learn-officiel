'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Trophy, Medal, ChevronLeft } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  pseudo: string;
  xp: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?limit=50')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 pb-24 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 shadow-sm transition-colors mr-4">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Trophy size={28} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Classement Global</h1>
              <p className="text-slate-500 font-medium text-sm">Les meilleurs apprentis détectives et linguistes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="h-4 bg-slate-200 rounded flex-1"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded shrink-0"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Aucun joueur classé pour le moment. À vous de jouer !
            </div>
          ) : (
            <div className="flex flex-col">
              {users.map((user, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 sm:p-6 transition-colors border-b border-slate-100 last:border-b-0 hover:bg-slate-50
                      ${isFirst ? 'bg-amber-50/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 shadow-sm
                        ${isFirst ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-200' : ''}
                        ${isSecond ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white shadow-slate-200' : ''}
                        ${isThird ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-200/50' : ''}
                        ${!isFirst && !isSecond && !isThird ? 'bg-slate-100 text-slate-500 border border-slate-200' : ''}
                      `}>
                        {isFirst ? <Crown size={24} className="stroke-[2.5]" /> : index + 1}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`font-bold text-lg sm:text-xl tracking-tight
                          ${isFirst ? 'text-amber-600' : 'text-slate-700'}
                        `}>
                          {user.pseudo}
                        </span>
                        {(isFirst || isSecond || isThird) && (
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            {isFirst ? 'Champion' : isSecond ? 'Vice-Champion' : 'Challenger'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-base sm:text-lg
                      ${isFirst ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {user.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
