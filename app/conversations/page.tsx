'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useProgressStore } from '../lib/store';
import PWAInstallButton from '../components/PWAInstallButton';
import { ArrowLeft, MessageCircle, Star, BookOpen, Info, ChevronRight, Play, X, Book, Image as ImageIcon, Lock, Check, Clock, Users, Volume2, MapPin } from 'lucide-react';
import conversationsData from '../data/conversations.json';
import CONVERSATION_UNITS from '../data/conversation_units.json';
import { useIsPWA } from '../../hooks/use-pwa';

import { getRequiredLessonsForConv, RequiredVocabLesson } from '../lib/vocabulary-utils';

const UNITS: Record<string, { en: string, fr: string, emoji: string, imageUrl?: string, description?: { en: string, fr: string } }> = CONVERSATION_UNITS;

interface Conversation {
  id: string;
  unitId: string;
  title: string;
  titleEn?: string;
  imageUrl?: string;
  dialogs: Array<{
    speaker?: string;
    en: string;
    fr: string;
    th: string;
  }>;
}

export default function ConversationsPage() {
  const [mounted, setMounted] = useState(false);
  const isPWA = useIsPWA();
  const { language, xp, setLanguage, completedConversations, conversationStars, lessonLevels } = useProgressStore();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedPrereqConv, setSelectedPrereqConv] = useState<{conv: Conversation, missingReqs: RequiredVocabLesson[]} | null>(null);

  useEffect(() => {
    setMounted(true);
    // On desktop, auto-select first story
    if (window.innerWidth >= 768) {
       const firstUnit = Object.keys(UNITS)[0];
       if (firstUnit) {
           setSelectedStoryId(firstUnit);
       }
    }
  }, []);

  if (!mounted) return null;

  // Group conversations by unit
  const groupedConvs = (conversationsData.conversations as Conversation[]).reduce((acc, conv) => {
    if (!acc[conv.unitId]) acc[conv.unitId] = [];
    acc[conv.unitId].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const selectedConv = conversationsData.conversations.find(c => c.id === selectedConvId) as Conversation | undefined;
  
  let isSelectedConvVocabLocked = false;
  let isSelectedConvStoryLocked = false;
  let selectedConvMissingReqs: RequiredVocabLesson[] = [];

  if (selectedConv) {
    if (selectedStoryId) {
      const convs = groupedConvs[selectedStoryId] || [];
      const idx = convs.findIndex(c => c.id === selectedConv.id);
      if (idx > 0) {
        isSelectedConvStoryLocked = (completedConversations[convs[idx - 1].id] ?? -1) < 3;
      }
    }
    const reqs = getRequiredLessonsForConv(selectedConv.dialogs);
    selectedConvMissingReqs = reqs.filter(req => (lessonLevels[req.lessonId] || 0) < 1);
    isSelectedConvVocabLocked = selectedConvMissingReqs.length > 0;
  }

  const currentStoryConvs = selectedStoryId ? (groupedConvs[selectedStoryId] || []) : [];
  const selectedStory = selectedStoryId ? UNITS[selectedStoryId] : null;

  // Determine what is shown on mobile based on state hierarchy
  const mobileView = selectedConvId 
                     ? 'conversation' 
                     : (selectedStoryId ? 'story' : 'stories_list');

  const selectedSpeakers = selectedConv ? Array.from(new Set(selectedConv.dialogs.map(d => d.speaker || (language === 'en' ? 'Character' : 'Personnage')))) : [];

  const handlePlayExcerpt = () => {
     if (selectedConv && selectedConv.dialogs.length > 0) {
         const firstText = selectedConv.dialogs[0].th;
         // simple fake play sound feedback, actual TTS would be better but this is a placeholder
         const audio = new Audio(`/api/tts?text=${encodeURIComponent(firstText)}&speaker=female`);
         audio.play().catch(e => console.log('Audio play failed', e));
     }
  };

  return (
    <div className="relative h-[100dvh] md:h-screen lg:h-[100dvh] bg-[#F5F7FA] md:bg-white font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden pb-[72px] md:pb-0">
      
      {/* LEFT PANEL : Stories or Conversations List */}
      <div className={`w-full md:w-[60%] lg:w-[65%] flex flex-col h-full shrink-0 transition-transform duration-300 md:border-r border-slate-200 bg-white ${mobileView !== 'stories_list' && mobileView !== 'story' ? 'max-md:-translate-x-full max-md:hidden' : ''} ${mobileView === 'conversation' ? 'max-md:hidden' : ''}`}>
        
        {/* Mobile Header (hide on md) */}
        <header className="bg-[#FAFAFA]/95 backdrop-blur-sm z-50 h-[3.75rem] md:hidden shrink-0 border-b border-slate-100">
           <div className="flex items-center justify-between w-full h-full px-4 gap-2">
            <div className="flex items-center gap-3">
              {mobileView === 'story' && (
                 <button 
                    onClick={() => { setSelectedStoryId(null); setSelectedConvId(null); }}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm"
                 >
                    <ArrowLeft size={20} />
                 </button>
              )}
              {mobileView === 'stories_list' && (
                 <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm md:hidden">
                    <BookOpen size={20} />
                 </div>
              )}
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight md:hidden">
                 {mobileView === 'stories_list' ? 'ThaiLearn' : (selectedStory ? (language === 'en' ? selectedStory.en : selectedStory.fr) : '')}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {mobileView === 'stories_list' && <PWAInstallButton />}
              {(mounted && isPWA) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl font-extrabold text-sm">
                  <Star size={18} className="fill-amber-400 stroke-amber-400" />
                  <span>{xp} XP</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Header for Stories List (only show if no story selected) */}
        {!selectedStoryId && (
            <div className="hidden md:flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
               <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {language === 'en' ? 'Stories' : 'Histoires'}
               </h1>
            </div>
        )}

        {/* Main List Area */}
        <div className="flex-1 overflow-y-auto w-full">
          
          {/* View: Stories List */}
          {!selectedStoryId && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 lg:p-8">
               {Object.entries(UNITS).map(([unitId, unit], idx) => {
                  const hasConversations = groupedConvs[unitId] && groupedConvs[unitId].length > 0;
                  if (!hasConversations) return null;
                  return (
                    <motion.button
                      key={unitId}
                      initial={window.innerWidth < 768 ? false : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: window.innerWidth < 768 ? 0 : idx * 0.1, ease: "easeOut" }}
                      style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform, opacity' }}
                      onClick={() => {
                        setSelectedStoryId(unitId);
                        if (window.innerWidth >= 768 && groupedConvs[unitId]?.length > 0) {
                           setSelectedConvId(groupedConvs[unitId][0].id);
                        }
                      }}
                      className="group flex flex-col items-start p-4 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-200 transition-all text-left shadow-sm hover:shadow-md w-full relative overflow-hidden"
                    >
                       {unit.imageUrl && (
                          <div className="w-full h-40 rounded-2xl bg-slate-100 overflow-hidden relative mb-4">
                            <Image src={unit.imageUrl} alt={unit.en} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-2 py-1 shadow-sm text-lg">
                               {unit.emoji}
                            </div>
                          </div>
                       )}
                       <div className="flex flex-col gap-1 w-full flex-1">
                         <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                           {!unit.imageUrl && <span className="text-2xl">{unit.emoji}</span>}
                           {language === 'en' ? unit.en : unit.fr}
                         </h2>
                         {unit.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {language === 'en' ? unit.description.en : unit.description.fr}
                            </p>
                         )}
                         <div className="mt-auto pt-4 flex items-center text-emerald-600 font-bold text-sm">
                            {language === 'en' ? 'Explore Story' : 'Explorer l\'histoire'}
                            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                         </div>
                       </div>
                    </motion.button>
                  );
               })}
             </div>
          )}

          {/* View: Conversations List for Selected Story */}
          {selectedStoryId && selectedStory && (
             <div className="flex flex-col h-full bg-[#fdfdfd]">
                {/* Desktop Breadcrumb & Story Header */}
                <div className="p-4 md:p-8 shrink-0 md:border-b border-slate-100 bg-white shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] relative z-10">
                     <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 mb-6">
                          <button onClick={() => { setSelectedStoryId(null); setSelectedConvId(null); }} className="hover:text-slate-600 transition-colors">
                              {language === 'en' ? 'Stories' : 'Histoires'}
                          </button>
                          <ChevronRight size={16} />
                          <span className="text-slate-700">{language === 'en' ? selectedStory.en : selectedStory.fr}</span>
                     </div>

                     {/* Mobile Header Hero Layout */}
                     <div className="md:hidden flex flex-col gap-4">
                         <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                              {selectedStory.imageUrl ? (
                                  <>
                                      <Image src={selectedStory.imageUrl} alt="" fill className="object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                                  </>
                              ) : (
                                  <div className="absolute inset-0 bg-emerald-100 flex items-center justify-center">
                                      <BookOpen size={64} className="text-emerald-500 opacity-50" />
                                  </div>
                              )}
                              
                              <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2">
                                  {selectedStory.imageUrl && <div className="text-3xl drop-shadow-md mb-1">{selectedStory.emoji}</div>}
                                  <h1 className={`text-2xl font-extrabold leading-tight ${selectedStory.imageUrl ? 'text-white' : 'text-slate-800'}`}>
                                       {language === 'en' ? selectedStory.en : selectedStory.fr}
                                  </h1>
                                  <p className={`text-sm leading-relaxed line-clamp-3 ${selectedStory.imageUrl ? 'text-slate-200' : 'text-slate-600'}`}>
                                       {language === 'en' && selectedStory.description ? selectedStory.description.en : selectedStory.description?.fr}
                                  </p>
                              </div>
                         </div>
                         <div className="w-full pl-1 pr-1">
                              <div className="flex justify-between items-end text-xs font-bold text-slate-500 mb-2">
                                  <span>{language === 'en' ? 'Story progression' : 'Progression de l\'histoire'}</span>
                                  <span className="text-emerald-500 text-sm">
                                     {currentStoryConvs.filter(c => (completedConversations[c.id] ?? -1) >= 3).length}/{currentStoryConvs.length} {language === 'en' ? 'chapters' : 'chapitres'}
                                  </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{width: `${(currentStoryConvs.filter(c => (completedConversations[c.id] ?? -1) >= 3).length/currentStoryConvs.length)*100}%`}}></div>
                              </div>
                         </div>
                     </div>

                     {/* Desktop Header Layout */}
                     <div className="hidden md:flex flex-row gap-6 items-start">
                          {selectedStory.imageUrl && (
                              <div className="w-56 h-36 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative shrink-0">
                                  <Image src={selectedStory.imageUrl} alt="" fill className="object-cover" />
                                  <div className="absolute bottom-3 left-3 text-3xl drop-shadow-md">{selectedStory.emoji}</div>
                              </div>
                          )}
                          <div className="flex-1 flex flex-col w-full min-h-[9rem]">
                              <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
                                   {language === 'en' ? selectedStory.en : selectedStory.fr}
                              </h1>
                              <p className="text-slate-500 text-base leading-relaxed mb-6 line-clamp-3">
                                   {language === 'en' && selectedStory.description ? selectedStory.description.en : selectedStory.description?.fr}
                              </p>
                              
                              <div className="mt-auto w-full">
                                  <div className="flex justify-between items-end text-xs font-bold text-slate-500 mb-2">
                                      <span>{language === 'en' ? 'Story progression' : 'Progression de l\'histoire'}</span>
                                      <span className="text-emerald-500 text-sm">
                                         {currentStoryConvs.filter(c => (completedConversations[c.id] ?? -1) >= 3).length}/{currentStoryConvs.length} {language === 'en' ? 'chapters' : 'chapitres'}
                                      </span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{width: `${(currentStoryConvs.filter(c => (completedConversations[c.id] ?? -1) >= 3).length/currentStoryConvs.length)*100}%`}}></div>
                                  </div>
                              </div>
                          </div>
                     </div>
                </div>

                {/* Chapters list (vertical timeline style) */}
                <div className="flex-1 p-4 md:p-8 relative min-h-0">
                     <div className="flex flex-col gap-4 md:gap-6 relative z-10 w-full max-w-4xl mx-auto pb-8">
                         {currentStoryConvs.map((conv, index) => {
                             const isSelected = selectedConvId === conv.id;
                             const isStoryLocked = index > 0 && (completedConversations[currentStoryConvs[index - 1].id] ?? -1) < 3;
                             const vocabReqs = getRequiredLessonsForConv(conv.dialogs);
                             const missingVocabReqs = vocabReqs.filter(req => (lessonLevels[req.lessonId] || 0) < 1);
                             const isVocabLocked = missingVocabReqs.length > 0;
                             
                             const highestCompleted = completedConversations[conv.id] ?? -1;
                             const isCompleted = highestCompleted >= 3;

                             return (
                               <div key={conv.id} className="flex gap-4 md:gap-6 items-stretch relative">
                                   {/* Vertical timeline line segments */}
                                   {index < currentStoryConvs.length - 1 && (
                                        <div className="absolute left-5 top-12 bottom-[-1.5rem] md:bottom-[-2rem] w-1 hidden md:flex flex-col gap-1.5 -ml-[1.5px] py-1 z-0">
                                            <div className={`w-full flex-1 rounded-full ${highestCompleted >= 0 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                            <div className={`w-full flex-1 rounded-full ${highestCompleted >= 1 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                            <div className={`w-full flex-1 rounded-full ${highestCompleted >= 2 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                            <div className={`w-full flex-1 rounded-full ${highestCompleted >= 3 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                        </div>
                                   )}
                                   {/* Timeline circle */}
                                   <div className="hidden md:flex flex-col items-center shrink-0 w-10 mt-6 relative z-10">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base z-10 transition-colors shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)]
                                           ${isSelected ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 
                                             isCompleted ? 'bg-emerald-500 text-white ring-4 ring-emerald-50' : 
                                             isStoryLocked ? 'bg-slate-100 text-slate-400' :
                                             'bg-orange-100 text-orange-600 ring-4 ring-orange-50' 
                                           }`}>
                                            {isCompleted ? <Check size={20} strokeWidth={3} /> :
                                             isStoryLocked ? <Lock size={16} /> :
                                             (index + 1)}
                                       </div>
                                   </div>

                                   {/* The Card */}
                                   <motion.button
                                     initial={window.innerWidth < 768 ? false : { opacity: 0, x: 20 }}
                                     animate={{ opacity: 1, x: 0 }}
                                     transition={{ duration: 0.4, delay: window.innerWidth < 768 ? 0 : index * 0.1, ease: "easeOut" }}
                                     style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform, opacity' }}
                                     onClick={() => {
                                       if (isStoryLocked) return;
                                       setSelectedConvId(conv.id);
                                     }}
                                     disabled={isStoryLocked}
                                     className={`group flex-1 flex flex-col md:flex-row items-stretch md:items-center p-3 md:p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden
                                       ${isSelected ? 'border-emerald-400 bg-emerald-50/10 shadow-md ring-4 ring-emerald-50' : 
                                         isStoryLocked ? 'border-slate-100 bg-slate-50 opacity-70 cursor-not-allowed' : 
                                         'border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200'} ...
                                     `}
                                   >
                                      {/* Inside the card */}
                                      <div className="flex items-center gap-4 w-full">
                                         {conv.imageUrl ? (
                                             <div className={`w-28 h-20 md:w-40 md:h-28 rounded-2xl overflow-hidden shrink-0 relative transition-all ${(isStoryLocked || isVocabLocked) && !isSelected ? 'grayscale opacity-60' : ''}`}>
                                                 <Image src={conv.imageUrl} alt="" fill className="object-cover" />
                                                 {/* In progress badge overlay */}
                                                 {isSelected && !isCompleted && !isStoryLocked && (
                                                     <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                                                         <Play size={10} className="fill-current" />
                                                         {language === 'en' ? 'In progress' : 'En cours'}
                                                     </div>
                                                 )}
                                                 {/* Locked badge overlay */}
                                                 {isStoryLocked && (
                                                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                                                         <Lock size={20} className="text-white" />
                                                     </div>
                                                 )}
                                             </div>
                                         ) : (
                                            <div className={`w-28 h-20 md:w-40 md:h-28 rounded-2xl shrink-0 flex items-center justify-center bg-slate-100 ${(isStoryLocked || isVocabLocked) && !isSelected ? 'grayscale opacity-60' : ''}`}>
                                               <MessageCircle size={32} className="text-slate-300 relative z-0" />
                                               {isStoryLocked && <div className="absolute"><Lock size={20} className="text-slate-500" /></div>}
                                            </div>
                                         )}

                                         <div className="flex-1 min-w-0 pr-2 py-1 md:py-2 flex flex-col h-full justify-center">
                                            <div className="mb-auto">
                                                <h3 className={`font-extrabold text-base md:text-lg text-slate-800 ${(isStoryLocked) && !isSelected ? 'opacity-60' : ''} truncate`}>
                                                     {index + 1}. {language === 'en' && conv.titleEn ? conv.titleEn : conv.title}
                                                </h3>
                                                <p className={`hidden md:block text-sm text-slate-500 truncate mt-1 ${(isStoryLocked) && !isSelected ? 'opacity-60' : ''}`}>
                                                     {conv.dialogs[0] ? (language === 'en' ? conv.dialogs[0].en : conv.dialogs[0].fr) : ''}
                                                </p>
                                            </div>

                                            <div className={`mt-3 flex items-center gap-3 md:gap-4 text-[11px] md:text-xs font-bold ${(isStoryLocked) && !isSelected ? 'opacity-60 grayscale' : ''}`}>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                   <Clock size={14} /> 8 min
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                   <Users size={14} /> {Array.from(new Set(conv.dialogs.map(d=>d.speaker))).length}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-orange-400">
                                                   <Star size={14} className="fill-current" /> +75
                                                </div>
                                                
                                                {/* Internal Progress */}
                                                <div className="ml-auto flex items-center gap-1">
                                                   {[0, 1, 2, 3].map(l => (
                                                      <div key={l} className={`w-5 md:w-6 h-1.5 rounded-full ${highestCompleted >= l ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                                   ))}
                                                </div>
                                            </div>
                                         </div>
                                         <ChevronRight size={20} className={`text-slate-300 shrink-0 mx-2 hidden md:block transition-transform ${isSelected ? 'translate-x-1 text-emerald-400' : 'group-hover:translate-x-1'}`} />
                                      </div>

                                      {/* Grey out Vocab missing */}
                                      {!isStoryLocked && isVocabLocked && !isSelected && (
                                         <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                                             <div className="bg-blue-600 text-white text-[11px] md:text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
                                                  <BookOpen size={14} />
                                                  {language === 'en' ? 'Prérequis manquants' : 'Prérequis de vocabulaire manquants'}
                                             </div>
                                         </div>
                                      )}
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
      <div className={`flex-1 flex flex-col h-full bg-[#f8fafc] md:bg-white z-20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] w-full md:w-[40%] lg:w-[35%] relative ${mobileView === 'conversation' ? 'translate-x-0 absolute inset-0' : 'max-md:hidden'} md:relative`}>
         {selectedConv ? (
             <div className="flex flex-col h-full overflow-y-auto">
                {/* Detail Header (Mobile has back button) */}
                <div className="md:hidden h-[3.75rem] flex items-center px-4 bg-white/80 backdrop-blur sticky top-0 z-50 border-b border-slate-100 shrink-0">
                   <button 
                     onClick={() => setSelectedConvId(null)}
                     className="w-10 h-10 -ml-2 mr-2 bg-slate-100 rounded-full flex justify-center items-center text-slate-600"
                   >
                     <ArrowLeft size={20} />
                   </button>
                   <h2 className="text-lg font-extrabold text-slate-800 truncate">
                      {language === 'en' && selectedConv.titleEn ? selectedConv.titleEn : selectedConv.title}
                   </h2>
                </div>

                <div className="p-4 md:p-8 flex flex-col relative w-full max-w-xl mx-auto">
                   {/* Big Image Cover */}
                   <div className="w-full aspect-video md:h-56 rounded-3xl overflow-hidden relative shadow-md shrink-0 mb-6 group bg-slate-200">
                       {selectedConv.imageUrl ? (
                           <Image src={selectedConv.imageUrl} alt="" fill className="object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center flex-col bg-gradient-to-br from-orange-100 to-orange-50 text-orange-400">
                              <MessageCircle size={48} className="mb-2" />
                           </div>
                       )}
                       
                       {/* Play excerpt button overlay */}
                       <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={handlePlayExcerpt} className="bg-white/95 backdrop-blur text-slate-800 text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
                               <Volume2 size={18} className="text-emerald-500" />
                               {language === 'en' ? 'Play an excerpt' : 'Ecouter un extrait'}
                           </button>
                       </div>
                       
                       {/* Mock location tag */}
                       <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-slate-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                           <MapPin size={12} className="text-red-500" /> Bangkok
                       </div>
                   </div>

                   {/* Title & Desc */}
                   <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                       {language === 'en' && selectedConv.titleEn ? selectedConv.titleEn : selectedConv.title}
                   </h2>
                   <p className="text-slate-500 text-sm md:text-base mb-6 leading-relaxed">
                       {language === 'en' 
                          ? `Learn to communicate in scenarios like "${selectedConv.dialogs[0]?.en}". Practice listening, reading, and interacting.` 
                          : `Découvrez comment communiquer dans des situations comme "${selectedConv.dialogs[0]?.fr}". Pratiquez l'écoute, la lecture et l'interaction.` }
                   </p>

                   {/* Stats row */}
                   <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 border-b border-slate-100 pb-6">
                       <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           <Clock size={16} className="text-slate-400" /> 8 min
                       </div>
                       <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           <Users size={16} className="text-slate-400" /> {selectedSpeakers.length} {language === 'en' ? 'characters' : 'personnages'}
                       </div>
                       <div className="flex items-center gap-2 text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                           <Star size={16} className="fill-orange-400 text-orange-400" /> +75 XP
                       </div>
                   </div>

                   {/* Personnages */}
                   <div className="mb-8 p-5 bg-slate-50/80 rounded-3xl border border-slate-100">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
                           {language === 'en' ? 'Characters' : 'Personnages'}
                       </div>
                       <div className="flex flex-wrap gap-2">
                           {selectedSpeakers.map((sp, i) => (
                               <div key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2">
                                   <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                                      <Users size={10} />
                                   </div>
                                   {sp}
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Niveaux de difficulté ou Prérequis */}
                   <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">
                           {isSelectedConvStoryLocked 
                              ? '' 
                              : isSelectedConvVocabLocked 
                                 ? (language === 'en' ? 'Missing Prerequisites' : 'Prérequis manquants')
                                 : (language === 'en' ? 'Difficulty Levels' : 'Niveaux de difficulté')
                           }
                       </div>

                       {isSelectedConvStoryLocked ? (
                           <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 flex items-center justify-center">
                                    <Lock size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">{language === 'en' ? 'Chapter Locked' : 'Chapitre bloqué'}</h3>
                                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{language === 'en' ? 'Complete Level 2 of the previous conversation to continue the story.' : 'Terminer le Niveau 2 de la conversation précédente pour continuer l\'histoire.'}</p>
                           </div>
                       ) : isSelectedConvVocabLocked ? (
                           <div className="flex flex-col gap-4">
                               <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 text-sm text-blue-700 font-medium mb-2">
                                  {language === 'en' 
                                      ? 'You must complete Level 1 of the following lessons to learn the required vocabulary.' 
                                      : 'Vous devez réaliser le Niveau 1 des leçons suivantes pour apprendre le vocabulaire.'}
                               </div>
                               {selectedConvMissingReqs.map(req => (
                                    <div key={req.lessonId} className="bg-white border-2 border-slate-100/60 rounded-[24px] p-5 md:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all hover:shadow-md hover:border-slate-200 group relative overflow-hidden">
                                       <div className="absolute top-0 right-0 bg-blue-50 text-blue-500 text-[10px] font-extrabold tracking-wider px-3 py-1.5 rounded-bl-xl border-l-[2px] border-b-[2px] border-blue-50/60">
                                          VOCAB
                                       </div>
                                       <h4 className="font-extrabold text-[#20304a] text-lg md:text-xl leading-tight mb-5 pr-12">
                                           {language === 'en' ? req.lessonTitleEn : req.lessonTitle}
                                       </h4>
                                       
                                       <div className="text-[11px] font-extrabold text-[#869ab8] uppercase tracking-[0.12em] mb-4">
                                           {language === 'en' ? 'Words to learn' : 'Mots à apprendre'} :
                                       </div>
                                       
                                       <div className="flex flex-wrap gap-2.5 mb-6">
                                          {req.matchedWords.slice(0, 8).map((mw, i) => (
                                              <span key={i} className="text-[13px] text-[#4b5563] bg-white border-2 border-[#e2e8f0]/60 px-3.5 py-1.5 rounded-[12px] flex items-center gap-1.5 flex-wrap font-medium">
                                                 <span className="font-bold text-[#20304a] text-sm">{mw.th}</span> 
                                                 <span className="text-[#869ab8]">({language === 'en' ? mw.en : mw.fr})</span>
                                              </span>
                                          ))}
                                          {req.matchedWords.length > 8 && <span className="text-sm font-bold text-[#869ab8] px-2 py-1.5">...</span>}
                                       </div>
                                       
                                       <Link 
                                          href={`/lesson/${req.lessonId}?level=1`} 
                                          className="flex w-full items-center justify-center gap-2 bg-[#2d7ef8] hover:bg-[#2067d5] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
                                       >
                                          <Play size={16} className="fill-current" />
                                          {language === 'en' ? 'Learn words' : 'Apprendre ces mots'}
                                       </Link>
                                    </div>
                                ))}
                           </div>
                       ) : (
                           <div className="flex flex-col gap-3 pb-8">
                               {(() => {
                                  const highestCompleted = completedConversations[selectedConv.id] ?? -1;
                                  const starsArr = conversationStars[selectedConv.id] || [0,0,0,0];
                                  const isLevel1Locked = highestCompleted < 0;
                                  const isLevel2Locked = highestCompleted < 1;
                                  const isLevel3Locked = highestCompleted < 2;

                                  return (
                                     <>
                                         {/* Base Conversation */}
                                         <Link href={`/conversations/${selectedConv.id}`} className="group flex items-center p-4 rounded-3xl border-2 border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50 transition-colors shadow-sm">
                                             <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mr-4 shadow-sm">
                                                 <Check size={24} strokeWidth={3} />
                                             </div>
                                             <div className="flex-1">
                                                 <div className="font-extrabold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                                                     {language === 'en' ? 'Base conversation' : 'Conversation de base'}
                                                 </div>
                                                 <div className="text-sm font-medium text-slate-500">
                                                     {language === 'en' ? 'Listen and read' : 'Écouter et lire'}
                                                 </div>
                                             </div>
                                             <ChevronRight className="text-emerald-500 shrink-0" />
                                         </Link>

                                         {/* Level 1 */}
                                         <Link 
                                            href={isLevel1Locked ? '#' : `/conversations/${selectedConv.id}?level=1`}
                                            className={`group flex items-center p-4 rounded-3xl border-2 transition-all ${isLevel1Locked ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-orange-400 bg-white hover:bg-orange-50 shadow-sm'}`}
                                         >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm ${isLevel1Locked ? 'bg-slate-200 text-slate-400' : 'bg-orange-500 text-white'}`}>
                                                {isLevel1Locked ? <Lock size={20} /> : <Star size={24} className="fill-current" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                   <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                                                       Niveau 1
                                                   </div>
                                                   {!isLevel1Locked && (
                                                        <div className="flex gap-0.5 pr-2">
                                                            <Star size={14} className={starsArr[1] > 0 ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[1] > 1 ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[1] > 2 ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[1] > 3 ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[1] > 4 ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"} />
                                                        </div>
                                                   )}
                                                </div>
                                                <div className={`font-extrabold text-base transition-colors ${isLevel1Locked ? 'text-slate-600' : 'text-slate-800 group-hover:text-orange-700'}`}>
                                                    {language === 'en' ? 'Fill in the blanks' : 'Remplir la conversation'}
                                                </div>
                                            </div>
                                            {!isLevel1Locked && <ChevronRight className="text-orange-400 shrink-0" />}
                                         </Link>

                                         {/* Level 2 */}
                                         <Link 
                                            href={isLevel2Locked ? '#' : `/conversations/${selectedConv.id}?level=2`}
                                            className={`group flex items-center p-4 rounded-3xl border-2 transition-all ${isLevel2Locked ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-purple-400 bg-white hover:bg-purple-50 shadow-sm'}`}
                                         >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm ${isLevel2Locked ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-purple-400'}`}>
                                                {isLevel2Locked ? <Lock size={20} /> : <Star size={24} className="fill-current" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                   <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                                                       Niveau 2
                                                   </div>
                                                   {!isLevel2Locked && (
                                                        <div className="flex gap-0.5 pr-2">
                                                            <Star size={14} className={starsArr[2] > 0 ? "fill-purple-400 text-purple-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[2] > 1 ? "fill-purple-400 text-purple-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[2] > 2 ? "fill-purple-400 text-purple-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[2] > 3 ? "fill-purple-400 text-purple-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[2] > 4 ? "fill-purple-400 text-purple-400" : "fill-slate-200 text-slate-200"} />
                                                        </div>
                                                   )}
                                                </div>
                                                <div className={`font-extrabold text-base transition-colors ${isLevel2Locked ? 'text-slate-600' : 'text-slate-800 group-hover:text-purple-700'}`}>
                                                    {language === 'en' ? 'Fill in the word' : 'Remplir le mot'}
                                                </div>
                                                {isLevel2Locked && <div className="text-xs font-medium text-slate-500 mt-0.5">Terminer le Niveau 1</div>}
                                            </div>
                                            {!isLevel2Locked && <ChevronRight className="text-purple-300 shrink-0" />}
                                         </Link>

                                         {/* Level 3 */}
                                         <Link 
                                            href={isLevel3Locked ? '#' : `/conversations/${selectedConv.id}?level=3`}
                                            className={`group flex items-center p-4 rounded-3xl border-2 transition-all ${isLevel3Locked ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-blue-400 bg-white hover:bg-blue-50 shadow-sm'}`}
                                         >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm ${isLevel3Locked ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-blue-400'}`}>
                                                {isLevel3Locked ? <Lock size={20} /> : <Star size={24} className="fill-current" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                   <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                                                       Niveau 3
                                                   </div>
                                                   {!isLevel3Locked && (
                                                        <div className="flex gap-0.5 pr-2">
                                                            <Star size={14} className={starsArr[3] > 0 ? "fill-blue-400 text-blue-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[3] > 1 ? "fill-blue-400 text-blue-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[3] > 2 ? "fill-blue-400 text-blue-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[3] > 3 ? "fill-blue-400 text-blue-400" : "fill-slate-200 text-slate-200"} />
                                                            <Star size={14} className={starsArr[3] > 4 ? "fill-blue-400 text-blue-400" : "fill-slate-200 text-slate-200"} />
                                                        </div>
                                                   )}
                                                </div>
                                                <div className={`font-extrabold text-base transition-colors ${isLevel3Locked ? 'text-slate-600' : 'text-slate-800 group-hover:text-blue-700'}`}>
                                                    {language === 'en' ? 'Choose the phrase' : 'Choisir la phrase'}
                                                </div>
                                                {isLevel3Locked && <div className="text-xs font-medium text-slate-500 mt-0.5">Terminer le Niveau 2</div>}
                                            </div>
                                            {!isLevel3Locked && <ChevronRight className="text-blue-300 shrink-0" />}
                                         </Link>
                                     </>
                                  );
                               })()}
                           </div>
                       )}
                   </div>
                </div>
             </div>
         ) : (
             <div className="flex-1 flex items-center justify-center p-8 bg-[#fdfdfd]">
                <div className="max-w-sm text-center">
                   <div className="w-24 h-24 mx-auto bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6 rotate-3">
                      <BookOpen size={48} className="opacity-50" />
                   </div>
                   <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
                       {language === 'en' ? 'Start practicing' : 'Pratiquez un dialogue'}
                   </h3>
                   <p className="text-slate-500 leading-relaxed font-medium">
                       {language === 'en' 
                          ? 'Select a conversation from the story to view its details, characters, and difficulty levels.'
                          : 'Sélectionnez une conversation de l\'histoire pour voir les chapitres et commencer à repousser vos limites.'}
                   </p>
                </div>
             </div>
         )}
      </div>
    </div>
  );
}


