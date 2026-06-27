"use client";

import { Suspense } from "react";
import { m as motion, AnimatePresence } from "motion/react";
import { getTranslation } from "@/hooks/useTranslation";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Static imports for maximum offline resilience
import WordMatch from './WordMatch';
import SentenceBuilder from './SentenceBuilder';
import PairMatch from "@/components/learn/PairMatch";
import VirtualKeyboard from '@/components/writing/VirtualKeyboard';
import FreeTypingInput from './FreeTypingInput';
import GlossaryModal from '@/components/lesson/GlossaryModal';
import ResultScreen from '@/components/lesson/ResultScreen';
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import HeaderProgressBar from "@/components/lesson/HeaderProgressBar";
import InstructionBlock from "@/components/lesson/InstructionBlock";
import Footer from "@/components/lesson/Footer";
import QuestionArea from "@/components/lesson/QuestionArea";

import { useLessonGameLogic } from "@/hooks/useLessonGameLogic";
import { Exercise, Word } from "@/types";

function LessonPageContent({ lesson }: { lesson: any }) {
  const { state, actions } = useLessonGameLogic(lesson);

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
            />

            {/* Main Exercise Area */}
            <main className="flex-1 flex flex-col w-full relative">
              {/* Glossary Modal */}
              <GlossaryModal
                isOpen={state.showInfoModal}
                lesson={lesson}
                language={state.language}
                showRomanization={state.showRomanization}
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

                  {/* Help Button - Above Exercise */}
                  {!(state.showInstruction || state.showHelpModal) && state.instructionKey && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="w-full max-w-3xl px-4 pt-4 md:pt-6 flex justify-end shrink-0">
                      <button
                        onClick={() => actions.setShowHelpModal(true)}
                        className="text-slate-500 hover:text-amber-600 transition-colors bg-white rounded-full py-1.5 px-3 shadow-sm border border-slate-200 flex items-center gap-1.5 text-sm font-bold active:scale-95"
                        title={getTranslation('auto.help_instructions', state.language)}
                      >
                        <HelpCircle size={18} strokeWidth={2.5} />
                        {getTranslation('auto.help', state.language)}
                      </button>
                    </motion.div>
                  )}

                  {/* Scrollable Upper Area */}
                  <motion.div
                    animate={{ opacity: state.isExiting ? 0 : 1, y: 0, scale: 1 }}
                    transition={{ duration: state.isExiting ? 0.15 : 0.3, delay: state.isExiting ? 0 : 0.1 }}
                    className={`${state.showInstruction || state.showHelpModal || state.currentExercise?.type === "pair-matching" ? "hidden" : "flex"} flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col ${state.isKeyboardOpen ? "justify-end pb-[5vh] md:justify-center md:pb-4" : "justify-center"} hide-scrollbar`}
                  >
                    {state.currentExercise?.type !== "pair-matching" && (
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
                    className={`${state.showInstruction || state.showHelpModal ? "hidden" : "flex"} ${state.currentExercise?.type === "pair-matching" ? "flex-1 items-center" : "shrink-0 md:shrink-0"} bg-transparent px-4 pb-4 pt-2 md:pt-4 md:pb-8 justify-center z-10 w-full max-w-3xl`}
                  >
                    <div className="w-full relative">
                      <ErrorBoundary>
                        {state.currentExercise?.type === "intro" ? null : state.currentExercise?.type === "word-match" ? (
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
            <Footer
              currentExercise={state.currentExercise as Exercise}
              isChecking={state.isChecking}
              isCorrect={state.isCorrect}
              language={state.language}
              selectedAnswer={state.selectedAnswer}
              showFooter={state.showFooter}
              handleCheck={actions.handleCheck}
            />
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
