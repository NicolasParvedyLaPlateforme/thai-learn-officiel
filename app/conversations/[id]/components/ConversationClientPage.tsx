'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, RotateCcw, Volume2, Star, MessageCircle, Check, X, Home, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { useProgressStore } from '../../../lib/store';
import { playThaiTTS, playThaiTTSAsync } from '../../../lib/tts';
import conversationsData from '../../../data/conversations.json';
import speakersConfig from '../../../data/speakers.json';
import { getVocabularyServer } from '../../../actions/course';
import { Word } from '../../../types';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { AnimatePresence, motion } from "motion/react";

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function ConversationContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const level = searchParams.get('level');
  const isLevel1 = level === '1';
  const isLevel2 = level === '2';
  const isLevel3 = level === '3';
  const isInteractive = isLevel1 || isLevel2 || isLevel3;

  const { language, addXp, showRomanization, completedLessons, completeConversation } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  const [allWords, setAllWords] = useState<Word[]>([]);
  
  const conversation = conversationsData.conversations.find(c => c.id === id);
  
  // States for normal playback / review playback
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Scoring and Hints
  const [stars, setStars] = useState(5);
  const [hintsUsed, setHintsUsed] = useState<{ [key: number]: boolean }>({});
  const [hintWord, setHintWord] = useState<Word | null>(null);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [lostStarAnimation, setLostStarAnimation] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const prevStarsRef = useRef(stars);

  // Level 1 and 2 specific states
  // We advance the conversation step by step.
  const [stepIndex, setStepIndex] = useState(0); 
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isChoiceCorrect, setIsChoiceCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only hide the header automatically when these specific properties change (state transition)
    // we want to still allow the user to show it by scrolling up.ok
    if (hasStarted && !isFinished) {
      setShowHeader(false);
    }
  }, [stepIndex, currentLineIndex]);

  useEffect(() => {
    if (stars < prevStarsRef.current) {
      setLostStarAnimation(true);
      setShowHeader(true);
      setTimeout(() => setLostStarAnimation(false), 1200);
    }
    prevStarsRef.current = stars;
  }, [stars]);
  const [targetWord, setTargetWord] = useState<Word | null>(null); // For level 2

  const [warnings, setWarnings] = useState<number[]>([]);

  const [showExerciseUI, setShowExerciseUI] = useState(false);

  // We use a ref to track if we should continue playing (handles component unmount or stop)
  const isPlayingRef = useRef(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    getVocabularyServer('all', completedLessons).then(words => {
      setAllWords(words as Word[]);
    });
    return () => {
      isPlayingRef.current = false;
    };
  }, [completedLessons]);

  // Auto-scroll effect
  useEffect(() => {
    // Determine timeout based on whether we are showing choices so rendering can catch up
    setTimeout(() => {
      const messages = document.querySelectorAll('.message-bubble');
      if (messages.length > 0) {
        if (choices && choices.length > 0) {
          // When choices are visible, we want to ensure the target message (previous speaker) is at the top/center
          const targetIndex = Math.max(0, messages.length - 2);
          const yOffset = -70; // Account for the sticky header
          const element = messages[targetIndex];
          if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
          }
        } else {
          // Normal chatting
          const lastElement = messages[messages.length - 1];
          const rect = lastElement.getBoundingClientRect();
          // Only scroll if the element is near or below the bottom of the viewport
          if (rect.bottom > window.innerHeight - 150) {
              lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }, 150);
  }, [currentLineIndex, stepIndex, isFinished, choices]);

  // Set up choices whenever we land on a "guess" step in level 1 or 2
  useEffect(() => {
    if (!mounted || !conversation || !isInteractive || isFinished) return;
    
    // In Level 1, every odd index is a "guess" step. In Level 2 and Level 3, every index is a "guess" step.
    const isGuessStep = isLevel1 ? (stepIndex % 2 !== 0) : true;
    
    if (stepIndex < conversation.dialogs.length && isGuessStep) {
      const correctDialog = conversation.dialogs[stepIndex];
      setHintsUsed({});
      
      if (isLevel1 || isLevel3) {
        // Find a hint word from the correct sentence
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const allSegmentsRaw = Array.from(segmenter.segment(correctDialog.th));
        const wordsInDialog = allSegmentsRaw.map(s => s.segment);
        const validWords = allWords.filter(w => wordsInDialog.includes(w.th) && w.th.length > 1);
        const hw = validWords.length > 0 ? validWords[Math.floor(Math.random() * validWords.length)] : null;
        setHintWord(hw);

        // Get all possible dialogs as distractor pool
        // Exclude the correct one
        const allDialogs = conversationsData.conversations.flatMap(c => c.dialogs);
        const distractors = allDialogs.filter(d => d.th !== correctDialog.th);
        
        const shuffledDistractors = shuffleArray(distractors).slice(0, 2); // get 2 random wrong options
        
        const computeSegmentsAndVisible = (text: string, isCorrect: boolean) => {
          const segs = Array.from(segmenter.segment(text)).map(s => s.segment);
          let visIdx = -1;
          if (isCorrect && hw) {
            visIdx = segs.findIndex(s => s === hw.th);
          } else {
             // pick a random word segment (length > 1) to remain visible for hint 4
             const wordIndices = segs.map((s, i) => s.length > 1 ? i : -1).filter(i => i !== -1);
             if (wordIndices.length > 0) visIdx = wordIndices[Math.floor(Math.random() * wordIndices.length)];
             else visIdx = Math.floor(Math.random() * segs.length);
          }
          return { segments: segs, visibleSegmentIndex: visIdx };
        };

        const correctData = computeSegmentsAndVisible(correctDialog.th, true);

        const options = [
          { id: 0, text: correctDialog.th, phonetic: correctDialog.phonetic, correct: true, segments: correctData.segments, visibleSegmentIndex: correctData.visibleSegmentIndex },
          ...shuffledDistractors.map((d, i) => {
            const dData = computeSegmentsAndVisible(d.th, false);
            return {
              id: i + 1,
              text: d.th,
              phonetic: d.phonetic,
              correct: false,
              segments: dData.segments,
              visibleSegmentIndex: dData.visibleSegmentIndex
             };
          })
        ];
        
        setChoices(shuffleArray(options));
        setSelectedChoiceId(null);
        setIsChoiceCorrect(null);
      } else if (isLevel2) {
        if (allWords.length === 0) return; // Wait until loaded
        
        // Extract real words using Intl.Segmenter
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const segments = Array.from(segmenter.segment(correctDialog.th));
        const wordsInDialog = segments.map(s => s.segment);
        
        const validWords = allWords.filter(w => wordsInDialog.includes(w.th) && w.th.length > 1);
        
        if (validWords.length > 0) {
          const target = validWords[Math.floor(Math.random() * validWords.length)];
          setTargetWord(target);
          
          const distractors = allWords.filter(w => w.th !== target.th);
          const shuffledDistractors = shuffleArray(distractors).slice(0, 2);
          
          const options = [
            { id: 0, text: target.th, translation: language === 'en' ? target.en : target.fr, phonetic: target.phonetic, correct: true },
            ...shuffledDistractors.map((d, i) => ({
              id: i + 1,
              text: d.th,
              translation: language === 'en' ? d.en : d.fr,
              phonetic: d.phonetic,
              correct: false
            }))
          ];
          
          setChoices(shuffleArray(options));
          setSelectedChoiceId(null);
          setIsChoiceCorrect(null);
        } else {
          setTargetWord(null);
          setChoices([]);
        }
      }
    }
  }, [stepIndex, mounted, conversation, isLevel1, isLevel2, isLevel3, isInteractive, isFinished, language, allWords]);

  // Handle auto-playing logic for Level 1 and Level 2 auto-skipping
  useEffect(() => {
    if (!mounted || !conversation || !isInteractive || isFinished || !hasStarted) return;
    
    const playCurrentStep = async () => {
      // Level 1 auto-plays even steps.
      if (isLevel1 && stepIndex < conversation.dialogs.length && stepIndex % 2 === 0) {
        setIsPlaying(true);
        setCurrentLineIndex(stepIndex);
        
        await playThaiTTSAsync(conversation.dialogs[stepIndex].th);
        
        setIsPlaying(false);
        // Advance to next step (which will be a guess step)
        if (mounted) {
          setStepIndex(s => s + 1);
        }
      } else if (isLevel2 && stepIndex < conversation.dialogs.length) {
        if (allWords.length === 0) return;
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const wordsInDialog = Array.from(segmenter.segment(conversation.dialogs[stepIndex].th)).map(s => s.segment);
        const validWords = allWords.filter(w => wordsInDialog.includes(w.th) && w.th.length > 1);
        
        if (validWords.length === 0) {
          setWarnings(prev => [...new Set([...prev, stepIndex])]);
          
          setIsPlaying(true);
          setCurrentLineIndex(stepIndex);
          
          await playThaiTTSAsync(conversation.dialogs[stepIndex].th);
          
          setIsPlaying(false);
          if (mounted) {
            setStepIndex(s => s + 1);
          }
        }
      } else if (stepIndex >= conversation.dialogs.length) {
        // Conversation fully built, finish without auto-replay
        setIsFinished(true);
        
        const isSuccess = !isInteractive || ((isLevel1 || isLevel2 || isLevel3) && stars >= 3);
        const isTrueSuccessLv3 = isLevel3 && stars >= 4;
        const passedInteractive = (isLevel1 && stars >= 3) || (isLevel2 && stars >= 3) || isTrueSuccessLv3;

        if (!isInteractive || passedInteractive) {
          addXp(10);
          let completionLvl = 0;
          if (isLevel1) completionLvl = 1;
          if (isLevel2) completionLvl = 2;
          if (isLevel3) completionLvl = 3;
          let earnedStars = isInteractive ? stars : 3;
          completeConversation(conversation.id, completionLvl, earnedStars);
        }
      }
    };
    
    playCurrentStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, hasStarted, isInteractive, mounted, allWords]);

  if (!mounted) return null;

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans text-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{language === 'en' ? 'Conversation not found' : 'Conversation introuvable'}</h2>
          <Link href="/conversations" className="text-orange-500 font-bold hover:underline">
            {language === 'en' ? 'Return to Conversations' : 'Retour aux Dialogues'}
          </Link>
        </div>
      </div>
    );
  }

  const startReviewPlayback = async () => {
    setIsPlaying(true);
    setCurrentLineIndex(0);
    isPlayingRef.current = true;
    
    for (let i = 0; i < conversation.dialogs.length; i++) {
      if (!isPlayingRef.current) break;
      setCurrentLineIndex(i);
      await playThaiTTSAsync(conversation.dialogs[i].th);
      
      // Small pause between lines
      if (isPlayingRef.current && i < conversation.dialogs.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    
    if (isPlayingRef.current) {
      setIsPlaying(false);
      setIsFinished(true);
      setCurrentLineIndex(conversation.dialogs.length);
      addXp(10);
      completeConversation(conversation.id, 0);
    }
  };

  const startNormalConversation = async () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsFinished(false);
    setCurrentLineIndex(0);
    isPlayingRef.current = true;
    
    for (let i = 0; i < conversation.dialogs.length; i++) {
      if (!isPlayingRef.current) break;
      setCurrentLineIndex(i);
      await playThaiTTSAsync(conversation.dialogs[i].th);
      
      if (isPlayingRef.current && i < conversation.dialogs.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    
    if (isPlayingRef.current) {
      setIsPlaying(false);
      setIsFinished(true);
      setCurrentLineIndex(conversation.dialogs.length);
      addXp(10);
      completeConversation(conversation.id, 0);
    }
  };

  const startInteraction = () => {
    if (isLevel1) {
      setHasStarted(true);
      setStepIndex(0);
    } else if (isLevel2) {
      setHasStarted(true);
      setStepIndex(0);
    } else if (isLevel3) {
      setHasStarted(true);
      setStepIndex(0);
    } else {
      startNormalConversation();
    }
  }

  const restartInteraction = () => {
    setStars(5);
    setIsFinished(false);
    setCurrentLineIndex(0);
    setStepIndex(0);
    setChoices([]);
    setHintsUsed({});
    setHintWord(null);
    setSelectedChoiceId(null);
    setIsChoiceCorrect(null);
    setIsPlaying(false);
    isPlayingRef.current = false;
  }

  const handleChoiceSelect = async (choice: any) => {
    if (isChoiceCorrect !== null) return; // Prevent multiple clicks
    
    setSelectedChoiceId(choice.id);
    setIsChoiceCorrect(choice.correct);
    
    if (choice.correct) {
      // Play the correct answer audio
      setIsPlaying(true);
      setCurrentLineIndex(stepIndex);
      
      const correctDialog = conversation!.dialogs[stepIndex];
      const textToPlay = (isLevel1 || isLevel3) ? choice.text : correctDialog.th;
      
      await playThaiTTSAsync(textToPlay);
      
      setIsPlaying(false);
      setStepIndex(s => s + 1);
    } else {
      setStars(s => Math.max(0, s - 1));
      // Play error sound or just reset after a short delay
      setTimeout(() => {
        setIsChoiceCorrect(null);
        setSelectedChoiceId(null);
      }, 1000);
    }
  };

  const attemptApplyHintCost = (hintNum: number) => {
    if (!hintsUsed[hintNum]) {
       const previouslyUsedHintCount = Object.keys(hintsUsed).length;
       setHintsUsed(prev => ({ ...prev, [hintNum]: true }));
       // Deduct a star for every 2 hints used (so when the count reaches 2, 4, etc.)
       const newCount = previouslyUsedHintCount + 1;
       if (newCount % 2 === 0) {
         setStars(s => Math.max(0, s - 1));
       }
    }
  };

  const isDataLoaded = mounted && !!conversation && (isLevel2 ? allWords.length > 0 : true);

  return (
    // We need pb-[350px] or more so that we can always scroll the last message to the top of the screen when the choices menu is open.
    <div className="min-h-[100dvh] bg-[#FAFAFA] font-sans text-slate-800 pb-[350px]">
      <AnimatePresence mode="wait">
        {!showExerciseUI ? (
          <LoadingScreen 
            key="loading-screen"
            isLoadingData={!isDataLoaded} 
            onReady={() => setShowExerciseUI(true)} 
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
        animate={{ y: showHeader ? 0 : '-100%' }}
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
                  width: `${Math.max(5, ((isLevel1 && !isFinished ? stepIndex : currentLineIndex) / conversation.dialogs.length) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
          {(isLevel1 || isLevel2 || isLevel3) && (
            <div className="flex items-center gap-1.5 z-10 relative">
               {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="relative w-6 h-6 flex items-center justify-center">
                    <Star size={24} className="fill-slate-200 text-slate-200 absolute inset-0" />
                    <AnimatePresence>
                      {i < stars ? (
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
                      {(lostStarAnimation && i === stars) ? (
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
                {language === 'en' && conversation.titleEn ? conversation.titleEn : conversation.title}
            </h1>
        </div>

        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center mt-8 gap-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
            {conversation.imageUrl ? (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <Image src={conversation.imageUrl} alt={conversation.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 36rem" priority />
              </div>
            ) : (
              <div className="bg-orange-100 text-orange-500 p-6 rounded-full">
                <MessageCircle size={48} />
              </div>
            )}
            <p className="text-center text-slate-600 font-medium">
              {isLevel1 
                ? (language === 'en' ? 'Complete the conversation by choosing the right responses.' : 'Complétez la conversation en choisissant les bonnes réponses.')
                : isLevel2
                  ? (language === 'en' ? 'Complete the sentences by choosing the correct missing word.' : 'Complétez les phrases en choisissant le bon mot manquant.')
                  : isLevel3
                    ? (language === 'en' ? 'Complete the sentences by choosing the correct phrase.' : 'Complétez les phrases en choisissant la bonne phrase.')
                    : (language === 'en' ? 'Listen to the conversation to understand the context.' : 'Écoutez la conversation pour comprendre le contexte.')
              }
            </p>
            <button 
              onClick={startInteraction}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl w-full border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Play size={24} className="fill-white" />
              {language === 'en' ? 'Start' : 'Démarrer'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-32">
            {conversation.dialogs.map((dialog, index) => {
              // Hide lines that haven't been reached yet
              const isVisible = isInteractive && !isFinished ? index <= stepIndex : index <= currentLineIndex || isFinished;
              if (!isVisible) return null;
              
              const speakerInfo = (speakersConfig as any)[dialog.speaker] || {
                name: dialog.speaker,
                avatar: '/deedee-no-bg.png',
                bubbleColor: 'bg-white border-slate-200 text-slate-800',
                position: dialog.speaker === 'Tom' ? 'right' : 'left'
              };
              
              const isRight = speakerInfo.position === 'right';
              
              // In Level 1, 2 and 3, if this is the current guess step, we show a waiting bubble or blank
              const isGuessingThisLine = !isFinished && index === stepIndex && 
                (isLevel3 || (isLevel2 && !warnings.includes(index)) || (isLevel1 && index % 2 !== 0));
              
              const isActive = (index === currentLineIndex && isPlaying);
              
              return (
                <div 
                  key={index} 
                  className={`message-bubble scroll-mt-20 flex w-full gap-3 py-1 ${isRight ? 'justify-end flex-row-reverse' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-6 flex flex-col items-center">
                     <Image 
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
                        (isLevel1 || isLevel3) ? (
                          <div className="flex items-center gap-1.5 py-2 px-1">
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <div className="text-2xl font-medium font-thai leading-relaxed">
                            {targetWord ? dialog.th.replace(targetWord.th, '______') : '______'}
                          </div>
                        )
                      ) : (
                        <div className="text-2xl font-medium font-thai leading-relaxed">
                          {dialog.th}
                        </div>
                      )}
                    </div>
                    
                    {/* Replay button next to the bubble during review mode */}
                    {isFinished && (
                      <button 
                         onClick={() => playThaiTTS(dialog.th)}
                         className={`absolute ${isRight ? '-left-12' : '-right-12'} top-6 p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors`}
                      >
                         <Volume2 size={24} />
                      </button>
                    )}
                    
                    {/* Phonetics and translation (shown when finished) */}
                    {(isFinished || (!isInteractive && index < currentLineIndex) || (isInteractive && index < stepIndex) || warnings.includes(index)) && !isGuessingThisLine && (
                      <div className={`px-2 flex flex-col gap-1 ${isRight ? 'text-right' : 'text-left'}`}>
                        {warnings.includes(index) && (
                          <span className="text-xs font-bold text-red-500 bg-red-50 p-1 rounded inline-block w-fit mb-1">
                            ⚠️ {language === 'en' ? 'No exact word found in course.json' : 'Aucun mot exact trouvé dans course.json'}
                          </span>
                        )}
                        {showRomanization && <span className="text-sm font-bold text-orange-500">{dialog.phonetic}</span>}
                        <span className="text-sm font-medium text-slate-500">
                          {language === 'en' ? dialog.en : dialog.fr}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={endOfMessagesRef} className={`transition-all ${choices.length > 0 ? 'h-[280px] sm:h-[320px]' : 'h-32 sm:h-48'}`} />
      </main>

      {/* Choices overlay for level 1, 2 and 3 */}
      {hasStarted && isInteractive && !isFinished && (isLevel2 || isLevel3 || stepIndex % 2 !== 0) && choices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:p-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-2xl mx-auto flex flex-col gap-1.5 sm:gap-2">
            {(isLevel1 || isLevel3) && hintWord && (
              <div className="w-full mb-2 bg-indigo-50/50 rounded-2xl p-2 sm:p-3 border border-indigo-100 flex flex-col items-center gap-2">
                 <div className="text-[11px] sm:text-xs font-bold text-indigo-800 flex items-center gap-1.5 text-center">
                    <Sparkles size={14} />
                    {language === 'en' ? 'Need a hint?' : 'Besoin d\'un indice ?'}
                 </div>
                 <div className="flex w-full overflow-x-auto pb-1 items-center justify-center gap-1.5 sm:gap-2 mt-0.5">
                     <button
                       onClick={() => {
                          attemptApplyHintCost(1);
                          playThaiTTS(hintWord.th);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${hintsUsed[1] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        <Volume2 size={16} /> 
                        <span className="hidden sm:inline">
                           {hintsUsed[1] ? (language === 'en' ? 'Replay' : 'Rejouer') : (language === 'en' ? 'Hint 1' : 'Indice 1')}
                        </span>
                     </button>

                     <button
                       onClick={() => {
                          attemptApplyHintCost(2);
                          setIsImageModalOpen(true);
                        }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 min-h-[36px] min-w-[70px] ${hintsUsed[2] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        <ImageIcon size={16} />
                        <span className="hidden sm:inline">{hintsUsed[2] ? (language === 'en' ? 'Image' : 'Image') : (language === 'en' ? 'Hint 2' : 'Indice 2')}</span>
                     </button>

                     <button
                       onClick={() => {
                          attemptApplyHintCost(3);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${hintsUsed[3] ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-indigo-100 border-indigo-200 text-indigo-500 hover:bg-indigo-200 hover:border-indigo-300'}`}
                     >
                        {!hintsUsed[3] && <Type size={16} />} 
                        {hintsUsed[3] ? <span>{language === 'en' ? hintWord.en : hintWord.fr}</span> : <span className="hidden sm:inline">{language === 'en' ? 'Hint 3' : 'Indice 3'}</span>}
                     </button>
                     
                     <button
                       onClick={() => {
                          attemptApplyHintCost(4);
                       }}
                       className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${hintsUsed[4] ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                       title={language === 'en' ? 'Highlight differences' : 'Surligner les différences'}
                     >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">
                           {hintsUsed[4] ? (language === 'en' ? 'Focus ON' : 'Focus ON') : (language === 'en' ? 'Hint 4' : 'Indice 4')}
                        </span>
                     </button>
                 </div>
              </div>
            )}
            <div className="flex items-end justify-between px-2 mb-0">
               <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {language === 'en' ? 'Choose the correct response:' : 'Choisissez la bonne réponse :'}
               </h3>
            </div>
            {choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrect = choice.correct;
              const isWrongStatus = isSelected && isChoiceCorrect === false;
              const isCorrectStatus = isSelected && isChoiceCorrect === true;
              
              let cardStyle = "bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800";
              if (isLevel2) cardStyle = "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800";
              if (isLevel3) cardStyle = "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800";
              
              if (isWrongStatus) {
                cardStyle = "bg-red-50 border-red-400 text-red-900";
              } else if (isCorrectStatus) {
                cardStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
              }

              // Hint 4 rendering
              const applyHint4 = hintsUsed[4] && choice.segments;
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={isChoiceCorrect !== null}
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
                  {isLevel1 && showRomanization && <div className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">{choice.phonetic}</div>}
                  {isLevel2 && <div className="text-xs sm:text-sm font-medium opacity-80 text-slate-500 mt-0.5">{choice.translation} {showRomanization ? `• ${choice.phonetic}` : ''}</div>}
                  {isLevel3 && showRomanization && <div className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">{choice.phonetic}</div>}
                  
                  {isWrongStatus && <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                  {isCorrectStatus && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer controls when finished */}
      {isFinished && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-2xl mx-auto flex gap-4">
            <Link
              href="/conversations"
              className="flex-none bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-4 rounded-2xl border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center"
            >
              <Home size={24} />
            </Link>
            {!isInteractive && (
              <button 
                onClick={startNormalConversation}
                className="flex-[1] bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl border-b-4 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={24} />
                <span className="hidden sm:inline">{language === 'en' ? 'Listen Again' : 'Réécouter'}</span>
              </button>
            )}
            {!isInteractive && (
              <Link 
                href={`/conversations/${conversation.id}?level=1`}
                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-orange-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
              >
                <span className="flex items-center gap-2">
                  {language === 'en' ? 'Start Level 1' : 'Passer au Niveau 1'}
                  <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                     <Star size={16} className="fill-white" />
                  </div>
                </span>
              </Link>
            )}
            
            {isInteractive && (() => {
              const passedLv12 = (isLevel1 || isLevel2) && stars >= 3;
              const passedLv3 = isLevel3 && stars >= 4;
              
              if (isLevel1) {
                if (passedLv12) {
                  return (
                    <Link 
                      href={`/conversations/${conversation.id}?level=2`}
                      className="flex-[2] bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-purple-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'en' ? 'Start Level 2' : 'Passer au Niveau 2'}
                        <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                           <Star size={16} className="fill-white" />
                        </div>
                      </span>
                    </Link>
                  );
                } else {
                  return (
                    <button 
                      onClick={restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 rounded-2xl border-b-4 border-slate-400 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center gap-2"
                    >
                      <RotateCcw size={20} />
                      {language === 'en' ? 'Retry' : 'Réessayer'} (Score: {stars} / ★★★)
                    </button>
                  );
                }
              } else if (isLevel2) {
                if (passedLv12) {
                  return (
                    <Link 
                      href={`/conversations/${conversation.id}?level=3`}
                      className="flex-[2] bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-purple-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center group"
                    >
                      <span className="flex items-center gap-2">
                        {language === 'en' ? 'Start Level 3' : 'Passer au Niveau 3'}
                        <div className="bg-white/20 group-hover:bg-white/30 rounded-full p-1 transition-colors">
                           <Star size={16} className="fill-white" />
                        </div>
                      </span>
                    </Link>
                  );
                } else {
                  return (
                    <button 
                      onClick={restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 rounded-2xl border-b-4 border-slate-400 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center gap-2"
                    >
                      <RotateCcw size={20} />
                      {language === 'en' ? 'Retry' : 'Réessayer'} (Score: {stars} / ★★★)
                    </button>
                  );
                }
              } else if (isLevel3) {
                if (passedLv3) {
                  return (
                    <Link 
                      href="/conversations"
                      className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-blue-700 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center gap-2"
                    >
                      <Check size={24} className="text-white" />
                      {language === 'en' ? 'Complete Level 3' : 'Terminer Niveau 3'}
                    </Link>
                  );
                } else {
                  return (
                    <button 
                      onClick={restartInteraction}
                      className="flex-[2] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-6 rounded-2xl border-b-4 border-slate-400 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center text-center gap-2"
                    >
                      <RotateCcw size={20} />
                      {language === 'en' ? 'Retry' : 'Réessayer'} (Score: {stars} / ★★★★)
                    </button>
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
      {isImageModalOpen && hintWord && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-48 h-48 relative mb-4 mt-2">
               <Image src={hintWord.imageUrl || `/images/w_w_${hintWord.id}.svg`} alt="Hint Image" fill className="object-contain" />
            </div>
            <p className="text-sm font-bold text-slate-400 mt-2">{language === 'en' ? 'Tap anywhere to close' : 'Appuyez n\'importe où pour fermer'}</p>
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

