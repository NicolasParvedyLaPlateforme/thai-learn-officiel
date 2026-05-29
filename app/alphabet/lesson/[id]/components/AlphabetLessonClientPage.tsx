'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useProgressStore } from '../../../../lib/store';
import { getAlphabetLessons, AlphabetExercise, AlphabetLessonDef, formatCombiningChar } from '../../../../lib/alphabet-utils';
import { AlphabetItem } from '../../../../lib/alphabet-data';
import { getAlphabetExercisesServer } from '../../../../actions/course';
import { X, Check, Star, Volume2, HelpCircle, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playThaiTTS, preloadThaiVoices } from '../../../../lib/tts';
import { motion, AnimatePresence } from 'motion/react';
import { ColoredPhonetic } from '../../../../components/ColoredPhonetic';
import { AlphabetCard } from '../../../../components/AlphabetCard';
import { Suspense } from 'react';
import { LoadingScreen } from "../../../../components/LoadingScreen";

function AlphabetLessonContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeLesson, lessonLevels, language, seenAlphabets, markAlphabetSeen, completedLessons, unlockedLessons, _hasHydrated, setLastPlayedLesson } = useProgressStore();
  
  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get('level');
  const isDev = searchParams.has('dev');
  
  // Resolve lesson
  const { consonants, vowels } = getAlphabetLessons();
  const allLessons = [...consonants, ...vowels];
  const lesson = allLessons.find(l => l.id === lessonId);
  const savedLevel = lesson ? (lessonLevels[lesson.id] || 0) : 0;
  
  const currentLevel = requestedLevelStr ? (isDev ? Math.max(0, parseInt(requestedLevelStr, 10) - 1) : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))) : savedLevel;
  
  const [exercises, setExercises] = useState<AlphabetExercise[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interaction State
  const [selectedOption, setSelectedOption] = useState<AlphabetItem | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{ id: string, level: number } | null>(null);

  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const earnedStars = mistakes < 2 ? 3 : mistakes < 4 ? 2 : 1;

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
        setExercises(generated as unknown as AlphabetExercise[]);
        setCurrentIndex(0);
        setIsFinished(false);
        setIsChecking(false);
        setIsCorrect(null);
        setSelectedOption(null);
        setShowHint(false);
        setMistakes(0);
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel });
      });
    }
  }, [lesson, router, currentLevel, language, completedLessons, _hasHydrated, lessonId, unlockedLessons, exercisesGeneratedFor]);

  const isDataLoaded = isClient && _hasHydrated && !!lesson && exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Need this block to prevent early access
  }

  const currentExercise = exercises.length > 0 ? exercises[currentIndex] : null;
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  const handleCheck = (overrideOpt?: any) => {
    if (!currentExercise) return;
    // If it's intro or review phase, just proceed
    if (currentExercise.type === 'intro' || currentExercise.type === 'review') {
       if (currentExercise.type === 'intro' && !seenAlphabets.includes(currentExercise.item.letter)) {
         markAlphabetSeen(currentExercise.item.letter);
       }
       proceedToNext();
       return;
    }

    if (isChecking) {
      if (isCorrect) {
        proceedToNext(exercises.length);
      } else {
        // Retry logic: Add at the end of the queue with a new ID for animations
        // eslint-disable-next-line react-hooks/purity
        const retryExercise = { ...currentExercise, id: currentExercise.id + '-retry-' + Date.now() };
        setExercises(prev => [...prev, retryExercise]);
        proceedToNext(exercises.length + 1);
      }
      return;
    }

    // Validate
    const optionToCheck = overrideOpt || selectedOption;
    if (!optionToCheck) return;
    
    const correct = optionToCheck.letter === currentExercise.letterToPick;
    
    setIsCorrect(correct);
    setIsChecking(true);
    if(correct) {
       if (currentExercise.type === 'phonetic-match' || currentExercise.type === 'audio-match') {
         playThaiTTS(currentExercise.item.exampleWord);
       } else {
         playThaiTTS(currentExercise.targetText);
       }
    } else {
       setMistakes(prev => prev + 1);
       if (lesson) setLastPlayedLesson(lesson.id, "alphabet");
    }
  };

  const proceedToNext = (targetLength: number = exercises.length) => {
    if (currentIndex < targetLength - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsChecking(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      setIsFinished(true);
      if (lesson) completeLesson(lesson.id, 15, currentLevel, earnedStars);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }});
    }
  };

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

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <div className="text-orange-500 mb-6">
          <Check size={120} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">
          {language === 'en' ? `Level ${currentLevel + 1} completed!` : `Niveau ${currentLevel + 1} terminé !`}
        </h1>
        <p className="text-slate-500 mb-8 text-center text-lg font-medium">+ 15 XP</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {isEndOfUnit && nextUnitIndex !== -1 && (
             <button 
               onClick={() => router.push(`/alphabet?unit=${nextUnitIndex}`)}
               className="px-8 py-3 flex-1 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-bold text-lg shadow-lg hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all text-center"
             >
               {language === 'en' ? 'Next Unit' : 'Aller à l\'unité suivante'}
             </button>
          )}
          {currentLevel + 1 < 4 && (
            <button 
              onClick={() => router.push(`/alphabet/lesson/${lesson?.id}?level=${currentLevel + 2}`)}
              className="px-8 py-3 flex-1 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
            >
              {language === 'en' ? 'Next Level' : 'Prochain Niveau'}
            </button>
          )}
          <button 
            onClick={() => router.push(`/alphabet#lesson-${lesson?.id}`)}
            className="px-8 py-3 flex-1 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-center"
          >
            {language === 'en' ? 'Back' : 'Retour'}
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
            {language === 'en' ? 'New letter!' : 'Nouvelle lettre !'}
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
            {language === 'en' ? 'Review these letters' : 'Revoyons ces lettres'}
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
            {language === 'en' ? 'Which letter matches this sound?' : 'Quelle lettre correspond à ce son ?'}
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
                    {language === 'en' ? opt.mnemonicHintEn : opt.mnemonicHintFr}
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
            {language === 'en' ? 'Listen and select the correct letter' : 'Écoutez et sélectionnez la bonne lettre'}
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
          {language === 'en' ? 'Find the correct letter' : 'Trouvez la bonne lettre'}
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
                 title={language === 'en' ? "Show hint" : "Afficher l'indice"}
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
                           {language === 'en' 
                             ? `Hint: The letter is called `
                             : `Indice : La lettre s'appelle `}
                           <span className="font-bold font-thai text-lg">{currentExercise.item.exampleWord}</span> 
                           <span className="opacity-80"> ({currentExercise.item.pronunciation})</span>.
                         </p>
                         {(currentExercise.item.mnemonicHintEn || currentExercise.item.mnemonicHintFr) && (
                           <p className="text-sm border-l-2 border-indigo-200 pl-2 opacity-90">
                             {language === 'en' 
                               ? `Think of the visual mnemonic: "${currentExercise.item.mnemonicHintEn}".` 
                               : `Pensez au moyen mnémotechnique : "${currentExercise.item.mnemonicHintFr}".`}
                           </p>
                         )}
                         {currentExercise.item.type === 'vowel' && (
                           <p className="text-sm mt-1 bg-indigo-100/50 p-2 rounded">
                             {language === 'en'
                               ? "💡 Tip: A double letter in the pronunciation (like 'aa' or 'ii') means it's a long vowel, while a single letter means a short vowel."
                               : "💡 Astuce : Une double voyelle dans la transcription (comme 'aa' ou 'ii') indique que c'est une voyelle longue. Une lettre simple (comme 'a' ou 'i') indique une voyelle courte."}
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
      <header className="h-16 px-4 md:px-8 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 md:gap-6 w-full max-w-4xl mx-auto flex-1">
          <button onClick={() => router.push(`/alphabet#lesson-${lesson?.id}`)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="font-bold text-slate-400 flex items-center gap-3">
             {lesson?.type === 'consonant' 
                ? (language === 'en' ? 'Consonants' : 'Consonnes')
                : (language === 'en' ? 'Vowels' : 'Voyelles')}
          </div>
        </div>
      </header>

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
      <>
        <div className="shrink-0 min-h-[100px] md:min-h-[128px] w-full bg-transparent"></div>
        {(() => {
          if (!currentExercise) return false;
          if (!isChecking && currentExercise.type !== 'intro' && currentExercise.type !== 'review') {
             return false;
          }
          return true;
        })() && currentExercise && (
        <AnimatePresence>
          {showFooter && (
            <motion.footer 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`absolute bottom-0 left-0 right-0 w-full min-h-[100px] md:min-h-[128px] py-4 md:py-0 border-t-2 items-center justify-center px-4 md:px-8 flex transition-colors duration-300 z-50 ${isChecking ? (isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200 shadow-[0_-10px_40px_rgba(244,63,94,0.1)]') : 'bg-white border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}
            >
              <div className="w-full max-w-4xl flex sm:flex-row flex-col items-center justify-between gap-4">
              
              <div className="flex-1 w-full text-center sm:text-left">
                {isChecking && isCorrect && (
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-emerald-600 font-extrabold text-xl">
                    <div className="bg-white text-emerald-500 rounded-full p-1"><Check size={24} strokeWidth={3} /></div>
                    {language === 'en' ? 'Excellent!' : 'Excellent !'}
                  </div>
                )}
                {isChecking && !isCorrect && (
                  <div className="flex flex-col text-rose-600 font-extrabold text-xl gap-1 items-center sm:items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-white text-rose-500 rounded-full p-1"><X size={24} strokeWidth={3} /></div>
                      {language === 'en' ? 'Incorrect.' : 'Incorrect.'}
                    </div>
                    <div className="text-rose-800 text-sm mt-1 uppercase tracking-widest">
                      {language === 'en' ? 'Correct answer:' : 'Réponse correcte :'}
                    </div>
                    <div className="text-rose-900 font-medium font-thai text-xl md:text-2xl mt-1 sm:mt-0">{formatCombiningChar(currentExercise.letterToPick!)}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleCheck()}
                disabled={currentExercise.type !== 'intro' && currentExercise.type !== 'review' && !isChecking && !selectedOption}
                className={`w-full sm:w-auto px-12 py-3 rounded-xl border-b-4 font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:scale-100 disabled:shadow-none
                  ${(currentExercise.type === 'intro' || currentExercise.type === 'review') ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' :
                  isChecking 
                    ? (isCorrect 
                      ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' 
                      : 'bg-rose-500 border-rose-700 text-white hover:bg-rose-400') 
                    : 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400'}
                `}
              >
                {(currentExercise.type === 'intro' || currentExercise.type === 'review') || isChecking ? (language === 'en' ? 'Continue' : 'Continuer') : (language === 'en' ? 'Check' : 'Vérifier')}
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
      )}
      </>
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
