import Image from "next/image";
import { useEffect } from "react";
import { Exercise, Lesson, Word } from "../../../types";
import { SentenceWithHints } from "../../../components/Hints";
import { playThaiTTS } from "../../../lib/tts";
import { motion } from "motion/react";

interface QuestionAreaProps {
  currentExercise: Exercise;
  lesson: Lesson;
  language: string;
  showRomanization: boolean;
  isChecking: boolean;
  selectedAnswer: string | string[] | null;
}

export default function QuestionArea({
  currentExercise,
  lesson,
  language,
  showRomanization,
  isChecking,
  selectedAnswer,
}: QuestionAreaProps) {
  useEffect(() => {
    if (currentExercise.type === "intro") {
      playThaiTTS(currentExercise.answer);
    }
  }, [currentExercise]);

  let currentThaiWordForAudio: string | undefined;
  if (
    currentExercise.type === "writing" &&
    currentExercise.blindMode &&
    currentExercise.correctComponents &&
    !isChecking
  ) {
    try {
      const segmenter = new (globalThis as any).Intl.Segmenter("th", {
        granularity: "word",
      });
      const fullTextNoSpaces = currentExercise.correctComponents.join("");
      const segments: any[] = Array.from(
        segmenter.segment(fullTextNoSpaces)
      ).filter((s: any) => s.segment.trim().length > 0);

      if (segments.length > 1) {
        const selectedLen = Array.isArray(selectedAnswer)
          ? selectedAnswer.length
          : ((selectedAnswer as string) || "").replace(/\s+/g, "").length;
        const currentStrLen = currentExercise.correctComponents
          .slice(0, selectedLen)
          .join("").length;

        let currentWordSegment = segments.find(
          (s) =>
            s.index <= currentStrLen &&
            s.index + s.segment.length > currentStrLen
        );
        if (!currentWordSegment) {
          currentWordSegment =
            segments.find((s) => s.index > currentStrLen) ||
            segments[segments.length - 1];
        }
      if (currentWordSegment) {
        currentThaiWordForAudio = currentWordSegment.segment;
      }
    }
  } catch (e) {}
}

const isReverse = currentExercise.reverse;
const is4ChoiceSimilar = (() => {
  if (currentExercise.type !== "word-match" || isReverse) return false;
  const options = currentExercise.options?.map((o: any) => o.th) || [];
  if (options.length !== 4) return false;
  if (options.some(o => !o || o.length === 0)) return false;

  const minLen = Math.min(...options.map(o => o.length));
  
  let commonPrefixLen = 0;
  while (commonPrefixLen < minLen) {
    const char = options[0][commonPrefixLen];
    if (options.every(o => o[commonPrefixLen] === char)) {
      commonPrefixLen++;
    } else {
      break;
    }
  }

  let commonSuffixLen = 0;
  while (commonSuffixLen < minLen - commonPrefixLen) {
    const char = options[0][options[0].length - 1 - commonSuffixLen];
    if (options.every(o => o[o.length - 1 - commonSuffixLen] === char)) {
      commonSuffixLen++;
    } else {
      break;
    }
  }

  const diffs = options.map(o => o.substring(commonPrefixLen, o.length - commonSuffixLen));
  if (diffs.some(d => d.length === 0)) return false;
  const maxDiffLen = Math.max(...diffs.map(d => Array.from(d).length));
  
  return maxDiffLen <= 3;
})();

const imageUrl =
  (currentExercise.type === "intro" &&
      (currentExercise.introItem as any)?.imageUrl) ||
    currentExercise.imageUrl;

  return (
    <>
      {/* Container for Question Content */}
      <div className="flex flex-col items-center justify-center text-center gap-4 md:gap-8 my-auto md:my-0 w-full">
        {/* Image Box */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${
            currentExercise.type === "intro" ||
            currentExercise.type === "word-match" ||
            currentExercise.type === "sentence-builder" ||
            currentExercise.type === "free-typing" ||
            currentExercise.type === "writing"
              ? "flex"
              : "hidden"
          } ${
            currentExercise.type === "sentence-builder" ||
            currentExercise.type === "free-typing" ||
            currentExercise.type === "writing"
              ? "w-24 h-24 sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl text-5xl md:text-4xl"
              : "w-40 h-40 sm:w-48 sm:h-48 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-3xl text-7xl md:text-5xl"
          } mx-auto items-center justify-center relative flex-shrink-0 ${
            imageUrl
              ? "bg-transparent overflow-visible"
              : "bg-emerald-100 shadow-sm border border-emerald-200 overflow-hidden"
          }`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="word"
              fill
              className="object-contain"
            />
          ) : (
            <span>🐘</span>
          )}
          {!imageUrl && (
            <div className="absolute -right-2 -top-2 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full z-10"></div>
          )}
        </motion.div>

        {/* Question Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 mt-2 md:mt-0 flex flex-col items-center w-full"
        >
          <div className="relative w-full text-center mt-2 md:mt-0">
            {currentExercise.type === "intro" ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-2xl text-slate-600 font-medium">
                  {currentExercise.question}
                </p>
                <div
                  className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-emerald-100 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors"
                  onClick={() => playThaiTTS(currentExercise.answer)}
                >
                  <span className="font-thai text-3xl md:text-4xl text-emerald-600 font-semibold">
                    {currentExercise.answer}
                  </span>
                  {currentExercise.introItem &&
                    showRomanization &&
                    !currentExercise.forceHideRomanization && (
                      <div className="flex flex-col border-l-2 border-emerald-100 pl-3">
                        <span className="font-medium text-slate-500 text-sm">
                          {language === "en"
                            ? "Pronunciation"
                            : "Prononciation"}
                        </span>
                        <span className="font-bold text-slate-700">
                          {currentExercise.introItem.phonetic}
                        </span>
                      </div>
                    )}
                  <div className="ml-2 bg-emerald-100 text-emerald-600 p-2 rounded-full">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex-1 w-full flex justify-center">
                  <SentenceWithHints
                    text={currentExercise.question}
                    dictionary={lesson.words}
                    phrases={lesson.phrases}
                    isSentence={currentExercise.type === "sentence-builder"}
                    exerciseOptions={currentExercise.options as Word[]}
                    hideHints={currentExercise.hideHints}
                    disableTooltips={
                      currentExercise.disableTooltips ||
                      currentExercise.blindMode ||
                      is4ChoiceSimilar
                    }
                    hideColors={currentExercise.hideColors}
                    alwaysShowPhonetic={true}
                    answerTh={currentExercise.answer}
                    correctComponents={currentExercise.correctComponents}
                    isChecking={isChecking}
                    forceHideRomanization={
                      currentExercise.forceHideRomanization
                    }
                    isReverse={currentExercise.reverse}
                    currentThaiWordForAudio={currentThaiWordForAudio}
                    rightElement={
                      currentExercise.type === "word-match" ||
                      (currentExercise.type === "writing" &&
                        currentExercise.blindMode &&
                        currentExercise.correctComponents &&
                        !isChecking) ? (
                        <button
                          onClick={() => playThaiTTS(currentExercise.answer)}
                          className="text-emerald-500 hover:text-emerald-600 bg-emerald-50 p-2 rounded-full transition-colors flex-shrink-0 ml-2"
                          title={
                            language === "en"
                              ? "Listen to pronunciation"
                              : "Écouter la prononciation"
                          }
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                          </svg>
                        </button>
                      ) : undefined
                    }
                  />
                </div>
                {currentExercise.blankHint && (
                  <p className="text-xl text-emerald-600 font-medium pb-2 text-center mt-[-10px] md:mt-[-20px]">
                    {currentExercise.blankHint}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
