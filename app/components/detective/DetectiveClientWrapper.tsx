'use client';

import React from 'react';
import { DetectiveLevel } from '../../types';
import DetectiveDevMode from './DetectiveDevMode';
import DetectiveGame from './DetectiveGame';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useProgressStore } from '../../lib/store';

interface Props {
  level: DetectiveLevel;
  isDev: boolean;
}

export default function DetectiveClientWrapper({ level, isDev }: Props) {
  const { language } = useProgressStore();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 w-full max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <Link href="/detective" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">
            {language === 'en' ? level.titleEn : level.title}
          </h1>
          {isDev && (
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              DEV MODE
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
        {isDev ? (
          <DetectiveDevMode level={level} />
        ) : (
          <DetectiveGame level={level} />
        )}
      </div>
    </div>
  );
}
