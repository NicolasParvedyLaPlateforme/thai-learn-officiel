'use client';

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IconImage from "@/components/ui/IconImage";
import { m as motion } from "motion/react";
import { useProgressStore } from "@/lib/store";
import PWAInstallButton from "@/components/ui/PWAInstallButton";
import { ArrowLeft, Search, Star, ChevronRight, Play, MapPin, Menu, User } from 'lucide-react';
import detectiveData from "@/data/detective.json";
import DETECTIVE_CATEGORIES from "@/data/detective_categories.json";
import { useIsPWA } from "@/hooks/use-pwa";
import { DetectiveLevel } from "@/types";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import { HeaderActions } from "@/components/layout/HeaderActions";

const CATEGORIES: Record<string, any> = DETECTIVE_CATEGORIES;

export default function DetectivePage() {
  const [mounted, setMounted] = useState(false);
  const isPWA = useIsPWA();
  const { language, xp, completedToday } = useProgressStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On desktop, auto-select first category
    if (window.innerWidth >= 768) {
      const firstCat = Object.keys(CATEGORIES)[0];
      if (firstCat) {
        setSelectedCategoryId(firstCat);
      }
    }
  }, []);

  if (!mounted) return null;

  const levels = detectiveData as DetectiveLevel[];

  // Group levels by category
  const groupedLevels = levels.reduce((acc, level) => {
    const catId = level.categoryId || 'unknown';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(level);
    return acc;
  }, {} as Record<string, DetectiveLevel[]>);

  const selectedLevel = levels.find(l => l.id === selectedLevelId) as DetectiveLevel | undefined;
  const currentCategoryLevels = selectedCategoryId ? (groupedLevels[selectedCategoryId] || []) : [];
  const selectedCategory = selectedCategoryId ? CATEGORIES[selectedCategoryId] : null;

  // Determine what is shown on mobile based on state hierarchy
  const mobileView = selectedLevelId
    ? 'level'
    : (selectedCategoryId ? 'category' : 'categories_list');

  return (
    <div className="relative h-[100dvh] md:h-screen lg:h-[100dvh] bg-[#F5F7FA] md:bg-white font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden pb-[72px] md:pb-0">

      {/* LEFT PANEL : Categories or Levels List */}
      <div className={`w-full md:w-[60%] lg:w-[65%] flex flex-col h-full shrink-0 transition-transform duration-300 md:border-r border-slate-200 bg-white ${mobileView !== 'categories_list' && mobileView !== 'category' ? 'max-md:-translate-x-full max-md:hidden' : ''} ${mobileView === 'level' ? 'max-md:hidden' : ''}`}>

        {/* Mobile Header (hide on md) */}
        <header className="bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between w-full h-full px-4 gap-2">
            <div className="flex items-center gap-3">
              {mobileView === 'category' && (
                <button
                  onClick={() => { setSelectedCategoryId(null); setSelectedLevelId(null); }}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              {mobileView === 'categories_list' && (
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm md:hidden">
                  <Search size={20} />
                </div>
              )}
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight md:hidden">
                {mobileView === 'categories_list' ? (getTranslation('auto.detective', language)) : (selectedCategory ? getLocalizedField(selectedCategory, '', language) : '')}
              </h1>
            </div>

            <HeaderActions
              language={language}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              showPWAButton={mobileView === 'categories_list'} // ou 'categories_list'
            />
          </div>
        </header>

        <MobileHeaderMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenQuests={() => setIsQuestsModalOpen(true)}
        />

        {isQuestsModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsQuestsModalOpen(false)}></div>
            <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar">
              <DailyQuestsWidget />
            </div>
          </div>
        )}

        {/* Desktop Header for Categories List (only show if no category selected) */}
        {!selectedCategoryId && (
          <div className="hidden md:flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Search size={24} className="text-emerald-500" />
              {getTranslation('auto.detective_categories', language)}
            </h1>
          </div>
        )}

        {/* Main List Area */}
        <div className="flex-1 overflow-y-auto w-full">

          {/* View: Categories List */}
          {!selectedCategoryId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 lg:p-8">
              {Object.entries(CATEGORIES).map(([catId, cat], idx) => {
                const hasLevels = groupedLevels[catId] && groupedLevels[catId].length > 0;
                if (!hasLevels) return null;
                return (
                  <motion.button
                    key={catId}
                    initial={window.innerWidth < 768 ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: window.innerWidth < 768 ? 0 : idx * 0.1, ease: "easeOut" }}
                    style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform, opacity' }}
                    onClick={() => {
                      setSelectedCategoryId(catId);
                      if (window.innerWidth >= 768 && groupedLevels[catId]?.length > 0) {
                        setSelectedLevelId(groupedLevels[catId][0].id);
                      }
                    }}
                    className="group flex flex-col items-start p-4 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-200 transition-all text-left shadow-sm hover:shadow-md w-full relative overflow-hidden"
                  >
                    {cat.imageUrl && (
                      <div className="w-full h-40 rounded-2xl bg-slate-100 overflow-hidden relative mb-4">
                        <IconImage src={cat.imageUrl} alt={cat.en} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-2 py-1 shadow-sm text-lg">
                          {cat.emoji}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 w-full flex-1">
                      <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        {!cat.imageUrl && <span className="text-2xl">{cat.emoji}</span>}
                        {getLocalizedField(cat, '', language)}
                      </h2>
                      {cat.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {getLocalizedField(cat.description, '', language)}
                        </p>
                      )}
                      <div className="mt-auto pt-4 flex items-center text-emerald-600 font-bold text-sm">
                        {getTranslation('auto.explore_category', language)}
                        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* View: Levels List for Selected Category */}
          {selectedCategoryId && selectedCategory && (
            <div className="flex flex-col h-full bg-[#fdfdfd]">
              {/* Desktop Breadcrumb & Category Header */}
              <div className="p-4 md:p-8 shrink-0 md:border-b border-slate-100 bg-white shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] relative z-10">
                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 mb-6">
                  <button onClick={() => { setSelectedCategoryId(null); setSelectedLevelId(null); }} className="hover:text-slate-600 transition-colors">
                    {getTranslation('auto.categories', language)}
                  </button>
                  <ChevronRight size={16} />
                  <span className="text-slate-700">{getLocalizedField(selectedCategory, '', language)}</span>
                </div>

                {/* Mobile Header Hero Layout */}
                <div className="md:hidden flex flex-col gap-4">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                    {selectedCategory.imageUrl ? (
                      <>
                        <IconImage src={selectedCategory.imageUrl} alt="" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-emerald-100 flex items-center justify-center">
                        <Search size={64} className="text-emerald-500 opacity-50" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2">
                      {selectedCategory.imageUrl && <div className="text-3xl drop-shadow-md mb-1">{selectedCategory.emoji}</div>}
                      <h1 className={`text-2xl font-extrabold leading-tight ${selectedCategory.imageUrl ? 'text-white' : 'text-slate-800'}`}>
                        {getLocalizedField(selectedCategory, '', language)}
                      </h1>
                      <p className={`text-sm leading-relaxed line-clamp-3 ${selectedCategory.imageUrl ? 'text-slate-200' : 'text-slate-600'}`}>
                        {selectedCategory.description ? getLocalizedField(selectedCategory.description, '', language) : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Header Layout */}
                <div className="hidden md:flex flex-row gap-6 items-start">
                  {selectedCategory.imageUrl && (
                    <div className="w-56 h-36 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative shrink-0">
                      <IconImage src={selectedCategory.imageUrl} alt="" fill className="object-cover" />
                      <div className="absolute bottom-3 left-3 text-3xl drop-shadow-md">{selectedCategory.emoji}</div>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col w-full">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
                      {getLocalizedField(selectedCategory, '', language)}
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed mb-6 line-clamp-3">
                      {selectedCategory.description ? getLocalizedField(selectedCategory.description, '', language) : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapters list (vertical timeline style) */}
              <div className="flex-1 p-4 md:p-8 relative min-h-0">
                <div className="flex flex-col gap-4 md:gap-6 relative z-10 w-full max-w-4xl mx-auto pb-8">
                  {currentCategoryLevels.map((level, index) => {
                    const isSelected = selectedLevelId === level.id;

                    return (
                      <div key={level.id} className="flex gap-4 md:gap-6 items-stretch relative">
                        {/* Timeline circle */}
                        <div className="hidden md:flex flex-col items-center shrink-0 w-10 mt-6 relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base z-10 transition-colors shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)]
                                           ${isSelected ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' :
                              'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-500'
                            }`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* The Card */}
                        <motion.button
                          initial={window.innerWidth < 768 ? false : { opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: window.innerWidth < 768 ? 0 : index * 0.1, ease: "easeOut" }}
                          style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform, opacity' }}
                          onClick={() => setSelectedLevelId(level.id)}
                          className={`group flex-1 flex flex-col md:flex-row items-stretch md:items-center p-3 md:p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden
                                       ${isSelected ? 'border-emerald-400 bg-emerald-50/10 shadow-md ring-4 ring-emerald-50' :
                              'border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200'} ...
                                     `}
                        >
                          {/* Inside the card */}
                          <div className="flex items-center gap-4 w-full">
                            {level.imageUrl ? (
                              <div className={`w-28 h-20 md:w-40 md:h-28 rounded-2xl overflow-hidden shrink-0 relative transition-all`}>
                                <IconImage src={level.imageUrl} alt="" fill className="object-cover" />
                              </div>
                            ) : (
                              <div className={`w-28 h-20 md:w-40 md:h-28 rounded-2xl shrink-0 flex items-center justify-center bg-slate-100`}>
                                <Search size={32} className="text-slate-300 relative z-0" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0 pr-2 py-1 md:py-2 flex flex-col h-full justify-center">
                              <div className="mb-auto">
                                <h3 className={`font-extrabold text-base md:text-lg text-slate-800 truncate`}>
                                  {index + 1}. {getLocalizedField(level, 'title', language)}
                                </h3>
                                <p className={`hidden md:block text-sm text-slate-500 truncate mt-1`}>
                                  {getLocalizedField(level, 'description', language)}
                                </p>
                              </div>

                              <div className={`mt-3 flex items-center gap-3 md:gap-4 text-[11px] md:text-xs font-bold`}>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <Search size={14} /> {level.objects?.length || 0} {getTranslation('auto.objects', language)}
                                </div>
                                <div className="flex items-center gap-1.5 text-orange-400">
                                  <Star size={14} className="fill-current" />
                                  {(completedToday || []).some(k => k.startsWith(`detective_${level.id}_`)) ? (
                                    <>
                                      <span className="line-through text-slate-400 mr-1 opacity-70">+50</span>
                                      <span className="font-bold">+20</span>
                                    </>
                                  ) : (
                                    "+50"
                                  )}
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={20} className={`text-slate-300 shrink-0 mx-2 hidden md:block transition-transform ${isSelected ? 'translate-x-1 text-emerald-400' : 'group-hover:translate-x-1'}`} />
                          </div>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL : Detail & Action */}
      <div className={`flex-1 flex flex-col h-full bg-[#f8fafc] md:bg-white z-20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] w-full md:w-[40%] lg:w-[35%] relative ${mobileView === 'level' ? 'translate-x-0 absolute inset-0' : 'max-md:hidden'} md:relative`}>
        {selectedLevel ? (
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Detail Header (Mobile has back button) */}
            <div className="md:hidden h-[3.75rem] flex items-center px-4 bg-white/80 backdrop-blur sticky top-0 z-50 border-b border-slate-100 shrink-0">
              <button
                onClick={() => setSelectedLevelId(null)}
                className="w-10 h-10 -ml-2 mr-2 bg-slate-100 rounded-full flex justify-center items-center text-slate-600"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-extrabold text-slate-800 truncate">
                {getLocalizedField(selectedLevel, 'title', language)}
              </h2>
            </div>

            <div className="p-4 md:p-8 flex flex-col relative w-full max-w-xl mx-auto">
              {/* Big Image Cover */}
              <div className="w-full aspect-video md:h-56 rounded-3xl overflow-hidden relative shadow-md shrink-0 mb-6 group bg-slate-200">
                {selectedLevel.imageUrl ? (
                  <IconImage src={selectedLevel.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-400">
                    <Search size={48} className="mb-2" />
                  </div>
                )}

                {/* Mock location tag if you want, similar to conversations */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-slate-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <MapPin size={12} className="text-emerald-500" /> {getTranslation('auto.exploration', language)}
                </div>
              </div>

              {/* Title & Desc */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                {getLocalizedField(selectedLevel, 'title', language)}
              </h2>
              <p className="text-slate-500 text-sm md:text-base mb-6 leading-relaxed">
                {getLocalizedField(selectedLevel, 'description', language)}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Search size={16} className="text-slate-400" /> {selectedLevel.objects?.length || 0} {getTranslation('auto.objects_to_find', language)}
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                  <Star size={16} className="fill-orange-400 text-orange-400" />
                  {(completedToday || []).some(k => k.startsWith(`detective_${selectedLevel.id}_`)) ? (
                    <>
                      <span className="line-through text-orange-300 mr-1">+50</span>
                      <span>+20 XP</span>
                    </>
                  ) : (
                    "+50 XP"
                  )}
                </div>
              </div>

              {/* Play Buttons */}
              <div className="flex flex-col gap-3 pb-8">
                <Link href={`/detective/level/${selectedLevel.id}?diff=1`} className="group flex items-center p-4 rounded-3xl border-2 border-emerald-400 bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 mr-4 shadow-sm backdrop-blur-sm">
                    <Play size={24} className="fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-white text-lg">
                      {getTranslation('auto.level_1_thai_translation', language)}
                    </div>
                    <div className="text-sm font-medium text-emerald-100">
                      {getTranslation('auto.find_hidden_objects', language)}
                    </div>
                  </div>
                  <ChevronRight className="text-white shrink-0" />
                </Link>

                <Link href={`/detective/level/${selectedLevel.id}?diff=2`} className="group flex items-center p-4 rounded-3xl border-2 border-amber-400 bg-amber-500 hover:bg-amber-600 transition-colors shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 mr-4 shadow-sm backdrop-blur-sm">
                    <Star size={24} className="fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-white text-lg">
                      {getTranslation('auto.level_2_thai_only', language)}
                    </div>
                    <div className="text-sm font-medium text-amber-100">
                      {getTranslation('auto.no_translations_thai_script_on', language)}
                    </div>
                  </div>
                  <ChevronRight className="text-white shrink-0" />
                </Link>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 hidden md:flex">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {getTranslation('auto.select_a_level', language)}
            </h3>
            <p className="text-slate-500 max-w-xs">
              {getTranslation('auto.choose_a_category_and_select_a', language)}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
