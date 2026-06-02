'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProgressStore } from '../lib/store';
import { Search, ChevronRight } from 'lucide-react';
import detectiveData from '../data/detective.json';
import { DetectiveLevel } from '../types';

export default function DetectivePage() {
  const { language } = useProgressStore();
  const levels = detectiveData as DetectiveLevel[];

  return (
    <div className="flex-1 pb-24 max-w-2xl mx-auto w-full px-4 pt-6 md:pt-10">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Search className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">
            {language === 'en' ? 'Detective' : 'Détective'}
          </h1>
        </div>
        <p className="text-slate-600">
          {language === 'en' 
            ? 'Find hidden objects in images to learn Thai vocabulary.'
            : 'Trouvez les objets cachés dans les images pour apprendre le vocabulaire thaï.'}
        </p>
      </header>

      <div className="space-y-4">
        {levels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {language === 'en' 
                ? 'No levels available yet. New levels are coming soon!'
                : 'Aucun niveau disponible pour le moment. De nouveaux niveaux arrivent bientôt !'}
            </p>
          </div>
        ) : (
          levels.map((level) => (
            <Link 
              key={level.id} 
              href={`/detective/level/${level.id}`}
              className="group block bg-white rounded-2xl p-4 border-2 border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                  {level.imageUrl ? (
                    <Image 
                      src={level.imageUrl} 
                      alt={language === 'en' ? level.titleEn : level.title} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
                    {language === 'en' ? level.titleEn : level.title}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {language === 'en' ? level.descriptionEn : level.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                      {level.objects?.length || 0} {language === 'en' ? 'objects' : 'objets'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
