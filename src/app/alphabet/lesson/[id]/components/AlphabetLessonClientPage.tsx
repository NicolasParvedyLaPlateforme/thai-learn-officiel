'use client';

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useProgressStore } from "@/lib/store";
import { getAlphabetLessons, AlphabetExercise, AlphabetLessonDef, formatCombiningChar } from "@/lib/alphabet-utils";
import { AlphabetItem } from "@/data/alphabet-data";
import { getAlphabetExercisesServer } from "@/actions/course";
import { X, Check, Star, Volume2, HelpCircle, Info, RotateCcw } from 'lucide-react';
import { playThaiTTS, preloadThaiVoices } from "@/lib/tts";
import { m as motion, AnimatePresence } from "motion/react";
import { ColoredPhonetic } from "@/components/learn/ColoredPhonetic";
import { AlphabetCard } from "@/components/alphabet/AlphabetCard";
import { Suspense } from 'react';
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import HeaderProgressBar from "@/components/lesson/HeaderProgressBar";
import Footer from "@/components/lesson/Footer";
import { useLessonEngine } from '@/hooks/useLessonEngine';

const triggerConfetti = () => {
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  });
};

function AlphabetLessonContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeLesson, lessonLevels, language, seenAlphabets, markAlphabetSeen, completedLessons, unlockedLessons, _hasHydrated, setLastPlayedLesson } = useProgressStore(
    useShallow(state => ({
      completeLesson: state.completeLesson,
      lessonLevels: state.lessonLevels,
      language: state.language,
      seenAlphabets: state.seenAlphabets,
      markAlphabetSeen: state.markAlphabetSeen,
      completedLessons: state.completedLessons,
      unlockedLessons: state.unlockedLessons,
      _hasHydrated: state._hasHydrated,
      setLastPlayedLesson: state.setLastPlayedLesson
    }))
  );

  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get('level');
  const isDev = searchParams.has('dev');

  // Resolve lesson
  const { consonants, vowels } = getAlphabetLessons();
  const allLessons = [...consonants, ...vowels];
  const lesson = allLessons.find(l => l.id === lessonId);
  const savedLevel = lesson ? (lessonLevels[lesson.id] || 0) : 0;

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{ id: string, level: number } | null>(null);

  const currentLevel = requestedLevelStr ? (isDev ? Math.max(0, parseInt(requestedLevelStr, 10) - 1) : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))) : (exercisesGeneratedFor?.level !== undefined ? exercisesGeneratedFor.level : savedLevel);

  const [initialExercises, setInitialExercises] = useState<AlphabetExercise[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const {
    exercises,
    currentExercise,
    currentIndex,
    progress,
    isChecking,
    isCorrect,
    isFinished,
    mistakes,
    selectedAnswer: selectedOption,
    setSelectedAnswer: setSelectedOption,
    handleCheck,
  } = useLessonEngine<AlphabetExercise, AlphabetItem>({
    initialExercises,
    isExerciseIntroOrReview: (ex) => ex.type === 'intro' || ex.type === 'review',
    evaluateAnswer: (ex, ans) => ans?.letter === ex.letterToPick,
    onComplete: (totalMistakes) => {
      if (lesson) {
        const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, false);
        setEarnedXp(expected.xp);
        const earnedStarsLocal = Math.max(0, 5 - totalMistakes);
        completeLesson(lesson.id, 0, currentLevel, earnedStarsLocal, false);
      }
      triggerConfetti();
    },
    onCorrect: (ex) => {
      if (ex.type === 'intro' && !seenAlphabets.includes(ex.item.letter)) {
        markAlphabetSeen(ex.item.letter);
      } else if (ex.type !== 'intro') {
        if (ex.type === 'phonetic-match' || ex.type === 'audio-match') {
          playThaiTTS(ex.item.exampleWord);
        } else {
          playThaiTTS(ex.targetText);
        }
      }
    },
    onIncorrect: () => {
      if (lesson) setLastPlayedLesson(lesson.id, "alphabet");
    },
    onExerciseChange: () => {
      setShowHint(false);
    }
  });

  const earnedStars = Math.max(0, 5 - mistakes);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (exercises.length > 0 && exercises[currentIndex]) {
      const ex = exercises[currentIndex];
      if (ex.type === 'audio-match') {
        // slight delay to let render happen
        const t = setTimeout(() => {
          playThaiTTS(ex.item.exampleWord);
        }, 300);
        return () => clearTimeout(t);
      }
    }
  }, [currentIndex, exercises]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!lesson) {
      router.push('/alphabet');
      return;
    }

    if (!exercisesGeneratedFor || exercisesGeneratedFor.id !== lesson.id || exercisesGeneratedFor.level !== currentLevel) {
      const { consonants, vowels } = getAlphabetLessons();
      let unitLessons = consonants;
      let lessonIndex = consonants.findIndex(l => l.id === lesson.id);
      if (lessonIndex === -1) {
        unitLessons = vowels;
        lessonIndex = vowels.findIndex(l => l.id === lesson.id);
      }

      const isDevLocal = new URLSearchParams(window.location.search).has('dev');
      // All lessons are now horizontally unlocked
      // const isUnlocked = isDevLocal || lessonIndex === 0 || (lessonIndex > 0 && completedLessons.includes(unitLessons[lessonIndex - 1].id)) || unlockedLessons?.includes(lessonId);

      // if (!isUnlocked) {
      //   router.push('/alphabet');
      //   return;
      // }

      preloadThaiVoices();
      getAlphabetExercisesServer(lesson.id, currentLevel, language).then(generated => {
        setInitialExercises(generated as unknown as AlphabetExercise[]);
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel });
      });
    }
  }, [lesson, router, currentLevel, language, completedLessons, _hasHydrated, lessonId, unlockedLessons, exercisesGeneratedFor]);

  useEffect(() => {
    if (searchParams.get("dev") === "validate" && exercises.length > 0 && !isFinished) {
      if (lesson) {
        const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, false);
        setEarnedXp(expected.xp);
        completeLesson(lesson.id, 0, currentLevel, 3, false);
      }
      triggerConfetti();
    }
  }, [searchParams, exercises.length, isFinished, lesson?.id, currentLevel, completeLesson]);

  const isDataLoaded = isClient && _hasHydrated && !!lesson && exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Need this block to prevent early access
  }

  const getOptionColorClass = (opt: AlphabetItem, isSelected: boolean, isCorrectState: boolean | null) => {
    if (isSelected) {
      if (isCorrectState === true) return 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md';
      if (isCorrectState === false) return 'border-rose-500 bg-rose-50 text-rose-600 shadow-md';
      return 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm';
    }
    if (opt.type === 'vowel') return 'border-purple-200 bg-white text-purple-600 hover:bg-purple-50';
    switch (opt.consonantClass) {
      case 'low': return 'border-blue-200 bg-white text-blue-500 hover:bg-blue-50';
      case 'mid': return 'border-teal-200 bg-white text-teal-600 hover:bg-teal-50';
      case 'high': return 'border-orange-200 bg-white text-orange-500 hover:bg-orange-50';
      default: return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
    }
  };

  if (isFinished) {
    const isLastConsonant = lesson && consonants.length > 0 && lesson.id === consonants[consonants.length - 1].id;
    const isLastVowel = lesson && vowels.length > 0 && lesson.id === vowels[vowels.length - 1].id;
    const isEndOfUnit = isLastConsonant || isLastVowel;
    const nextUnitIndex = isLastConsonant ? 1 : -1;
    
    const { unopenedGifts } = useProgressStore.getState();

    const handleNavigate = (nextUrl: string, nextLabel: string) => {
      const giftsAvailable = unopenedGifts?.alphabet || 0;
      if (giftsAvailable > 0) {
        const replayUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        router.push(`/reward?category=alphabet&nextUrl=${encodeURIComponent(nextUrl)}&nextLabel=${encodeURIComponent(nextLabel)}&replayUrl=${encodeURIComponent(replayUrl)}`);
      } else {
        router.push(nextUrl);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <div className="text-emerald-500 mb-2">
          <Check size={80} className="mx-auto" />
        </div>
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
            >
              <Star
                size={48}
                className={
                  i < earnedStars
                    ? "fill-amber-400 text-amber-500"
                    : "fill-slate-200 text-slate-300 drop-shadow-sm"
                }
              />
            </motion.div>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
          {language === 'en' ? `Level ${currentLevel + 1} completed!` : `Niveau ${currentLevel + 1} terminé !`}
        </h1>
        <p className="text-slate-500 mb-4 text-center text-lg font-medium">+ {earnedXp || 15} XP</p>

        <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <DailyQuestsWidget category="alphabet" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {isEndOfUnit && nextUnitIndex !== -1 && (
            <button
              onClick={() => handleNavigate(`/alphabet?unit=${nextUnitIndex}`, getTranslation('auto.next_unit', language))}
              className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              {getTranslation('auto.next_unit', language)}
            </button>
          )}
          {currentLevel + 1 < 4 && (
            <button
              onClick={() => handleNavigate(`/alphabet/lesson/${lesson?.id}?level=${currentLevel + 2}`, getTranslation('auto.next_level', language))}
              className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
            >
              {getTranslation('auto.next_level', language)}
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            {getTranslation('auto.retry', language)}
          </button>
          <button
            onClick={() => router.push(`/alphabet`)}
            className="px-8 py-3 flex-1 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {getTranslation('auto.back', language)}
          </button>
        </div>
      </div>
    );
  }

  const showFooter = isChecking || (currentExercise && (currentExercise.type === 'intro' || currentExercise.type === 'review')) || selectedOption !== null;

  const renderExerciseContent = () => {
    if (!currentExercise) return null;
    if (currentExercise.type === 'intro') {
      return (
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            {getTranslation('auto.new_letter', language)}
          </h1>
          <AlphabetCard item={currentExercise.item} onPlayAudio={() => playThaiTTS(currentExercise.item.exampleWord)} />
          <div className="mt-8 space-y-4 text-center">
            <p className="text-2xl font-bold text-slate-800"><ColoredPhonetic phonetic={currentExercise.phonetic} /></p>
            <div className="text-xl text-slate-600">
              <span className="font-bold font-thai text-indigo-600">{currentExercise.targetText}</span>
              <span className="opacity-75"> ({currentExercise.targetTranslation})</span>
            </div>
          </div>
        </div>
      );
    }

    if (currentExercise.type === 'review') {
      return (
        <div className="flex-1 flex flex-col items-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12">
            {getTranslation('auto.review_these_letters', language)}
          </h1>
          <div className="flex gap-4 sm:gap-8 justify-center flex-wrap">
            {currentExercise.options.map(item => (
              <div key={item.letter} className="flex flex-col items-center gap-4">
                <AlphabetCard item={item} onPlayAudio={() => playThaiTTS(item.exampleWord)} minimal={true} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentExercise.type === 'phonetic-match') {
      return (
        <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
            {getTranslation('auto.which_letter_matches_this_soun', language)}
          </h2>

          <div className="flex items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 mb-10 w-full justify-center text-center flex-col">
            <div className="text-4xl md:text-5xl font-bold text-indigo-600 flex items-center flex-wrap justify-center font-sans tracking-wide">
              <ColoredPhonetic phonetic={currentExercise.phonetic} />
            </div>
          </div>

          <div className={`w-full grid gap-3 md:gap-4 ${currentExercise.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {currentExercise.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (isCorrect === null) {
                    setSelectedOption(opt);
                    playThaiTTS(opt.exampleWord);
                    handleCheck(opt);
                  }
                }}
                className={`
                  aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden p-2 md:p-3
                  group
                  ${isCorrect !== null ? 'cursor-default' : 'hover:-translate-y-1 cursor-pointer active:scale-95 shadow-sm hover:shadow-md'}
                  ${getOptionColorClass(opt, selectedOption?.letter === opt.letter, isCorrect)}
                `}
              >
                <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-2 md:mt-4">
                  <span className="text-4xl md:text-6xl font-medium z-10 drop-shadow-sm font-thai">{formatCombiningChar(opt.letter)}</span>
                </div>

                {(opt.mnemonicHintEn || opt.mnemonicHintFr) && (
                  <span className="w-full text-center text-[10px] md:text-xs leading-tight px-0.5 opacity-90 font-semibold mt-1 md:mt-2 mb-1 hidden sm:block">
                    {getLocalizedField(opt, 'mnemonicHint', language)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentExercise.type === 'audio-match') {
      return (
        <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
            {getTranslation('auto.listen_and_select_the_correct', language)}
          </h2>

          <div className="flex items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 mb-10 w-full justify-center text-center flex-col">
            <button
              onClick={() => playThaiTTS(currentExercise.item.exampleWord)}
              className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-sky-400"
            >
              <Volume2 size={48} />
            </button>
          </div>

          <div className={`w-full grid gap-3 md:gap-4 ${currentExercise.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {currentExercise.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (isCorrect === null) {
                    setSelectedOption(opt);
                    playThaiTTS(opt.exampleWord);
                    handleCheck(opt);
                  }
                }}
                className={`
                  aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden p-2 md:p-3
                  group
                  ${isCorrect !== null ? 'cursor-default' : 'hover:-translate-y-1 cursor-pointer active:scale-95 shadow-sm hover:shadow-md'}
                  ${getOptionColorClass(opt, selectedOption?.letter === opt.letter, isCorrect)}
                `}
              >
                <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-2 md:mt-4">
                  <span className="text-4xl md:text-6xl font-medium z-10 drop-shadow-sm font-thai">{formatCombiningChar(opt.letter)}</span>
                </div>

                {(opt.mnemonicHintEn || opt.mnemonicHintFr) && (
                  <span className="w-full text-center text-[10px] md:text-xs leading-tight px-0.5 opacity-90 font-semibold mt-1 md:mt-2 mb-1 hidden sm:block">
                    {language === 'en' ? opt.mnemonicHintEn : opt.mnemonicHintFr}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Replace the specific letter with a blank in the targetText
    let maskedText = currentExercise.targetText;
    const blank = <div className="inline-flex w-12 h-14 md:w-16 md:h-20 border-b-4 border-slate-300 items-center justify-center text-indigo-500 pb-2 mx-1 vertical-align-bottom">
      {selectedOption ? formatCombiningChar(selectedOption.letter) : ''}
    </div>;

    // Split to find the exact letter. We only replace the FIRST occurrence for simplicity, 
    // or all occurrences if they represent the same choice. Usually, it's just one occurrence in Thai.
    const parts = currentExercise.targetText.split(currentExercise.letterToPick);

    return (
      <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
          {getTranslation('auto.find_the_correct_letter', language)}
        </h2>

        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-10 w-full justify-center text-center flex-col">
          <div className="text-3xl md:text-4xl font-medium text-slate-800 flex items-center flex-wrap justify-center font-thai leading-relaxed">
            {parts.map((part, i) => (
              <span key={i} className="flex items-center">
                {part}
                {i < parts.length - 1 && blank}
              </span>
            ))}
            <button
              onClick={() => playThaiTTS(currentExercise.targetText)}
              className="ml-4 p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
            >
              <Volume2 size={24} />
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center w-full">
            <div className="text-slate-500 font-medium text-lg flex items-center justify-center gap-2 flex-wrap">
              <ColoredPhonetic phonetic={currentExercise.phonetic} />
              <span>— {currentExercise.targetTranslation}</span>
              <button
                onClick={() => setShowHint(!showHint)}
                className={`ml-1 md:ml-2 p-1.5 rounded-full transition-colors ${showHint ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100'}`}
                title={getTranslation('auto.show_hint_24', language)}
              >
                <HelpCircle size={20} />
              </button>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full mt-3 flex justify-center"
                >
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 md:p-4 text-sm md:text-base text-indigo-800 text-left flex items-start gap-3 max-w-sm">
                    <Info size={18} className="shrink-0 mt-0.5 text-indigo-500" />
                    {currentExercise.explanation ? (
                      <p className="leading-relaxed">{currentExercise.explanation}</p>
                    ) : (
                      <div className="leading-relaxed flex flex-col gap-1.5">
                        <p>
                          {getTranslation('auto.hint_the_letter_is_called', language)}
                          <span className="font-bold font-thai text-lg">{currentExercise.item.exampleWord}</span>
                          <span className="opacity-80"> ({currentExercise.item.pronunciation})</span>.
                        </p>
                        {(currentExercise.item.mnemonicHintEn || currentExercise.item.mnemonicHintFr) && (
                          <p className="text-sm border-l-2 border-indigo-200 pl-2 opacity-90">
                            {getTranslation('alphabet.think_mnemonic', language).replace('{0}', getLocalizedField(currentExercise.item, 'mnemonicHint', language))}
                          </p>
                        )}
                        {currentExercise.item.type === 'vowel' && (
                          <p className="text-sm mt-1 bg-indigo-100/50 p-2 rounded">
                            {getTranslation('auto.tip_a_double_letter_in_the_pr', language)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={`w-full grid gap-3 md:gap-4 ${currentExercise.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {currentExercise.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (isCorrect === null) {
                  setSelectedOption(opt);
                  playThaiTTS(opt.exampleWord);
                  handleCheck(opt);
                }
              }}
              className={`
                aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden p-2 md:p-3
                group
                ${isCorrect !== null ? 'cursor-default' : 'hover:-translate-y-1 cursor-pointer active:scale-95 shadow-sm hover:shadow-md'}
                ${getOptionColorClass(opt, selectedOption?.letter === opt.letter, isCorrect)}
              `}
            >
              <div className="relative flex-1 flex flex-col items-center justify-center w-full mt-2 md:mt-4">
                <span className="text-4xl md:text-6xl font-medium z-10 drop-shadow-sm font-thai">{formatCombiningChar(opt.letter)}</span>
              </div>

              {(opt.mnemonicHintEn || opt.mnemonicHintFr) && (
                <span className="w-full text-center text-[10px] md:text-xs leading-tight px-0.5 opacity-90 font-semibold mt-1 md:mt-2 mb-1 hidden sm:block">
                  {language === 'en' ? opt.mnemonicHintEn : opt.mnemonicHintFr}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FAFAFA] font-sans text-slate-800 overflow-hidden relative">
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
            {/* Header */}
            <HeaderProgressBar
              lessonId={lesson?.id || ""}
              language={language}
              currentLevel={currentLevel}
              progress={progress}
              earnedStars={earnedStars}
              currentIndex={currentIndex}
              exercisesLength={exercises.length}
              currentExercise={undefined}
              returnUrl={`/alphabet#lesson-${lesson?.id}`}
            />

            {/* Main Exercise Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col py-6 md:py-12 px-4 w-full relative">
              <div className="w-full max-w-3xl mx-auto flex flex-col justify-center flex-1">
                {currentExercise && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentExercise.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex-1 flex flex-col"
                    >
                      {renderExerciseContent()}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </main>

            {/* Footer Actions */}
            <Footer
              currentExercise={currentExercise as any}
              isChecking={isChecking}
              isCorrect={isCorrect}
              language={language}
              selectedAnswer={selectedOption?.letter || null}
              showFooter={showFooter}
              handleCheck={handleCheck}
              customCorrectAnswer={
                <div className="font-medium font-thai text-xl md:text-2xl mt-1 sm:mt-0">
                  {currentExercise ? formatCombiningChar(currentExercise.letterToPick!) : ""}
                </div>
              }
              disableCheck={
                !!(currentExercise && currentExercise.type !== 'intro' && currentExercise.type !== 'review' && !isChecking && !selectedOption)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlphabetLessonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center min-h-screen bg-[#FAFAFA]">Loading...</div>}>
      <AlphabetLessonContent />
    </Suspense>
  );
}
