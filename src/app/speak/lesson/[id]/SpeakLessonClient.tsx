'use client';

import { getTranslation } from "@/hooks/useTranslation";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Word, Phrase } from "@/types";
import { ArrowLeft, Loader2, X, Star, Crown, BookOpen } from 'lucide-react';
import { SpeakingExercise } from "@/components/speak/SpeakingExercise";
import { SpeakConversationExercise, DialogueLine } from "@/components/speak/SpeakConversationExercise";
import { SpeakAnswerMeExercise } from "@/components/speak/SpeakAnswerMeExercise";
import { SpeakBuildPhraseExercise } from "@/components/speak/SpeakBuildPhraseExercise";
import { SpeakBuildByLettersExercise } from "@/components/speak/SpeakBuildByLettersExercise";
import SpeakResultScreen from './SpeakResultScreen';
import speakDialogues from "@/data/speak_dialogues.json";
import speakAnswerMe from "@/data/speak_answer_me.json";
import { Button } from "@/components/ui/Button";

const triggerConfetti = () => {
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  });
};

export default function SpeakLessonClient({ 
  lessonId, 
  level, 
  vocabulary, 
  dictionary,
  lessonTitle
}: { 
  lessonId: string, 
  level: number, 
  vocabulary: (Word | Phrase)[], 
  dictionary: Word[],
  lessonTitle: string 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const limitTo8 = mode === 'training' || mode === 'revision';
  
  const { language, completeSpeakLesson, addXp, getExpectedXp, inProgressLessons, saveInProgressLesson } = useProgressStore();
  
  // Base states
  const [mounted, setMounted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  
  // Level 1 specific states
  const [exercises, setExercises] = useState(limitTo8 ? vocabulary.slice(0, 8) : vocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  // Level 2 specific states
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
  const [totalScorePercentage, setTotalScorePercentage] = useState(0);
  
  // Level 3 specific states
  const [answerMeData, setAnswerMeData] = useState<any[]>([]);

  // Level 4 and 5 specific states
  const [level4Phrases, setLevel4Phrases] = useState<Phrase[]>([]);
  const [completedLevel4PhraseIds, setCompletedLevel4PhraseIds] = useState<string[]>([]);

  const isLevel2 = level === 2;
  const isLevel3 = level === 3;
  const isLevel4 = level === 4;
  const isLevel5 = level === 5;
  const storageKey = `speak_${lessonId}_lvl${level}`;

  useEffect(() => {
    if (mounted) return;

    if (isLevel2) {
      // Load dialogue from json
      const dialogData = (speakDialogues as any).dialogues[lessonId] || [];
      let populated = dialogData.map((d: any) => {
        const phraseData = vocabulary.find(v => v.id === d.phraseId) || dictionary.find(w => w.id === d.phraseId);
        return { ...d, phraseData };
      }).filter((d: any) => d.phraseData);
      if (limitTo8) populated = populated.slice(0, 8);
      setDialogue(populated);
      
      // Restore state if exists
      const savedState = inProgressLessons[storageKey];
      if (savedState) {
         setCurrentIndex(savedState.currentIndex || 0);
         setTotalScorePercentage(savedState.mistakes || 0);
      }
    } else if (isLevel3) {
      let answerData = (speakAnswerMe as any).exercises[lessonId] || [];
      if (limitTo8) answerData = answerData.slice(0, 8);
      const savedState = inProgressLessons[storageKey];
      if (savedState) {
         const currentExercises = (savedState.exercises && savedState.exercises.length > 0) 
            ? savedState.exercises 
            : answerData;
            
         if (savedState.currentIndex < currentExercises.length) {
            setAnswerMeData(currentExercises);
            setCurrentIndex(savedState.currentIndex || 0);
            setTotalScorePercentage(savedState.mistakes || 0);
         } else {
            setAnswerMeData(answerData);
            setCurrentIndex(0);
            setTotalScorePercentage(0);
            saveInProgressLesson(storageKey, null);
         }
      } else {
         setAnswerMeData(answerData);
      }
    } else if (isLevel4 || isLevel5) {
      let phrases = vocabulary.filter(v => 'components' in v) as Phrase[];
      if (limitTo8) phrases = phrases.slice(0, 8);
      setLevel4Phrases(phrases);
      
      const savedState = inProgressLessons[storageKey];
      if (savedState) {
         setCompletedLevel4PhraseIds(savedState.completedPhraseIds || []);
         setCurrentIndex(savedState.currentIndex || 0);
         setTotalScorePercentage(savedState.mistakes || 0);
         if (savedState.completedPhraseIds && savedState.completedPhraseIds.length > 0) {
            setShowResumePrompt(true);
         }
      }
    }
    setMounted(true);
  }, [mounted, isLevel2, isLevel3, isLevel4, isLevel5, lessonId, vocabulary, dictionary, inProgressLessons, storageKey]);

  const earnedStars = Math.max(0, 5 - Math.floor(mistakes / 2));

  const handleComplete = (finalEarnedXp: number, finalStars: number) => {
    setEarnedXp(finalEarnedXp);
    completeSpeakLesson(lessonId, finalEarnedXp, level - 1, finalStars);
    if (isLevel2 || isLevel3 || isLevel4 || isLevel5) {
       saveInProgressLesson(storageKey, null);
    }
    setIsFinished(true);
    triggerConfetti();
  };

  const handleNextLevel4And5 = (phraseId: string, mistakesCount: number, isAbandoned?: boolean) => {
    let newCompleted = completedLevel4PhraseIds;
    if (!isAbandoned) {
       newCompleted = [...completedLevel4PhraseIds, phraseId];
       setCompletedLevel4PhraseIds(newCompleted);
    }
    
    const newTotalMistakes = totalScorePercentage + mistakesCount;
    setTotalScorePercentage(newTotalMistakes);
    
    saveInProgressLesson(storageKey, {
       exercises: [],
       currentIndex: 0,
       timeLeft: null,
       initialTime: null,
       lastUpdated: Date.now(),
       completedPhraseIds: newCompleted,
       mistakes: newTotalMistakes
    });

    if (newCompleted.length >= 3 || newCompleted.length >= level4Phrases.length) {
       const earnedStars = Math.max(0, 5 - Math.floor(newTotalMistakes / 3));
       const expected = getExpectedXp(`speak_${lessonId}`, level - 1, false);
       handleComplete(isLevel5 ? 300 : (expected.xp || 150), earnedStars);
    }
  };

  const handleNextLevel1 = (isSuccess: boolean, isAbandoned?: boolean) => {
    if (isSuccess) {
      setSuccessCount(prev => prev + 1);
      addXp(3);
    } else if (!isAbandoned) {
      setExercises(prev => [...prev, prev[currentIndex]]);
    }
    
    const newLength = exercises.length + (isSuccess || isAbandoned ? 0 : 1);
    if (currentIndex + 1 < newLength) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const expected = getExpectedXp(`speak_${lessonId}`, level - 1, false);
      handleComplete(expected.xp || 50, earnedStars);
    }
  };

  const handleNextLevel2And3 = (isSuccess: boolean, isAbandoned?: boolean, partialScore: number = 0) => {
    const newTotalScore = totalScorePercentage + partialScore;
    setTotalScorePercentage(newTotalScore);
    
    let maxLen = isLevel2 ? dialogue.length : answerMeData.length;
    let newAnswerMeData = answerMeData;
    
    if (!isSuccess && !isAbandoned && isLevel3) {
      newAnswerMeData = [...answerMeData, answerMeData[currentIndex]];
      setAnswerMeData(newAnswerMeData);
      maxLen += 1;
    }
    
    if (currentIndex + 1 < maxLen) {
      setCurrentIndex(prev => prev + 1);
      saveInProgressLesson(storageKey, {
        exercises: isLevel3 ? newAnswerMeData : [],
        currentIndex: currentIndex + 1,
        mistakes: newTotalScore,
        timeLeft: null,
        initialTime: null,
        lastUpdated: Date.now()
      });
    } else {
      // Calculate final XP
      const maxPossibleXP = 100;
      const averagePercentage = newTotalScore / maxLen;
      const calculatedXp = Math.round((averagePercentage / 100) * maxPossibleXP);
      const finalStars = Math.round((averagePercentage / 100) * 5);
      
      handleComplete(calculatedXp, finalStars);
    }
  };

  const handleLoseStar = () => {
    setMistakes(prev => prev + 1);
  };

  const handleQuitEarly = () => {
    router.push('/speak#lesson-' + lessonId);
  };

  const handleResumeChoice = (resume: boolean) => {
    if (resume) {
      const savedState = inProgressLessons[storageKey];
      if (savedState) {
        if (isLevel2 || isLevel3) {
          setCurrentIndex(savedState.currentIndex || 0);
          setTotalScorePercentage(savedState.mistakes || 0);
          if (isLevel3 && savedState.exercises && savedState.exercises.length > 0) {
            setAnswerMeData(savedState.exercises);
          }
        } else if (isLevel4 || isLevel5) {
          setCompletedLevel4PhraseIds(savedState.completedPhraseIds || []);
          setCurrentIndex(savedState.currentIndex || 0);
          setTotalScorePercentage(savedState.mistakes || 0);
        }
      }
    } else {
      saveInProgressLesson(storageKey, null);
      if (isLevel2) {
         setCurrentIndex(0);
         setTotalScorePercentage(0);
      } else if (isLevel3) {
         const answerData = (speakAnswerMe as any).exercises[lessonId] || [];
         setAnswerMeData(answerData);
         setCurrentIndex(0);
         setTotalScorePercentage(0);
      } else if (isLevel4 || isLevel5) {
         setCompletedLevel4PhraseIds([]);
         setCurrentIndex(0);
         setTotalScorePercentage(0);
      }
    }
    setShowResumePrompt(false);
  };

  if (!mounted || (isLevel2 && dialogue.length === 0) || (isLevel3 && answerMeData.length === 0) || ((isLevel4 || isLevel5) && level4Phrases.length === 0)) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  const currentLength = isLevel4 || isLevel5 ? Math.min(3, level4Phrases.length) : isLevel3 ? answerMeData.length : isLevel2 ? dialogue.length : exercises.length;
  const progressPercent = isLevel4 || isLevel5 ? (completedLevel4PhraseIds.length / currentLength) * 100 : (currentLength > 0 ? (currentIndex / currentLength) * 100 : 0);

  if (showResumePrompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
          <BookOpen size={36} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
          {getTranslation('auto.resume_lesson', language) || "Reprendre la leçon ?"}
        </h2>
        <p className="text-slate-500 mb-10 text-base sm:text-lg max-w-[280px] mx-auto leading-relaxed font-medium">
          {getTranslation('auto.resume_lesson_desc', language) || "Vous avez une leçon en cours. Voulez-vous reprendre là où vous vous étiez arrêté ?"}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => handleResumeChoice(true)}
            size="lg"
            className="w-full bg-indigo-500 hover:bg-indigo-600 shadow-sm"
          >
            {getTranslation('auto.resume_button', language) || "Reprendre"}
          </Button>
          <Button
            onClick={() => handleResumeChoice(false)}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {getTranslation('auto.restart_button', language) || "Recommencer"}
          </Button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <SpeakResultScreen 
        lessonId={lessonId}
        currentLevel={level - 1}
        earnedStars={isLevel4 || isLevel5 ? Math.max(0, 5 - Math.floor(totalScorePercentage / 3)) : (isLevel2 || isLevel3 ? Math.round((totalScorePercentage / currentLength / 100) * 5) : earnedStars)}
        exercisesLength={currentLength}
        language={language}
        earnedXp={earnedXp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-6 w-full max-w-3xl mx-auto h-full px-4 flex-1">
          <button 
            onClick={() => setShowQuitConfirm(true)}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          <div className="flex font-bold text-slate-400 text-sm sm:text-base items-center shrink-0">
            {getTranslation('auto.lvl', language) || 'Niv.'} {level}
          </div>

          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden min-w-[2rem]">
            <div 
              className="bg-orange-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="font-bold text-slate-400 flex items-center gap-2 sm:gap-3 text-sm sm:text-base shrink-0">
            <div className="hidden sm:flex items-center gap-0.5 mr-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < (isLevel4 || isLevel5 ? Math.max(0, 5 - Math.floor(totalScorePercentage / 3)) : (isLevel2 || isLevel3 ? Math.round((totalScorePercentage / Math.max(1, currentIndex) / 100) * 5) : earnedStars))
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }
                />
              ))}
            </div>

            {level < 10 ? (
              <span className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-300"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
                {getTranslation('auto.lvl', language) || 'Niv.'} {level + 1}
              </span>
            ) : (
              <span className="flex items-center text-amber-500">
                <Crown size={18} className="fill-current stroke-[2.5]" />
              </span>
            )}

            <span className="bg-slate-100 text-slate-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-semibold shrink-0 ml-1 flex items-center gap-1.5 tabular-nums">
              {isLevel4 || isLevel5 ? completedLevel4PhraseIds.length : currentIndex} / {currentLength}
            </span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {isLevel4 ? (
          <SpeakBuildPhraseExercise
            phrases={level4Phrases}
            completedPhraseIds={completedLevel4PhraseIds}
            dictionary={dictionary}
            language={language}
            onCompletePhrase={handleNextLevel4And5}
            onLoseStar={() => setTotalScorePercentage(p => p + 2)}
          />
        ) : isLevel5 ? (
          <SpeakBuildByLettersExercise
            phrases={level4Phrases}
            completedPhraseIds={completedLevel4PhraseIds}
            language={language}
            onCompletePhrase={handleNextLevel4And5}
            onLoseStar={() => setTotalScorePercentage(p => p + 3)}
          />
        ) : isLevel3 ? (
          <SpeakAnswerMeExercise
            exercisesData={answerMeData}
            dictionary={dictionary}
            vocabulary={vocabulary}
            currentIndex={currentIndex}
            onNext={handleNextLevel2And3}
            language={language}
          />
        ) : isLevel2 ? (
          <SpeakConversationExercise
            dialogue={dialogue}
            dictionary={dictionary}
            currentIndex={currentIndex}
            onNext={handleNextLevel2And3}
          />
        ) : (
          <SpeakingExercise 
            vocabulary={exercises} 
            dictionary={dictionary} 
            currentIndex={currentIndex}
            onNext={handleNextLevel1} 
            onLoseStar={handleLoseStar}
          />
        )}
      </main>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <X size={32} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
              {getTranslation('auto.quit_lesson', language) || 'Quitter la leçon ?'}
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              {isLevel2 || isLevel3 || isLevel4
                ? (getTranslation('auto.your_progress_will_be_saved', language) || 'Votre progression est sauvegardée. Vous pourrez revenir à tout moment pour terminer cet exercice.')
                : (getTranslation('auto.your_progress_will_be_lost', language) || 'Votre progression sera perdue.')}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={handleQuitEarly}
                variant="danger"
                size="lg"
                className="w-full"
              >
                {getTranslation('auto.quit', language) || 'Quitter'}
              </Button>
              <Button 
                onClick={() => setShowQuitConfirm(false)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {getTranslation('auto.cancel', language) || 'Annuler'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
