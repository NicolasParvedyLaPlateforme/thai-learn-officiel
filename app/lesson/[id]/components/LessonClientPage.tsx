"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProgressStore } from "../../../lib/store";
import { getExercisesServer, getLessonData } from "../../../actions/course";
import { Exercise, Lesson, Word } from "../../../types";
import { X, Check, Star, Crown, Volume2, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { playThaiTTS, preloadThaiVoices } from "../../../lib/tts";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

// Exercise Components
import WordMatch from "./WordMatch";
import SentenceBuilder from "./SentenceBuilder";
import PairMatch from "../../../components/PairMatch";
import { TooltipHint, SentenceWithHints } from "../../../components/Hints";
import VirtualKeyboard from "../../../writing/components/VirtualKeyboard";
import FreeTypingInput from "./FreeTypingInput";
import InstructionExample from "./InstructionExample";
import { Suspense } from "react";
import { LoadingScreen } from "../../../components/LoadingScreen";

import GlossaryModal from "./GlossaryModal";
import ResultScreen from "./ResultScreen";
import HeaderProgressBar from "./HeaderProgressBar";
import InstructionBlock from "./InstructionBlock";
import Footer from "./Footer";
import QuestionArea from "./QuestionArea";

const getInstructionKey = (ex: Exercise | undefined) => {
  if (!ex) return null;
  if (ex.type === "intro") return null;
  if (ex.type === "word-match") return "word-match";
  if (ex.type === "pair-matching") return "pair-matching";
  if (ex.type === "sentence-builder") return "sentence-builder";
  if (ex.type === "writing")
    return ex.blindMode ? "writing-blind" : "writing";
  if (ex.type === "free-typing") return "free-typing";
  return null;
};

const getInstructionText = (key: string | null, lang: string) => {
  if (key === "word-match")
    return lang === "en"
      ? "Select the correct translation"
      : "Sélectionnez la bonne traduction";
  if (key === "pair-matching")
    return lang === "en"
      ? "Match the pairs"
      : "Reliez les paires correspondantes";
  if (key === "sentence-builder")
    return lang === "en"
      ? "Translate this sentence"
      : "Traduisez cette phrase";
  if (key === "writing")
    return lang === "en"
      ? "Translate this sentence"
      : "Traduisez cette phrase";
  if (key === "writing-blind")
    return lang === "en" ? "Write in Thai" : "Écrivez en thaï";
  if (key === "free-typing")
    return lang === "en"
      ? "Type the correct translation"
      : "Tapez la bonne traduction";
  return null;
};

function LessonPageContent({ lesson }: { lesson: any }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    completeLesson,
    lessonLevels,
    language,
    completedLessons,
    unlockedLessons,
    _hasHydrated,
    showRomanization,
    setShowRomanization,
    setLastActiveUnitIndex,
    setLastPlayedLesson,
    hiddenInstructions,
    hideInstruction,
    unhideInstruction,
  } = useProgressStore();

  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get("level");
  const isDev = searchParams.has("dev");

  // We got lesson from props!
  const savedLevel = lesson ? lessonLevels[lesson.id] || 0 : 0;

  // Use requested level if provided, otherwise the saved level
  const currentLevel = requestedLevelStr
    ? isDev
      ? Math.max(0, parseInt(requestedLevelStr, 10) - 1)
      : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))
    : savedLevel;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | string[] | null
  >(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const earnedStars = mistakes < 2 ? 3 : mistakes < 4 ? 2 : 1;

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{
    id: string;
    level: number;
  } | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState<
    Set<string>
  >(new Set());

  const currentExerciseTop = exercises[currentIndex];
  const instructionKeyTop = getInstructionKey(currentExerciseTop);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (instructionKeyTop) {
      setDontShowAgain(hiddenInstructions.includes(instructionKeyTop));
    }
  }, [instructionKeyTop, hiddenInstructions, showHelpModal]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!lesson) {
      router.push("/learn");
      return;
    }

    if (
      !exercisesGeneratedFor ||
      exercisesGeneratedFor.id !== lesson.id ||
      exercisesGeneratedFor.level !== currentLevel
    ) {
      preloadThaiVoices();
      getExercisesServer(lesson.id, currentLevel, language).then(generated => {
         setExercises(generated);
         setCurrentIndex(0);
         setIsFinished(false);
         setIsChecking(false);
         setIsCorrect(null);
         setSelectedAnswer(null);
         setMistakes(0);
         setExercisesGeneratedFor({ id: lesson.id, level: currentLevel });
      });
    }
  }, [
    lesson,
    router,
    currentLevel,
    language,
    completedLessons,
    _hasHydrated,
    lessonId,
    unlockedLessons,
    exercisesGeneratedFor,
  ]);

  const isDataLoaded = isClient && _hasHydrated && !!lesson && exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Need this block to prevent early variable access if exercises is empty
    // but the loading screen is still active.
  }

  const currentExercise = exercises.length > 0 ? exercises[currentIndex] : null;
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  const handleCheck = (overrideAnswer?: any) => {
    if (!currentExercise) return;
    if (currentExercise.type === "intro") {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
          setSelectedAnswer(null);
        } else {
          setIsFinished(true);
          completeLesson(lesson.id, 10 + exercises.length, currentLevel, earnedStars);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }, 150);
      return;
    }

    if (isChecking) {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        // Move to next exercise
        if (isCorrect) {
          if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsChecking(false);
            setIsCorrect(null);
            setSelectedAnswer(null);
          } else {
            // Finished
            setIsFinished(true);
            completeLesson(lesson.id, 10 + exercises.length, currentLevel, earnedStars);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        } else {
          // If wrong, we re-add the exercise to the end!
          setExercises([...exercises, currentExercise]);
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
          setSelectedAnswer(null);
        }
      }, 150);
      return;
    }

    // Validate
    const answerToCheck = overrideAnswer !== undefined && overrideAnswer !== null && (typeof overrideAnswer === 'string' || Array.isArray(overrideAnswer)) ? overrideAnswer : selectedAnswer;
    if (!answerToCheck) return;

    let correct = false;
    if (currentExercise.type === "word-match") {
      correct = answerToCheck === currentExercise.answer;
    } else if (currentExercise.type === "sentence-builder") {
      if (currentExercise.isFillInBlank && currentExercise.correctComponents && currentExercise.blankIndex !== undefined) {
         if (Array.isArray(answerToCheck) && answerToCheck.length === 1) {
             const expectedWordId = currentExercise.correctComponents[currentExercise.blankIndex];
             const expectedWord = currentExercise.options.find(o => o.id === expectedWordId)?.th;
             correct = answerToCheck[0] === expectedWord;
         }
      } else {
         const builtSentence = (answerToCheck as string[])
           .join("")
           .replace(/\s+/g, "");
         const expectedSentence = currentExercise.answer
           .replace(/\s+/g, "")
           .replace(/\.\.\./g, "");
         correct = builtSentence === expectedSentence;
      }
    } else if (currentExercise.type === "writing") {
      const builtValue = (answerToCheck as string[])
        .join("")
        .replace(/\s+/g, "");
      const targetValue = currentExercise.answer.replace(/\s+/g, "");
      correct = builtValue === targetValue;
    } else if (currentExercise.type === "free-typing") {
      const builtValue =
        typeof answerToCheck === "string"
          ? answerToCheck.replace(/\s+/g, "")
          : "";
      const targetValue = currentExercise.answer.replace(/\s+/g, "");

      const levenshtein = (a: string, b: string): number => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = Array.from({ length: a.length + 1 }, () =>
          new Array(b.length + 1).fill(0),
        );
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost,
            );
          }
        }
        return matrix[a.length][b.length];
      };

      const editDist = levenshtein(builtValue, targetValue);
      const similarity =
        1 - editDist / Math.max(builtValue.length, targetValue.length);
      correct = similarity >= 0.8;
    }

    setIsCorrect(correct);
    if (!correct) {
      setLastPlayedLesson(lessonId, 'learn');
      setMistakes(m => m + 1);
    }
    setIsChecking(true);
    playThaiTTS(currentExercise.answer);
  };

  if (isFinished) {
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
        currentLevel={currentLevel}
        earnedStars={earnedStars}
        exercisesLength={exercises.length}
        language={language}
        nextUnitIndex={nextUnitIndex}
      />
    );
  }

  const isAnswerComplete = currentExercise
    ? currentExercise.type === "intro"
      ? true
      : currentExercise.type === "free-typing"
        ? typeof selectedAnswer === "string" && selectedAnswer.trim().length >= Math.max(1, currentExercise.answer.replace(/\s+/g, "").length - 1)
        : (currentExercise.type === "writing" ||
              currentExercise.type === "sentence-builder") &&
            currentExercise.correctComponents
          ? Array.isArray(selectedAnswer) &&
            selectedAnswer.length ===
              currentExercise.correctComponents.filter((c) => c !== "w_dots")
                .length
          : selectedAnswer !== null &&
            (!Array.isArray(selectedAnswer) ||
              (selectedAnswer as any[]).length > 0)
    : false;

  const showFooter = currentExercise
    ? (currentExercise.type !== "pair-matching" || (isChecking && !isCorrect)) &&
      (isChecking || isAnswerComplete)
    : false;

  const instructionKey = getInstructionKey(currentExercise || undefined);
  const instructionText = getInstructionText(instructionKey, language);
  const isAcknowledged = instructionKey
    ? acknowledgedInstructions.has(instructionKey) || hiddenInstructions.includes(instructionKey)
    : true;

  const showInstruction = !!(instructionText && !isAcknowledged);

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
            <HeaderProgressBar
              lessonId={lesson.id}
              language={language}
              currentLevel={currentLevel}
              progress={progress}
              earnedStars={earnedStars}
              currentIndex={currentIndex}
              exercisesLength={exercises.length}
              currentExercise={currentExercise as Exercise}
              showRomanization={showRomanization}
              setShowRomanization={setShowRomanization}
              setShowInfoModal={setShowInfoModal}
            />

            {/* Main Exercise Area */}
            <main className="flex-1 flex flex-col w-full relative">
        {/* Glossary Modal */}
        {showInfoModal && (
          <GlossaryModal 
             lesson={lesson} 
             language={language} 
             showRomanization={showRomanization} 
             onClose={() => setShowInfoModal(false)} 
          />
        )}

        {/* The Question / Hint System */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise?.id || 'loading'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center md:justify-center md:overflow-y-auto hide-scrollbar"
          >
            {/* Instruction Screen */}
            {(showInstruction || showHelpModal) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                <InstructionBlock
                  language={language}
                  instructionText={instructionText}
                  instructionKey={instructionKey}
                  currentExercise={currentExercise as Exercise}
                  dontShowAgain={dontShowAgain}
                  setDontShowAgain={setDontShowAgain}
                  showHelpModal={showHelpModal}
                  setShowHelpModal={setShowHelpModal}
                  hideInstruction={hideInstruction}
                  unhideInstruction={unhideInstruction}
                  setAcknowledgedInstructions={setAcknowledgedInstructions}
                />
              </motion.div>
            )}

            {/* Help Button - Above Exercise */}
            {!(showInstruction || showHelpModal) && instructionKey && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="w-full max-w-3xl px-4 pt-4 md:pt-6 flex justify-end shrink-0">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="text-slate-500 hover:text-amber-600 transition-colors bg-white rounded-full py-1.5 px-3 shadow-sm border border-slate-200 flex items-center gap-1.5 text-sm font-bold active:scale-95"
                  title={language === "en" ? "Help / Instructions" : "Aide / Instructions"}
                >
                  <HelpCircle size={18} strokeWidth={2.5} />
                  {language === "en" ? "Help" : "Aide"}
                </button>
              </motion.div>
            )}

            {/* Scrollable Upper Area */}
            <motion.div
              animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: 1 }}
              transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.1 }}
              className={`${showInstruction || showHelpModal || currentExercise?.type === "pair-matching" ? "hidden" : "flex"} flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col justify-center hide-scrollbar`}
            >
              {currentExercise?.type !== "pair-matching" && (
                <QuestionArea
                  currentExercise={currentExercise as Exercise}
                  lesson={lesson}
                  language={language}
                  showRomanization={showRomanization}
                  isChecking={isChecking}
                  selectedAnswer={selectedAnswer}
                />
              )}
            </motion.div>

            {/* Exercise Options (Fixed at bottom on Mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isExiting ? { opacity: 0 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.3 }}
              className={`${showInstruction || showHelpModal ? "hidden" : "flex"} ${currentExercise?.type === "pair-matching" ? "flex-1 items-center" : "shrink-0 md:shrink-0"} bg-transparent px-4 pb-4 pt-2 md:pt-4 md:pb-8 justify-center z-10 w-full max-w-3xl`}
            >
              <div className="w-full relative">
                {currentExercise?.type ===
                "intro" ? null : currentExercise?.type === "word-match" ? (
                  <WordMatch
                    exercise={currentExercise as Exercise}
                    selected={selectedAnswer as string}
                    onChange={setSelectedAnswer}
                    disabled={isChecking}
                    isChecking={isChecking}
                    isCorrect={isCorrect}
                    onAutoCheck={(val) => handleCheck(val)}
                    language={language}
                    onAddMistake={() => setMistakes(m => m + 1)}
                  />
                ) : currentExercise?.type === "pair-matching" ? (
                  <PairMatch
                    key={currentExercise.id}
                    pairs={currentExercise.pairs as Word[]}
                    mode={currentExercise.pairMatchMode}
                    forceHideRomanization={
                      currentExercise.forceHideRomanization
                    }
                    disabled={isChecking}
                    onComplete={(failed?: boolean) => {
                      if (failed) {
                        setIsCorrect(false);
                        setIsChecking(true);
                        setMistakes((m) => m + 1);
                        setLastPlayedLesson(lessonId, 'learn');
                        playThaiTTS("ผิดครับ");
                      } else {
                        setIsExiting(true);
                        setTimeout(() => {
                          setIsExiting(false);
                          if (currentIndex < exercises.length - 1) {
                            setCurrentIndex((prev) => prev + 1);
                            setIsChecking(false);
                            setIsCorrect(null);
                            setSelectedAnswer(null);
                          } else {
                            setIsFinished(true);
                            completeLesson(
                              lesson.id,
                              10 + exercises.length,
                              currentLevel,
                            );
                            confetti({
                              particleCount: 150,
                              spread: 70,
                              origin: { y: 0.6 },
                            });
                          }
                        }, 150);
                      }
                    }}
                  />
                ) : currentExercise?.type === "writing" ? (
                  <VirtualKeyboard
                    exercise={currentExercise as Exercise}
                    selected={(selectedAnswer as string[]) || []}
                    onChange={setSelectedAnswer as any}
                    disabled={isChecking}
                    onAutoCheck={(val) => handleCheck(val)}
                  />
                ) : currentExercise?.type === "free-typing" ? (
                  <FreeTypingInput
                    exercise={currentExercise as Exercise}
                    selected={(selectedAnswer as string) || ""}
                    onChange={setSelectedAnswer as any}
                    disabled={isChecking}
                  />
                ) : currentExercise && (
                  <SentenceBuilder
                    exercise={currentExercise as Exercise}
                    selected={(selectedAnswer as string[]) || []}
                    onChange={setSelectedAnswer as any}
                    disabled={isChecking}
                    onAutoCheck={(val) => handleCheck(val)}
                  />
                )}
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
        currentExercise={currentExercise as Exercise}
        isChecking={isChecking}
        isCorrect={isCorrect}
        language={language}
        selectedAnswer={selectedAnswer}
        showFooter={showFooter}
        handleCheck={handleCheck}
      />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LessonClientPage({ lesson }: { lesson: any }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center min-h-screen bg-[#FAFAFA]">
          Chargement...
        </div>
      }
    >
      <LessonPageContent lesson={lesson} />
    </Suspense>
  );
}
