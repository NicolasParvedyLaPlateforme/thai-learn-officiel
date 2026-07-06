'use client';

import { Suspense } from 'react';
import { m as motion, AnimatePresence } from "motion/react";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { playThaiTTS } from "@/lib/tts";
import { Volume2, Info, HelpCircle } from 'lucide-react';
import { IconButton } from "@/components/ui/IconButton";
import { ColoredPhonetic } from "@/components/learn/ColoredPhonetic";
import { AlphabetCard } from "@/components/alphabet/AlphabetCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import HeaderProgressBar from "@/components/lesson/HeaderProgressBar";
import Footer from "@/components/lesson/Footer";
import ResultScreen from "@/components/lesson/ResultScreen";
import { ExerciseOptionsGrid } from "./ExerciseOptionsGrid";
import { QuestionContainer } from "./QuestionContainer";
import { useAlphabetLogic } from "@/hooks/useAlphabetLogic";

function AlphabetLessonContent() {
  const { state, actions } = useAlphabetLogic();

  if (!state.isDataLoaded && !state.showExerciseUI) {
    // Need this block to prevent early access
  }

  if (state.isFinished && state.currentLevel !== undefined) {
    const isLastConsonant = state.lesson && state.consonants.length > 0 && state.lesson.id === state.consonants[state.consonants.length - 1].id;
    const isLastVowel = state.lesson && state.vowels.length > 0 && state.lesson.id === state.vowels[state.vowels.length - 1].id;
    const isEndOfUnit = isLastConsonant || isLastVowel;
    const nextUnitIndex = isEndOfUnit ? (isLastConsonant ? 1 : -1) : -1;

    return (
      <ResultScreen
        lesson={state.lesson as any}
        currentLevel={state.currentLevel}
        earnedStars={state.earnedStars}
        exercisesLength={state.exercises.length}
        language={state.language}
        nextUnitIndex={nextUnitIndex}
        earnedXp={state.earnedXp}
        mode={state.searchParams.get("mode")}
        pathType="alphabet"
        elapsedTimeSec={state.elapsedTimeSec}
      />
    );
  }

  const renderExerciseContent = () => {
    const currentEx = state.currentExercise;
    if (!currentEx) return null;
    
    if (currentEx.type === 'intro') {
      return (
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            {getTranslation('auto.new_letter', state.language)}
          </h1>
          <AlphabetCard item={currentEx.item} onPlayAudio={() => playThaiTTS(currentEx.item.exampleWord)} />
          <div className="mt-8 space-y-4 text-center">
            <p className="text-2xl font-bold text-slate-800"><ColoredPhonetic phonetic={currentEx.phonetic} /></p>
            <div className="text-xl text-slate-600">
              <span className="font-bold font-thai text-indigo-600">{currentEx.targetText}</span>
              <span className="opacity-75"> ({currentEx.targetTranslation})</span>
            </div>
          </div>
        </div>
      );
    }

    if (currentEx.type === 'review') {
      return (
        <div className="flex-1 flex flex-col items-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12">
            {getTranslation('auto.review_these_letters', state.language)}
          </h1>
          <div className="flex gap-4 sm:gap-8 justify-center flex-wrap">
            {currentEx.options.map((item: any) => (
              <div key={item.letter} className="flex flex-col items-center gap-4">
                <AlphabetCard item={item} onPlayAudio={() => playThaiTTS(item.exampleWord)} minimal={true} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentEx.type === 'phonetic-match') {
      return (
        <QuestionContainer
          title={getTranslation('auto.which_letter_matches_this_soun', state.language)}
          prompt={
            <div className="text-4xl md:text-5xl font-bold text-indigo-600 flex items-center flex-wrap justify-center font-sans tracking-wide">
              <ColoredPhonetic phonetic={currentEx.phonetic} />
            </div>
          }
        >
          <ExerciseOptionsGrid
            options={currentEx.options}
            selectedOption={state.selectedOption}
            isCorrectState={state.isCorrect}
            language={state.language}
            onOptionSelect={(opt) => {
              actions.setSelectedOption(opt);
              playThaiTTS(opt.exampleWord);
              actions.handleCheck(opt);
            }}
          />
        </QuestionContainer>
      );
    }

    if (currentEx.type === 'audio-match') {
      return (
        <QuestionContainer
          title={getTranslation('auto.listen_and_select_the_correct', state.language)}
          prompt={
            <IconButton
              size="lg"
              variant="solid"
              onClick={() => playThaiTTS(currentEx.item.exampleWord)}
              className="w-24 h-24 bg-sky-500 rounded-full text-white shadow-lg hover:scale-105 hover:bg-sky-400"
            >
              <Volume2 size={48} />
            </IconButton>
          }
        >
          <ExerciseOptionsGrid
            options={currentEx.options}
            selectedOption={state.selectedOption}
            isCorrectState={state.isCorrect}
            language={state.language}
            onOptionSelect={(opt) => {
              actions.setSelectedOption(opt);
              playThaiTTS(opt.exampleWord);
              actions.handleCheck(opt);
            }}
          />
        </QuestionContainer>
      );
    }

    let maskedText = currentEx.targetText;
    const blank = <div className="inline-flex w-12 h-14 md:w-16 md:h-20 border-b-4 border-slate-300 items-center justify-center text-indigo-500 pb-2 mx-1 vertical-align-bottom">
      {state.selectedOption ? formatCombiningChar(state.selectedOption.letter) : ''}
    </div>;

    const parts = currentEx.targetText.split(currentEx.letterToPick!);

    return (
      <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
          {getTranslation('auto.find_the_correct_letter', state.language)}
        </h2>

        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-10 w-full justify-center text-center flex-col">
          <div className="text-3xl md:text-4xl font-medium text-slate-800 flex items-center flex-wrap justify-center font-thai leading-relaxed">
            {parts.map((part: string, i: number) => (
              <span key={i} className="flex items-center">
                {part}
                {i < parts.length - 1 && blank}
              </span>
            ))}
            <IconButton
              size="sm"
              onClick={() => playThaiTTS(currentEx.targetText)}
              className="ml-4 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 shrink-0"
            >
              <Volume2 size={24} />
            </IconButton>
          </div>

          <div className="mt-4 flex flex-col items-center w-full">
            <div className="text-slate-500 font-medium text-lg flex items-center justify-center gap-2 flex-wrap">
              <ColoredPhonetic phonetic={currentEx.phonetic} />
              <span>— {currentEx.targetTranslation}</span>
              <IconButton
                size="sm"
                onClick={() => actions.setShowHint(!state.showHint)}
                className={`ml-1 md:ml-2 ${state.showHint ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100'}`}
                title={getTranslation('auto.show_hint_24', state.language)}
              >
                <HelpCircle size={20} />
              </IconButton>
            </div>

            <AnimatePresence>
              {state.showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full mt-3 flex justify-center"
                >
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 md:p-4 text-sm md:text-base text-indigo-800 text-left flex items-start gap-3 max-w-sm">
                    <Info size={18} className="shrink-0 mt-0.5 text-indigo-500" />
                    {currentEx.explanation ? (
                      <p className="leading-relaxed">{currentEx.explanation}</p>
                    ) : (
                      <div className="leading-relaxed flex flex-col gap-1.5">
                        <p>
                          {getTranslation('auto.hint_the_letter_is_called', state.language)}
                          <span className="font-bold font-thai text-lg">{currentEx.item.exampleWord}</span>
                          <span className="opacity-80"> ({currentEx.item.pronunciation})</span>.
                        </p>
                        {(currentEx.item.mnemonicHintEn || currentEx.item.mnemonicHintFr) && (
                          <p className="text-sm border-l-2 border-indigo-200 pl-2 opacity-90">
                            {getTranslation('alphabet.think_mnemonic', state.language).replace('{0}', getLocalizedField(currentEx.item, 'mnemonicHint', state.language))}
                          </p>
                        )}
                        {currentEx.item.type === 'vowel' && (
                          <p className="text-sm mt-1 bg-indigo-100/50 p-2 rounded">
                            {getTranslation('auto.tip_a_double_letter_in_the_pr', state.language)}
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

        <ExerciseOptionsGrid
          options={currentEx.options}
          selectedOption={state.selectedOption}
          isCorrectState={state.isCorrect}
          language={state.language}
          onOptionSelect={(opt) => {
            actions.setSelectedOption(opt);
            playThaiTTS(opt.exampleWord);
            actions.handleCheck(opt);
          }}
        />
      </div>
    );
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FAFAFA] font-sans text-slate-800 overflow-hidden relative">
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
            {/* Header */}
            <HeaderProgressBar
              lessonId={state.lesson?.id || ""}
              language={state.language}
              currentLevel={state.currentLevel}
              progress={state.progress}
              earnedStars={state.earnedStars}
              currentIndex={state.currentIndex}
              exercisesLength={state.exercises.length}
              currentExercise={undefined}
              returnUrl={`/alphabet#lesson-${state.lesson?.id}`}
            />

            {/* Main Exercise Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col py-6 md:py-12 px-4 w-full relative">
              <div className="w-full max-w-3xl mx-auto flex flex-col justify-center flex-1">
                {state.currentExercise && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.currentExercise.id}
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
              currentExercise={state.currentExercise as any}
              isChecking={state.isChecking}
              isCorrect={state.isCorrect}
              language={state.language}
              selectedAnswer={state.selectedOption?.letter || null}
              showFooter={state.showFooter}
              handleCheck={actions.handleCheck}
              customCorrectAnswer={
                <div className="font-medium font-thai text-xl md:text-2xl mt-1 sm:mt-0">
                  {state.currentExercise ? formatCombiningChar(state.currentExercise.letterToPick!) : ""}
                </div>
              }
              disableCheck={
                !!(state.currentExercise && state.currentExercise.type !== 'intro' && state.currentExercise.type !== 'review' && !state.isChecking && !state.selectedOption)
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