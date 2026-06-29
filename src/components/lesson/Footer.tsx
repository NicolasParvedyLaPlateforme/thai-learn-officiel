import { getTranslation } from "@/hooks/useTranslation";
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Exercise, Word } from "@/types";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

interface FooterProps {
  currentExercise: Exercise;
  isChecking: boolean;
  isCorrect: boolean | null;
  language: string;
  selectedAnswer?: string | string[] | null;
  showFooter: boolean;
  handleCheck: () => void;
  customCorrectAnswer?: React.ReactNode;
  disableCheck?: boolean;
}

export default function Footer({
  currentExercise,
  isChecking,
  isCorrect,
  language,
  selectedAnswer,
  showFooter,
  handleCheck,
  customCorrectAnswer,
  disableCheck,
}: FooterProps) {
  const shouldRender = (() => {
    if (currentExercise.type === "pair-matching")
      return isChecking && !isCorrect;
    if (
      !isChecking &&
      currentExercise.type !== "intro" &&
      (currentExercise.type as any) !== "review"
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
          className={`absolute bottom-0 left-0 right-0 w-full min-h-[100px] md:min-h-[110px] py-4 md:py-0 border-t-2 items-center justify-center flex transition-all duration-300 z-50 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] ${
            isChecking
              ? isCorrect
                ? "border-emerald-200"
                : "border-rose-200"
              : "border-slate-100"
          }`}
        >
          <div className="w-full max-w-3xl px-6 flex sm:flex-row flex-col items-center justify-between gap-6">
            <div className="flex-1 w-full text-center sm:text-left">
              {isChecking && isCorrect && (
                <div className="flex items-center justify-center sm:justify-start gap-3 text-emerald-600 font-bold text-xl">
                  <div className="bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                    <Check size={24} strokeWidth={2.5} />
                  </div>
                  {getTranslation('auto.excellent', language)}
                </div>
              )}
              {isChecking && !isCorrect && (
                <div className="flex flex-col text-rose-600 gap-1 items-center sm:items-start">
                  <div className="flex items-center gap-3 font-bold text-xl">
                    <div className="bg-rose-100 text-rose-600 rounded-full p-1.5">
                      <X size={24} strokeWidth={2.5} />
                    </div>
                    {getTranslation('auto.incorrect', language)}
                    {currentExercise.type === "writing" &&
                      currentExercise.blindMode &&
                      currentExercise.correctComponents && (
                        <span className="text-sm font-semibold opacity-80 ml-2">
                          {Math.round(
                            (((selectedAnswer as string[]) || []).filter(
                              (c: string, i: number) =>
                                c === currentExercise.correctComponents![i]
                            ).length /
                              currentExercise.correctComponents!.length) *
                              100
                          )}
                          % {getTranslation('auto.match', language)}
                        </span>
                      )}
                    {currentExercise.type === "free-typing" &&
                      typeof selectedAnswer === "string" && (
                        <span className="text-sm font-semibold opacity-80 ml-2">
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
                          % {getTranslation('auto.match', language)}
                        </span>
                      )}
                  </div>
                  <div className="text-rose-800/70 text-xs mt-2 uppercase tracking-widest font-semibold">
                    {getTranslation('auto.correct_answer', language)}
                  </div>
                  <div className="font-medium font-thai text-xl md:text-2xl mt-1 text-rose-900">
                    {customCorrectAnswer ? (
                      customCorrectAnswer
                    ) : currentExercise.type === "writing" &&
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
                        currentExercise.correctComponents.forEach((char: string, i: number) => {
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
                                : "text-rose-600 font-bold underline decoration-rose-300 decoration-2 underline-offset-4"
                            }
                          >
                            {cluster.chars}
                          </span>
                        ));
                      })()
                    ) : (
                      <span className={currentExercise.reverse ? "font-sans" : ""}>
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

            <Button
              id="next-btn"
              onClick={handleCheck}
              disabled={
                disableCheck !== undefined ? disableCheck :
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
              size="lg"
              variant={isChecking && !isCorrect ? "dangerGamified" : "gamified"}
              className="w-full sm:w-auto min-w-[200px] text-lg uppercase tracking-wider"
            >
              {currentExercise.type === "intro" || isChecking
                ? getTranslation('auto.continue', language)
                : getTranslation('auto.check', language)}
            </Button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
