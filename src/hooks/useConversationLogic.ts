import { useState, useEffect, useRef } from 'react';
import { Word } from '@/types';
import { getVocabularyServer } from '@/actions/course';
import { playThaiTTS, playThaiTTSAsync } from '@/lib/tts';
import conversationsData from '@/data/conversations.json';
import { getLocalizedField } from '@/hooks/useTranslation';

// Helper to shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function useConversationLogic(
  id: string | undefined | string[],
  level: string | null,
  completedLessons: string[],
  language: string,
  addXp: (amount: number) => void,
  completeConversation: (id: string, lvl: number, stars?: number) => void,
  searchParams: any
) {
  const isLevel1 = level === '1';
  const isLevel2 = level === '2';
  const isLevel3 = level === '3';
  const isInteractive = isLevel1 || isLevel2 || isLevel3;

  const conversationId = Array.isArray(id) ? id[0] : id;
  const conversation = conversationsData.conversations.find(c => c.id === conversationId);

  const [mounted, setMounted] = useState(false);
  const [allWords, setAllWords] = useState<Word[]>([]);
  
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
  const [stepIndex, setStepIndex] = useState(0); 
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isChoiceCorrect, setIsChoiceCorrect] = useState<boolean | null>(null);
  const [targetWord, setTargetWord] = useState<Word | null>(null); // For level 2
  const [warnings, setWarnings] = useState<number[]>([]);
  const [showExerciseUI, setShowExerciseUI] = useState(false);

  const isPlayingRef = useRef(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

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
    if (hasStarted && !isFinished) {
      setShowHeader(false);
    }
  }, [stepIndex, currentLineIndex, hasStarted, isFinished]);

  useEffect(() => {
    if (stars < prevStarsRef.current) {
      setLostStarAnimation(true);
      setShowHeader(true);
      setTimeout(() => setLostStarAnimation(false), 1200);
    }
    prevStarsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    setMounted(true);
    getVocabularyServer('all', completedLessons).then(words => {
      setAllWords(words as Word[]);
    });
    return () => {
      isPlayingRef.current = false;
    };
  }, [completedLessons]);

  useEffect(() => {
    setTimeout(() => {
      const messages = document.querySelectorAll('.message-bubble');
      if (messages.length > 0) {
        if (choices && choices.length > 0) {
          const targetIndex = Math.max(0, messages.length - 2);
          const yOffset = -70;
          const element = messages[targetIndex];
          if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
          }
        } else {
          const lastElement = messages[messages.length - 1];
          const rect = lastElement.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 150) {
              lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }, 150);
  }, [currentLineIndex, stepIndex, isFinished, choices]);

  useEffect(() => {
    if (!mounted || !conversation || !isInteractive || isFinished) return;
    
    const isGuessStep = isLevel1 ? (stepIndex % 2 !== 0) : true;
    
    if (stepIndex < conversation.dialogs.length && isGuessStep) {
      const correctDialog = conversation.dialogs[stepIndex];
      setHintsUsed({});
      
      if (isLevel1 || isLevel3) {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const allSegmentsRaw = Array.from(segmenter.segment(correctDialog.th));
        const wordsInDialog = allSegmentsRaw.map(s => s.segment);
        const validWords = allWords.filter(w => wordsInDialog.includes(w.th) && w.th.length > 1);
        const hw = validWords.length > 0 ? validWords[Math.floor(Math.random() * validWords.length)] : null;
        setHintWord(hw);

        const allDialogs = conversationsData.conversations.flatMap(c => c.dialogs);
        const distractors = allDialogs.filter(d => d.th !== correctDialog.th);
        
        const shuffledDistractors = shuffleArray(distractors).slice(0, 2);
        
        const computeSegmentsAndVisible = (text: string, isCorrect: boolean) => {
          const segs = Array.from(segmenter.segment(text)).map(s => s.segment);
          let visIdx = -1;
          if (isCorrect && hw) {
            visIdx = segs.findIndex(s => s === hw.th);
          } else {
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
        if (allWords.length === 0) return;
        
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
            { id: 0, text: target.th, translation: getLocalizedField(target, '', language), phonetic: target.phonetic, correct: true },
            ...shuffledDistractors.map((d, i) => ({
              id: i + 1,
              text: d.th,
              translation: getLocalizedField(d, '', language),
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

  useEffect(() => {
    if (!mounted || !conversation || !isInteractive || isFinished || !hasStarted) return;
    
    const playCurrentStep = async () => {
      if (isLevel1 && stepIndex < conversation.dialogs.length && stepIndex % 2 === 0) {
        setIsPlaying(true);
        setCurrentLineIndex(stepIndex);
        
        await playThaiTTSAsync(conversation.dialogs[stepIndex].th);
        
        setIsPlaying(false);
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

  useEffect(() => {
    if (searchParams.get("dev") === "validate" && conversation && !isFinished && mounted) {
      setIsFinished(true);
      hasStarted || setHasStarted(true);
      setCurrentLineIndex(conversation.dialogs.length);
      addXp(10);
      let completionLvl = 0;
      if (isLevel1) completionLvl = 1;
      if (isLevel2) completionLvl = 2;
      if (isLevel3) completionLvl = 3;
      completeConversation(conversation.id, completionLvl, 5);
    }
  }, [searchParams, conversation?.id, isFinished, isLevel1, isLevel2, isLevel3, mounted, addXp, completeConversation, hasStarted]);

  const startReviewPlayback = async () => {
    setIsPlaying(true);
    setCurrentLineIndex(0);
    isPlayingRef.current = true;
    
    for (let i = 0; i < conversation!.dialogs.length; i++) {
      if (!isPlayingRef.current) break;
      setCurrentLineIndex(i);
      await playThaiTTSAsync(conversation!.dialogs[i].th);
      
      if (isPlayingRef.current && i < conversation!.dialogs.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    
    if (isPlayingRef.current) {
      setIsPlaying(false);
      setIsFinished(true);
      setCurrentLineIndex(conversation!.dialogs.length);
      addXp(10);
      completeConversation(conversation!.id, 0);
    }
  };

  const startNormalConversation = async () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsFinished(false);
    setCurrentLineIndex(0);
    isPlayingRef.current = true;
    
    for (let i = 0; i < conversation!.dialogs.length; i++) {
      if (!isPlayingRef.current) break;
      setCurrentLineIndex(i);
      await playThaiTTSAsync(conversation!.dialogs[i].th);
      
      if (isPlayingRef.current && i < conversation!.dialogs.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    
    if (isPlayingRef.current) {
      setIsPlaying(false);
      setIsFinished(true);
      setCurrentLineIndex(conversation!.dialogs.length);
      addXp(10);
      completeConversation(conversation!.id, 0);
    }
  };

  const startInteraction = () => {
    if (isLevel1 || isLevel2 || isLevel3) {
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
    if (isChoiceCorrect !== null) return;
    
    setSelectedChoiceId(choice.id);
    setIsChoiceCorrect(choice.correct);
    
    if (choice.correct) {
      setIsPlaying(true);
      setCurrentLineIndex(stepIndex);
      
      const correctDialog = conversation!.dialogs[stepIndex];
      const textToPlay = (isLevel1 || isLevel3) ? choice.text : correctDialog.th;
      
      await playThaiTTSAsync(textToPlay);
      
      setIsPlaying(false);
      setStepIndex(s => s + 1);
    } else {
      setStars(s => Math.max(0, s - 1));
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
       const newCount = previouslyUsedHintCount + 1;
       if (newCount % 2 === 0) {
         setStars(s => Math.max(0, s - 1));
       }
    }
  };

  const isDataLoaded = mounted && !!conversation && (isLevel2 ? allWords.length > 0 : true);

  return {
    state: {
      mounted,
      allWords,
      conversation,
      isLevel1,
      isLevel2,
      isLevel3,
      isInteractive,
      currentLineIndex,
      isPlaying,
      isFinished,
      hasStarted,
      stars,
      hintsUsed,
      hintWord,
      isImageModalOpen,
      lostStarAnimation,
      showHeader,
      stepIndex,
      choices,
      selectedChoiceId,
      isChoiceCorrect,
      targetWord,
      warnings,
      showExerciseUI,
      isDataLoaded,
      endOfMessagesRef,
    },
    actions: {
      setIsImageModalOpen,
      setShowExerciseUI,
      startInteraction,
      startReviewPlayback,
      startNormalConversation,
      restartInteraction,
      handleChoiceSelect,
      attemptApplyHintCost,
    }
  };
}
