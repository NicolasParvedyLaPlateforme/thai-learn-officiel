'use client';

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { Suspense } from 'react';
import Link from 'next/link';
import IconImage from "@/components/ui/IconImage";
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, RotateCcw, Volume2, Star, MessageCircle, Check, X, Home, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { useProgressStore } from "@/lib/store";
import { playThaiTTS } from "@/lib/tts";
import speakersConfig from "@/data/speakers.json";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { m as motion, AnimatePresence } from "motion/react";
import { useConversationLogic } from "@/hooks/useConversationLogic";

function ConversationContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const level = searchParams.get('level');

  const { language, addXp, showRomanization, completedLessons, completeConversation } = useProgressStore();

  const { state, actions } = useConversationLogic(
    id,
    level,
    completedLessons,
    language,
    addXp,
    completeConversation,
    searchParams
  );

  if (!state.mounted) return null;

  if (!state.conversation) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans text-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getTranslation('auto.conversation_not_found', language)}</h2>
          <Link href="/conversations" className="text-orange-500 font-bold hover:underline">
            {getTranslation('auto.return_to_conversations', language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    // We need pb-[350px] or more so that we can always scroll the last message to the top of the screen when the choices menu is open.
    <div className="min-h-[100dvh] bg-[#FAFAFA] font-sans text-slate-800 pb-[350px]">
      <AnimatePresence mode="wait">
        {!state.showExerciseUI ? (
          <LoadingScreen 
            key="loading-screen"
            isLoadingData={!state.isDataLoaded} 
            onReady={() => actions.setShowExerciseUI(true)} 
          />
        ) : (
          <motion.div
            key="exercise-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col h-full w-full absolute inset-0"
          >
      <motion.header 
        initial={{ y: 0 }}
        animate={{ y: state.showHeader ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50"
      >
        <div className="flex items-center gap-4 max-w-2xl mx-auto w-full border-slate-200 relative">
          <Link href="/conversations" className="text-slate-400 hover:text-slate-600 transition-colors z-10">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <div className="h-3 bg-slate-200 rounded-full w-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ 
                  width: `${Math.max(5, ((state.isLevel1 && !state.isFinished ? state.stepIndex : state.currentLineIndex) / state.conversation.dialogs.length) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
          {state.isInteractive && (
            <div className="flex items-center gap-1.5 z-10 relative">
               {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="relative w-6 h-6 flex items-center justify-center">
                    <Star size={24} className="fill-slate-200 text-slate-200 absolute inset-0" />
                    <AnimatePresence>
                      {i < state.stars ? (
                         <motion.div
                           key={`star-${i}`}
                           initial={{ scale: 1, opacity: 1 }}
                           exit={{ 
                             scale: [1, 1.4, 0], 
                             rotate: [0, -15, 45], 
                             opacity: [1, 1, 0], 
                             y: [0, -10, 20],
                             filter: ["brightness(1)", "brightness(1.5)", "blur(2px)"]
                           }}
                           transition={{ duration: 0.6, ease: "easeIn" }}
                           className="absolute inset-0"
                         >
                           <Star size={24} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                         </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <AnimatePresence>
                      {(state.lostStarAnimation && i === state.stars) ? (
                        <motion.div 
                          key={`minus-${i}`}
                          className="absolute pointer-events-none z-50 text-red-500 font-black text-sm"
                          initial={{ opacity: 0, y: 0, scale: 0.5 }}
                          animate={{ opacity: 1, y: -25, scale: 1.2 }}
                          exit={{ opacity: 0, y: -40, scale: 1 }}
                          transition={{ duration: 1 }}
                        >
                          -1
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                 </div>
               ))}
            </div>
          )}
        </div>
      </motion.header>

      <main className="max-w-xl mx-auto px-4 mt-24 flex flex-col gap-6">
        <div className="text-center mb-4 transition-all duration-300">
            <h1 className="text-2xl font-black text-slate-800">
                {getLocalizedField(state.conversation, 'title', language)}
            </h1>
        </div>

        {!state.hasStarted ? (
          <div className="flex flex-col items-center justify-center mt-8 gap-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
            {state.conversation.imageUrl ? (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <IconImage src={state.conversation.imageUrl} alt={state.conversation.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 36rem" priority />
              </div>
            ) : (
              <div className="bg-orange-100 text-orange-500 p-6 rounded-full">
                <MessageCircle size={48} />
              </div>
            )}
            <p className="text-center text-slate-600 font-medium">
              {state.isLevel1 
                ? (getTranslation('auto.complete_the_conversation_by_c', language))
                : state.isLevel2
                  ? (getTranslation('auto.complete_the_sentences_by_choo', language))
                  : state.isLevel3
                    ? (getTranslation('auto.complete_the_sentences_by_choo_17', language))
                    : (getTranslation('auto.listen_to_the_conversation_to', language))
              }
            </p>
            <Button
              size="lg"
              onClick={actions.startInteraction}
              className="w-full text-lg font-bold py-4 px-8"
            >
              <Play size={24} className="fill-white" />
              {getTranslation('auto.start', language)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-32">
            {state.conversation.dialogs.map((dialog: any, index: number) => {
              // Hide lines that haven't been reached yet
              const isVisible = state.isInteractive && !state.isFinished ? index <= state.stepIndex : index <= state.currentLineIndex || state.isFinished;
              if (!isVisible) return null;
              
              const speakerInfo = (speakersConfig as any)[dialog.speaker] || {
                name: dialog.speaker,
                avatar: '/deedee-no-bg.png',
                bubbleColor: 'bg-white border-slate-200 text-slate-800',
                position: dialog.speaker === 'Tom' ? 'right' : 'left'
              };
              
              const isRight = speakerInfo.position === 'right';
              
              // In Level 1, 2 and 3, if this is the current guess step, we show a waiting bubble or blank
              const isGuessingThisLine = !state.isFinished && index === state.stepIndex && 
                (state.isLevel3 || (state.isLevel2 && !state.warnings.includes(index)) || (state.isLevel1 && index % 2 !== 0));
              
              const isActive = (index === state.currentLineIndex && state.isPlaying);
              
              return (
                <div 
                  key={index} 
                  className={`message-bubble scroll-mt-20 flex w-full gap-3 py-1 ${isRight ? 'justify-end flex-row-reverse' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-6 flex flex-col items-center">
                     <IconImage 
                       src={speakerInfo.avatar} 
                       alt={speakerInfo.name} 
                       width={60} 
                       height={60} 
                       className={`rounded-full border object-cover bg-white shadow-sm ${
                         isRight ? 'border-blue-200' : 'border-slate-200'
                       }`}
                       referrerPolicy="no-referrer"
                     />
                  </div>

                  {/* Speaker bubble */}
                  <div className={`relative max-w-[75%] flex flex-col gap-1 ${isRight ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wide">
                      {speakerInfo.name}
                    </span>
                    <div 
                      className={`
                        p-4 rounded-3xl shadow-sm border-2
                        ${isGuessingThisLine
                          ? 'bg-slate-100 border-slate-200 text-slate-400 rounded-2xl'
                          : `${speakerInfo.bubbleColor} ${isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                        }
                        ${isActive ? 'ring-4 ring-orange-400 ring-opacity-50 !border-orange-400' : ''}
                        transition-all duration-300
                      `}
                    >
                      {isGuessingThisLine ? (
                        (state.isLevel1 || state.isLevel3) ? (
                          <div className="flex items-center gap-1.5 py-2 px-1">
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <div className="text-2xl font-medium font-thai leading-relaxed">
                            {state.targetWord ? dialog.th.replace(state.targetWord.th, '______') : '______'}
                          </div>
                        )
                      ) : (
                        <div className="text-2xl font-medium font-thai leading-relaxed">
                          {dialog.th}
                        </div>
                      )}
                    </div>
                    
                    {/* Replay button next to the bubble during review mode */}
                    {state.isFinished && (
                      <IconButton 
                         size="md"
                         onClick={() => playThaiTTS(dialog.th)}
                         className={`absolute ${isRight ? '-left-12' : '-right-12'} top-6 text-slate-400 hover:text-orange-500 hover:bg-orange-50 bg-transparent shadow-none border-none`}
                      >
                         <Volume2 size={24} />
                      </IconButton>
                    )}
                    
                    {/* Phonetics and translation (shown when finished) */}
                    {(state.isFinished || (!state.isInteractive && index < state.currentLineIndex) || (state.isInteractive && index < state.stepIndex) || state.warnings.includes(index)) && !isGuessingThisLine && (
                      <div className={`px-2 flex flex-col gap-1 ${isRight ? 'text-right' : 'text-left'}`}>
                        {state.warnings.includes(index) && (
                          <span className="text-xs font-bold text-red-500 bg-red-50 p-1 rounded inline-block w-fit mb-1">
                            ⚠️ {getTranslation('auto.no_exact_word_found_in_course', language)}
                          </span>
                        )}
                        {showRomanization && <span className="text-sm font-bold text-orange-500">{dialog.phonetic}</span>}
                        <span className="text-sm font-medium text-slate-500">
                          {getLocalizedField(dialog, '', language)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={state.endOfMessagesRef} className={`transition-all ${state.choices.length > 0 ? 'h-[280px] sm:h-[320px]' : 'h-32 sm:h-48'}`} />
      </main>

      {/* Choices overlay for level 1, 2 and 3 */}
      {state.hasStarted && state.isInteractive && !state.isFinished && (state.isLevel2 || state.isLevel3 || state.stepIndex % 2 !== 0) && state.choices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:p-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-2xl mx-auto flex flex-col gap-1.5 sm:gap-2">
            {(state.isLevel1 || state.isLevel3) && state.hintWord && (
              <div className="w-full mb-2 bg-indigo-50/50 rounded-2xl p-2 sm:p-3 border border-indigo-100 flex flex-col items-center gap-2">
                 <div className="text-[11px] sm:text-xs font-bold text-indigo-800 flex items-center gap-1.5 text-center">
                    <Sparkles size={14} />
                    {getTranslation('auto.need_a_hint', language)}
                 </div>
                 <div className="flex w-full overflow-x-auto pb-1 items-center justify-center gap-1.5 sm:gap-2 mt-0.5">
                     <Button
                       variant="outline"
                       onClick={() => {
                          actions.attemptApplyHintCost(1);
                          if (state.hintWord) playThaiTTS(state.hintWord.th);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 flex items-center justify-center gap-1.5 min-h-[36px] ${state.hintsUsed[1] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        <Volume2 size={16} /> 
                        <span className="hidden sm:inline">
                           {state.hintsUsed[1] ? (getTranslation('auto.replay', language)) : (getTranslation('auto.hint_1', language))}
                        </span>
                     </Button>

                     <Button
                       variant="outline"
                       onClick={() => {
                          actions.attemptApplyHintCost(2);
                          actions.setIsImageModalOpen(true);
                        }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 flex items-center justify-center gap-1.5 min-h-[36px] min-w-[70px] ${state.hintsUsed[2] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        <ImageIcon size={16} />
                        <span className="hidden sm:inline">{state.hintsUsed[2] ? (getTranslation('auto.image', language)) : (getTranslation('auto.hint_2', language))}</span>
                     </Button>

                     <Button
                       variant="outline"
                       onClick={() => {
                          actions.attemptApplyHintCost(3);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 flex items-center justify-center gap-1.5 min-h-[36px] ${state.hintsUsed[3] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        {!state.hintsUsed[3] && <Type size={16} />} 
                        {state.hintsUsed[3] ? <span>{getLocalizedField(state.hintWord, '', language)}</span> : <span className="hidden sm:inline">{getTranslation('auto.hint_3', language)}</span>}
                     </Button>
                     
                     <Button
                       variant="outline"
                       onClick={() => {
                          actions.attemptApplyHintCost(4);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 flex items-center justify-center gap-1.5 min-h-[36px] ${state.hintsUsed[4] ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                       title={getTranslation('auto.highlight_differences', language)}
                     >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">
                           {state.hintsUsed[4] ? (getTranslation('auto.focus_on', language)) : (getTranslation('auto.hint_4', language))}
                        </span>
                     </Button>
                 </div>
              </div>
            )}
            <div className="flex items-end justify-between px-2 mb-0">
               <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {getTranslation('auto.choose_the_correct_response', language)}
               </h3>
            </div>
            {state.choices.map((choice: any) => {
              const isSelected = state.selectedChoiceId === choice.id;
              const isWrongStatus = isSelected && state.isChoiceCorrect === false;
              const isCorrectStatus = isSelected && state.isChoiceCorrect === true;
              
              let cardStyle = "bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800";
              if (state.isLevel2) cardStyle = "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800";
              if (state.isLevel3) cardStyle = "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800";
              
              if (isWrongStatus) {
                cardStyle = "bg-red-50 border-red-400 text-red-900";
              } else if (isCorrectStatus) {
                cardStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
              }

              // Hint 4 rendering
              const applyHint4 = state.hintsUsed[4] && choice.segments;
              
              return (
                <button
                  key={choice.id}
                  onClick={() => actions.handleChoiceSelect(choice)}
                  disabled={state.isChoiceCorrect !== null}
                  className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all relative ${cardStyle}`}
                >
                  <div className="font-thai text-lg sm:text-xl font-medium leading-tight pr-6">
                     {applyHint4 ? (
                        choice.segments.map((segment: string, i: number) => (
                           <span key={i} className={`${i !== choice.visibleSegmentIndex ? 'opacity-30' : 'opacity-100'}`}>{segment}</span>
                        ))
                     ) : (
                        <span>{choice.text}</span>
                     )}
                  </div>
                  {state.isLevel1 && showRomanization && <div className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">{choice.phonetic}</div>}
                  {state.isLevel2 && <div className="text-xs sm:text-sm font-medium opacity-80 text-slate-500 mt-0.5">{choice.translation} {showRomanization ? `• ${choice.phonetic}` : ''}</div>}
                  {state.isLevel3 && showRomanization && <div className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">{choice.phonetic}</div>}
                  
                  {isWrongStatus && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                  {isCorrectStatus && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer controls when finished */}
      {state.isFinished && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-2xl mx-auto flex gap-4">
            <Link
              href="/conversations"
              className="flex-none bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-4 rounded-2xl border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center"
            >
              <Home size={24} />
            </Link>
            {!state.isInteractive && (
              <Button 
                variant="outline"
                size="lg"
                onClick={actions.startNormalConversation}
                className="flex-[1] bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 border-b-4 active:border-b-2 active:translate-y-0.5"
              >
                <RotateCcw size={24} />
                <span className="hidden sm:inline">{getTranslation('auto.listen_again', language)}</span>
              </Button>
            )}
            {!state.isInteractive && (
              <Link 
                href={`/conversations/${state.conversation.id}?level=1`}
                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-orange-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
              >
                <span className="flex items-center gap-2">
                  {getTranslation('auto.start_level_1', language)}
                  <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                     <Star size={16} className="fill-white" />
                  </div>
                </span>
              </Link>
            )}
            
            {state.isInteractive && (() => {
              const passedLv12 = (state.isLevel1 || state.isLevel2) && state.stars >= 3;
              const passedLv3 = state.isLevel3 && state.stars >= 4;
              
              if (state.isLevel1) {
                if (passedLv12) {
                  return (
                    <Link 
                      href={`/conversations/${state.conversation.id}?level=2`}
                      className="flex-[2] bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-purple-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
                    >
                      <span className="flex items-center gap-2">
                        {getTranslation('auto.start_level_2', language)}
                        <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                           <Star size={16} className="fill-white" />
                        </div>
                      </span>
                    </Link>
                  );
                } else {
                  return (
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={actions.restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 border-slate-400"
                    >
                      <RotateCcw size={20} />
                      {getTranslation('auto.retry', language)} (Score: {state.stars} / ★★★)
                    </Button>
                  );
                }
              } else if (state.isLevel2) {
                if (passedLv12) {
                  return (
                    <Link 
                      href={`/conversations/${state.conversation.id}?level=3`}
                      className="flex-[2] bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-purple-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
                    >
                      <span className="flex items-center gap-2">
                        {getTranslation('auto.start_level_3', language)}
                        <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                           <Star size={16} className="fill-white" />
                        </div>
                      </span>
                    </Link>
                  );
                } else {
                  return (
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={actions.restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 border-slate-400"
                    >
                      <RotateCcw size={20} />
                      {getTranslation('auto.retry', language)} (Score: {state.stars} / ★★★)
                    </Button>
                  );
                }
              } else if (state.isLevel3) {
                if (passedLv3) {
                  return (
                    <Link 
                      href="/conversations"
                      className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-blue-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center gap-2"
                    >
                      <Check size={24} className="text-white" />
                      {getTranslation('auto.complete_level_3', language)}
                    </Link>
                  );
                } else {
                  return (
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={actions.restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 border-slate-400"
                    >
                      <RotateCcw size={20} />
                      {getTranslation('auto.retry', language)} (Score: {state.stars} / ★★★★)
                    </Button>
                  );
                }
              }
            })()}
          </div>
        </div>
      )}
            </motion.div>
          )}
        </AnimatePresence>

      {/* Image Modal for Hint 2 */}
      {state.isImageModalOpen && state.hintWord && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => actions.setIsImageModalOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton 
              size="md"
              onClick={() => actions.setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 bg-slate-100 hover:bg-slate-200"
            >
              <X size={20} />
            </IconButton>
            <div className="w-48 h-48 relative mb-4 mt-2">
               <IconImage src={state.hintWord.imageUrl || `/images/w_w_${state.hintWord.id}.svg`} alt="Hint Image" fill className="object-contain" />
            </div>
            <p className="text-sm font-bold text-slate-400 mt-2">{getTranslation('auto.tap_anywhere_to_close', language)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationContentWrapper() {
  const searchParams = useSearchParams();
  const level = searchParams.get('level');
  return <ConversationContent key={level || 'base'} />;
}

export default function ConversationExercisePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="animate-spin text-orange-500"><RotateCcw size={32} /></div></div>}>
      <ConversationContentWrapper />
    </Suspense>
  )
}
