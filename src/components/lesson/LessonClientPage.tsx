"use client";

import { Suspense, useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "motion/react";
import { getTranslation } from "@/hooks/useTranslation";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { getLightweightLessons } from "@/actions/course";

// Static imports for maximum offline resilience
import WordMatch from './WordMatch';
import SentenceBuilder from './SentenceBuilder';
import Composition from './Composition';
import PairMatch from "@/components/learn/PairMatch";
import VirtualKeyboard from '@/components/writing/VirtualKeyboard';
import FreeTypingInput from './FreeTypingInput';
import MissingLetter from './MissingLetter';
import SoundToLetter from './SoundToLetter';
import TrueFalse from './TrueFalse';
import OneLetterDifference from './OneLetterDifference';
import WordPosition from './WordPosition';
import PhraseOrder from './PhraseOrder';
import GlossaryModal from '@/components/lesson/GlossaryModal';
import ResultScreen from '@/components/lesson/ResultScreen';
import NextResultScreen from '@/components/next/NextResultScreen';
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import HeaderProgressBar from "@/components/lesson/HeaderProgressBar";
import InstructionBlock from "@/components/lesson/InstructionBlock";
import Footer from "@/components/lesson/Footer";
import QuestionArea from "@/components/lesson/QuestionArea";

import { useLessonGameLogic } from "@/hooks/useLessonGameLogic";
import { Exercise, Word } from "@/types";


function LessonPageContent({ lesson }: { lesson: any }) {
  const { state, actions } = useLessonGameLogic(lesson);
  const searchParams = useSearchParams();
  const isFromNext = searchParams.get('from') === 'next';

  // Leçons légères pour NextResultScreen (chargées uniquement si from=next)
  const [allLessons, setAllLessons] = useState<any[]>([]);
  useEffect(() => {
    if (isFromNext) {
      getLightweightLessons().then(setAllLessons);
    }
  }, [isFromNext]);

  if (state.showResumePrompt) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-xl m-4 border-2 border-slate-100">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <RotateCcw size={32} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
            {getTranslation('auto.resume_lesson', state.language) || 'Partie en cours'}
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            {getTranslation('auto.resume_lesson_desc', state.language) || 'Vous avez commencé ce niveau précédemment. Voulez-vous reprendre là où vous en étiez ?'}
          </p>
          <div className="flex flex-col w-full gap-3">
            <Button variant="amberGamified" size="lg" onClick={actions.handleResume}>
              {getTranslation('auto.resume_button', state.language) || 'Reprendre la partie'}
            </Button>
            <Button variant="gamifiedSecondary" size="lg" onClick={actions.handleRestart}>
              {getTranslation('auto.restart_button', state.language) || 'Recommencer à zéro'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.isFinished && state.currentLevel !== undefined) {
    // Mode /next : afficher l'écran simplifié
    if (isFromNext) {
      return (
        <NextResultScreen
          lesson={lesson}
          currentLevel={state.currentLevel}
          earnedStars={state.earnedStars}
          earnedXp={state.earnedXp}
          isPart={state.isPart}
          partIndex={state.partIndex}
          totalParts={state.totalParts}
          elapsedTimeSec={state.elapsedTimeSec}
          language={state.language}
          allLessons={allLessons}
        />
      );
    }

    // Mode standard : écran de fin normal
    const lessonIndex = parseInt(lesson.id.replace("lesson-", "")) - 1;
    const unitEndIndices = [11, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let currentUnitIndex = unitEndIndices.findIndex((idx) => lessonIndex < idx);
    if (currentUnitIndex === -1 && lessonIndex >= 0)
      currentUnitIndex = unitEndIndices.length - 1;
    const isEndOfUnit = unitEndIndices.includes(lessonIndex + 1);
    const nextUnitIndex =
      isEndOfUnit &&
        currentUnitIndex !== -1 &&
        currentUnitIndex < unitEndIndices.length - 1
        ? currentUnitIndex + 1
        : -1;

    return (
      <ResultScreen
        lesson={lesson}
        currentLevel={state.currentLevel}
        earnedStars={state.earnedStars}
        exercisesLength={state.exercises.length}
        language={state.language}
        nextUnitIndex={nextUnitIndex}
        failedDueToTime={state.failedDueToTime}
        timeLeft={state.timeLeft}
        initialTime={state.initialTime}
        currentIndex={state.currentIndex}
        earnedXp={state.earnedXp}
        isPart={state.isPart}
        partIndex={state.partIndex}
        totalParts={state.totalParts}
        mode={state.mode}
        elapsedTimeSec={state.elapsedTimeSec}
      />
    );
  }

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
            <HeaderProgressBar
              lessonId={lesson.id}
              language={state.language}
              currentLevel={state.currentLevel}
              progress={state.progress}
              earnedStars={state.earnedStars}
              currentIndex={state.currentIndex}
              exercisesLength={state.exercises.length}
              currentExercise={state.currentExercise as Exercise}
              showRomanization={state.showRomanization}
              setShowRomanization={actions.setShowRomanization}
              setShowInfoModal={actions.setShowInfoModal}
              isReview={lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan') || state.currentLevel === 10}
              timeLeft={state.timeLeft}
              initialTime={state.initialTime}
              showHelpButton={!(state.showInstruction || state.showHelpModal) && !!state.instructionKey}
              onShowHelp={() => actions.setShowHelpModal(true)}
            />

            {/* Main Exercise Area */}
            <main className="flex-1 flex flex-col w-full relative">
              {/* Glossary Modal */}
              <GlossaryModal
                isOpen={state.showInfoModal}
                lesson={lesson}
                language={state.language}
                showRomanization={state.showRomanization}
                setShowRomanization={actions.setShowRomanization}
                showHelpButton={!(state.showInstruction || state.showHelpModal) && !!state.instructionKey && !state.currentExercise?.forceHideRomanization}
                onShowHelp={() => actions.setShowHelpModal(true)}
                onClose={() => actions.setShowInfoModal(false)}
              />

              {/* The Question / Hint System */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.currentExercise?.id || 'loading'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center md:justify-center md:overflow-y-auto hide-scrollbar"
                >
                  {/* Instruction Screen */}
                  {(state.showInstruction || state.showHelpModal) && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex justify-center"
                    >
                      <InstructionBlock
                        language={state.language}
                        instructionText={state.instructionText}
                        instructionKey={state.instructionKey}
                        currentExercise={state.currentExercise as Exercise}
                        dontShowAgain={state.dontShowAgain}
                        setDontShowAgain={actions.setDontShowAgain}
                        showHelpModal={state.showHelpModal}
                        setShowHelpModal={actions.setShowHelpModal}
                        hideInstruction={actions.hideInstruction}
                        unhideInstruction={actions.unhideInstruction}
                        setAcknowledgedInstructions={actions.setAcknowledgedInstructions}
                      />
                    </motion.div>
                  )}

                  {/* Scrollable Upper Area */}
                  <motion.div
                    animate={{ opacity: state.isExiting ? 0 : 1, y: 0, scale: 1 }}
                    transition={{ duration: state.isExiting ? 0.15 : 0.3, delay: state.isExiting ? 0 : 0.1 }}
                    className={`${state.showInstruction || state.showHelpModal || state.currentExercise?.type === "pair-matching" || state.currentExercise?.type === "sound-to-letter" || state.currentExercise?.type === "true-false" || state.currentExercise?.type === "missing-letter" || state.currentExercise?.type === "one-letter-difference" || state.currentExercise?.type === "word-position" || state.currentExercise?.type === "phrase-order" || state.currentExercise?.type === "composition" ? "hidden" : "flex"} flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col ${state.isKeyboardOpen ? "justify-end pb-[5vh] md:justify-center md:pb-4" : "justify-center"} hide-scrollbar`}
                  >
                    {state.currentExercise?.type !== "pair-matching" && state.currentExercise?.type !== "sound-to-letter" && state.currentExercise?.type !== "true-false" && state.currentExercise?.type !== "missing-letter" && state.currentExercise?.type !== "one-letter-difference" && state.currentExercise?.type !== "word-position" && state.currentExercise?.type !== "phrase-order" && state.currentExercise?.type !== "composition" && (
                      <QuestionArea
                        currentExercise={state.currentExercise as Exercise}
                        lesson={lesson}
                        language={state.language}
                        showRomanization={state.showRomanization}
                        isChecking={state.isChecking}
                        selectedAnswer={state.selectedAnswer}
                      />
                    )}
                  </motion.div>

                  {/* Exercise Options (Fixed at bottom on Mobile) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={state.isExiting ? { opacity: 0 } : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: state.isExiting ? 0.15 : 0.3, delay: state.isExiting ? 0 : 0.3 }}
                    className={`${state.showInstruction || state.showHelpModal ? "hidden" : "flex"} ${state.currentExercise?.type === "pair-matching" || state.currentExercise?.type === "sound-to-letter" || state.currentExercise?.type === "true-false" || state.currentExercise?.type === "missing-letter" || state.currentExercise?.type === "one-letter-difference" || state.currentExercise?.type === "word-position" || state.currentExercise?.type === "phrase-order" || state.currentExercise?.type === "composition" ? "flex-1 items-center" : "shrink-0 md:shrink-0"} bg-transparent px-4 pb-4 pt-2 md:pt-4 md:pb-8 justify-center z-10 w-full max-w-3xl`}
                  >
                    <div className={cn("w-full relative", (state.currentExercise?.type === "true-false" || state.currentExercise?.type === "sound-to-letter" || state.currentExercise?.type === "missing-letter" || state.currentExercise?.type === "one-letter-difference" || state.currentExercise?.type === "word-position" || state.currentExercise?.type === "phrase-order" || state.currentExercise?.type === "composition") && "h-full")}>
                      <ErrorBoundary>
                        {state.currentExercise?.type === "intro" ? null : state.currentExercise?.type === "composition" ? (
                            <Composition
                              exercise={state.currentExercise as Exercise}
                              language={state.language}
                            />
                          ) : state.currentExercise?.type === "word-match" ? (
                            <WordMatch
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "one-letter-difference" ? (
                            <OneLetterDifference
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "word-position" ? (
                            <WordPosition
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "phrase-order" ? (
                            <PhraseOrder
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "pair-matching" ? (
                            <PairMatch
                              key={state.currentExercise.id}
                              pairs={state.currentExercise.pairs as Word[]}
                              mode={state.currentExercise.pairMatchMode}
                              forceHideRomanization={state.currentExercise.forceHideRomanization}
                              disabled={state.isChecking}
                              onComplete={(failed?: boolean) => {
                                actions.handleCheck(!failed);
                              }}
                            />
                          ) : state.currentExercise?.type === "writing" ? (
                            <VirtualKeyboard
                              exercise={state.currentExercise as Exercise}
                              selected={(state.selectedAnswer as string[]) || []}
                              onChange={actions.setSelectedAnswer as any}
                              disabled={state.isChecking}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                            />
                          ) : state.currentExercise?.type === "free-typing" ? (
                            <FreeTypingInput
                              exercise={state.currentExercise as Exercise}
                              selected={(state.selectedAnswer as string) || ""}
                              onChange={actions.setSelectedAnswer as any}
                              disabled={state.isChecking}
                            />
                          ) : state.currentExercise?.type === "missing-letter" ? (
                            <MissingLetter
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "sound-to-letter" ? (
                            <SoundToLetter
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                              language={state.language}
                              onAddMistake={() => actions.setMistakes((m: number) => m + 1)}
                            />
                          ) : state.currentExercise?.type === "true-false" ? (
                            <TrueFalse
                              exercise={state.currentExercise as Exercise}
                              selected={state.selectedAnswer as string}
                              onChange={actions.setSelectedAnswer}
                              disabled={state.isChecking}
                              isChecking={state.isChecking}
                              isCorrect={state.isCorrect}
                              language={state.language}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                            />
                          ) : state.currentExercise && (
                            <SentenceBuilder
                              exercise={state.currentExercise as Exercise}
                              selected={(state.selectedAnswer as string[]) || []}
                              onChange={actions.setSelectedAnswer as any}
                              disabled={state.isChecking}
                              onAutoCheck={(val) => actions.handleCheck(val)}
                            />
                          )}
                      </ErrorBoundary>
                    </div>
                  </motion.div>
                  {/* The transparent spacer to allow footer absolute positioning without overlapping options */}
                  <div
                    className="hidden"
                  ></div>
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Footer Actions */}
            {(() => {
              let customCorrectAnswer = undefined;
              if (state.currentExercise?.type === "true-false") {
                const ex = state.currentExercise;
                if (!ex.isCorrectSpelling && ex.originalWord && ex.displayWord) {
                  const orig = Array.from(ex.originalWord);
                  const disp = Array.from(ex.displayWord);
                  customCorrectAnswer = (
                    <div className="flex text-3xl font-thai mt-1">
                      {orig.map((char, idx) => (
                        <span key={idx} className={char !== disp[idx] ? "text-amber-500 font-bold" : ""}>
                          {char}
                        </span>
                      ))}
                    </div>
                  );
                } else if (ex.originalWord) {
                  customCorrectAnswer = <div className="text-3xl font-thai mt-1">{ex.originalWord}</div>;
                }
              }

              return (
                <Footer
                  currentExercise={state.currentExercise as Exercise}
                  isChecking={state.isChecking}
                  isCorrect={state.isCorrect}
                  language={state.language}
                  selectedAnswer={state.selectedAnswer}
                  showFooter={state.showFooter}
                  handleCheck={actions.handleCheck}
                  customCorrectAnswer={customCorrectAnswer}
                />
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LessonClientPage({ lesson }: { lesson: any }) {
  return (
    <Suspense fallback={null}>
      <LessonPageContent lesson={lesson} />
    </Suspense>
  );
}
