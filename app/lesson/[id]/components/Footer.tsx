import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Exercise, Word } from "../../../types";

interface FooterProps {
  currentExercise: Exercise;
  isChecking: boolean;
  isCorrect: boolean | null;
  language: string;
  selectedAnswer: string | string[] | null;
  showFooter: boolean;
  handleCheck: () => void;
}

export default function Footer({
  currentExercise,
  isChecking,
  isCorrect,
  language,
  selectedAnswer,
  showFooter,
  handleCheck,
}: FooterProps) {
  const shouldRender = (() => {
    if (currentExercise.type === "pair-matching")
      return isChecking && !isCorrect;
    if (
      !isChecking &&
      (currentExercise.type === "word-match" ||
        currentExercise.type === "sentence-builder" ||
        currentExercise.type === "writing")
    ) {
      return false;
    }
    return true;
  })();

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {showFooter && (
        <motion.footer
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute bottom-0 left-0 right-0 w-full min-h-[100px] md:min-h-[128px] py-4 md:py-0 border-t-2 items-center justify-center flex transition-colors duration-300 z-50 ${
            isChecking
              ? isCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200 shadow-[0_-10px_40px_rgba(244,63,94,0.1)]"
              : "bg-white border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          }`}
        >
          <div className="w-full max-w-2xl px-4 flex sm:flex-row flex-col items-center justify-between gap-4">
            <div className="flex-1 w-full text-center sm:text-left">
              {isChecking && isCorrect && (
                <div className="flex items-center justify-center sm:justify-start gap-3 text-emerald-600 font-extrabold text-xl">
                  <div className="bg-white text-emerald-500 rounded-full p-1">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  {language === "en" ? "Excellent!" : "Excellent !"}
                </div>
              )}
              {isChecking && !isCorrect && (
                <div className="flex flex-col text-rose-600 font-extrabold text-xl gap-1 items-center sm:items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-rose-500 rounded-full p-1">
                      <X size={24} strokeWidth={3} />
                    </div>
                    {language === "en" ? "Incorrect." : "Incorrect."}
                    {currentExercise.type === "writing" &&
                      currentExercise.blindMode &&
                      currentExercise.correctComponents && (
                        <span className="text-sm font-bold opacity-80 ml-2">
                          {Math.round(
                            (((selectedAnswer as string[]) || []).filter(
                              (c: string, i: number) =>
                                c === currentExercise.correctComponents![i]
                            ).length /
                              currentExercise.correctComponents!.length) *
                              100
                          )}
                          % {language === "en" ? "match" : "réussite"}
                        </span>
                      )}
                    {currentExercise.type === "free-typing" &&
                      typeof selectedAnswer === "string" && (
                        <span className="text-sm font-bold opacity-80 ml-2">
                          {Math.round(
                            (1 -
                              (() => {
                                const a = selectedAnswer.replace(/\s+/g, "");
                                const b = currentExercise.answer.replace(
                                  /\s+/g,
                                  ""
                                );
                                if (a.length === 0)
                                  return b.length / Math.max(1, b.length);
                                if (b.length === 0)
                                  return a.length / Math.max(1, a.length);
                                const matrix = Array.from(
                                  { length: a.length + 1 },
                                  () => new Array(b.length + 1).fill(0)
                                );
                                for (let i = 0; i <= a.length; i++)
                                  matrix[i][0] = i;
                                for (let j = 0; j <= b.length; j++)
                                  matrix[0][j] = j;
                                for (let i = 1; i <= a.length; i++) {
                                  for (let j = 1; j <= b.length; j++) {
                                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                                    matrix[i][j] = Math.min(
                                      matrix[i - 1][j] + 1,
                                      matrix[i][j - 1] + 1,
                                      matrix[i - 1][j - 1] + cost
                                    );
                                  }
                                }
                                return (
                                  matrix[a.length][b.length] /
                                  Math.max(a.length, b.length)
                                );
                              })()) *
                              100
                          )}
                          % {language === "en" ? "match" : "réussite"}
                        </span>
                      )}
                  </div>
                  <div className="text-rose-800 text-sm mt-1 uppercase tracking-widest">
                    {language === "en"
                      ? "Correct answer:"
                      : "Réponse correcte :"}
                  </div>
                  <div className="font-medium font-thai text-xl md:text-2xl mt-1 sm:mt-0">
                    {currentExercise.type === "writing" &&
                    currentExercise.blindMode &&
                    currentExercise.correctComponents ? (
                      (() => {
                        const isCombiningLocal = (charStr: string) => {
                          if (!charStr) return false;
                          const code = charStr.charCodeAt(0);
                          return (
                            code === 0x0e31 ||
                            (code >= 0x0e34 && code <= 0x0e3a) ||
                            (code >= 0x0e47 && code <= 0x0e4e)
                          );
                        };
                        const clusters: {
                          chars: string;
                          isMatch: boolean;
                        }[] = [];
                        currentExercise.correctComponents.forEach((char, i) => {
                          const typedChar = (
                            (selectedAnswer as string[]) || []
                          )[i];
                          const isMatch = typedChar === char;

                          if (
                            clusters.length === 0 ||
                            !isCombiningLocal(char)
                          ) {
                            clusters.push({ chars: char, isMatch });
                          } else {
                            clusters[clusters.length - 1].chars += char;
                            if (!isMatch) {
                              clusters[clusters.length - 1].isMatch = false;
                            }
                          }
                        });

                        return clusters.map((cluster, idx) => (
                          <span
                            key={`ans-cluster-${idx}`}
                            className={
                              cluster.isMatch
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }
                          >
                            {cluster.chars}
                          </span>
                        ));
                      })()
                    ) : (
                      <span
                        className={`text-rose-900 ${
                          currentExercise.reverse ? "font-sans" : ""
                        }`}
                      >
                        {currentExercise.reverse
                          ? (() => {
                              const correctOpt = (
                                currentExercise.options as Word[]
                              ).find((o) => o.th === currentExercise.answer);
                              if (correctOpt) {
                                return language === "en"
                                  ? correctOpt.en || correctOpt.fr
                                  : correctOpt.fr;
                              }
                              return currentExercise.answer;
                            })()
                          : currentExercise.answer}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              id="next-btn"
              onClick={handleCheck}
              disabled={
                currentExercise.type !== "intro" &&
                !isChecking &&
                (!selectedAnswer ||
                  (Array.isArray(selectedAnswer) &&
                    (currentExercise.type === "writing" &&
                    currentExercise.correctComponents
                      ? selectedAnswer.length !==
                        currentExercise.correctComponents.length
                      : selectedAnswer.length === 0)))
              }
              className={`w-full sm:w-auto px-12 py-3 rounded-xl border-b-4 font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:scale-100 disabled:shadow-none
                ${
                  currentExercise.type === "intro"
                    ? "bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400"
                    : isChecking
                      ? isCorrect
                        ? "bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400"
                        : "bg-rose-500 border-rose-700 text-white hover:bg-rose-400"
                      : "bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400"
                }
              `}
            >
              {currentExercise.type === "intro" || isChecking
                ? language === "en"
                  ? "Continue"
                  : "Continuer"
                : language === "en"
                  ? "Check"
                  : "Vérifier"}
            </button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
