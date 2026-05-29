import { Check } from "lucide-react";
import InstructionExample from "./InstructionExample";
import { Exercise } from "../../../types";
import { motion } from "motion/react";

interface InstructionBlockProps {
  language: string;
  instructionText: string | null;
  instructionKey: string | null;
  currentExercise: Exercise;
  dontShowAgain: boolean;
  setDontShowAgain: (val: boolean) => void;
  showHelpModal: boolean;
  setShowHelpModal: (val: boolean) => void;
  hideInstruction: (key: string) => void;
  unhideInstruction: (key: string) => void;
  setAcknowledgedInstructions: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function InstructionBlock({
  language,
  instructionText,
  instructionKey,
  currentExercise,
  dontShowAgain,
  setDontShowAgain,
  showHelpModal,
  setShowHelpModal,
  hideInstruction,
  unhideInstruction,
  setAcknowledgedInstructions,
}: InstructionBlockProps) {
  return (
    <div className="absolute inset-0 bg-[#FFFBF0] z-50 flex flex-col overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-amber-100/80 py-2 md:py-3 text-amber-800 font-semibold flex items-center justify-center gap-2 mb-4 md:mb-6 border-b border-amber-200/50 flex-shrink-0">
        <span className="text-xl">💡</span>{" "}
        {language === "en"
          ? "Here is how this exercise works"
          : "Voici comment fonctionne cet exercice"}
      </motion.div>

      <div className="flex-1 flex flex-col items-center w-full px-4 md:px-6 max-w-2xl mx-auto gap-4 pb-4">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight text-center">
          {instructionText}
        </motion.h2>

        {currentExercise.type !== "intro" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white p-5 md:p-8 rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg border-2 border-dashed border-amber-300 shadow-sm mx-auto relative mt-2 shrink-0">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm border border-amber-200/50">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
              {language === "en" ? "Example" : "Exemple"}
            </div>
            <InstructionExample
              typeKey={instructionKey}
              language={language}
            />
          </motion.div>
        )}

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-slate-500 font-medium text-center text-sm md:text-base max-w-sm leading-relaxed mt-4 shrink-0">
          {language === "en"
            ? "In the next steps, you will have to find the correct answer yourself!"
            : "Dans les prochaines étapes, vous devrez trouver la bonne réponse vous-même !"}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-4 w-full max-w-sm shrink-0 mt-auto flex flex-col gap-3">
          <label className="flex items-center justify-center md:justify-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-amber-100/50 transition-colors">
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                dontShowAgain
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-amber-300 bg-white"
              }`}
            >
              {dontShowAgain && <Check size={16} strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium text-slate-600 text-center md:text-left">
              {language === "en"
                ? "Do not show this automatically for this exercise type"
                : "Ne plus m'afficher cette aide automatiquement"}
            </span>
            <input
              type="checkbox"
              className="hidden"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
          </label>
          <button
            onClick={() => {
              if (dontShowAgain && instructionKey) {
                hideInstruction(instructionKey);
              } else if (!dontShowAgain && instructionKey) {
                unhideInstruction(instructionKey);
              }

              setShowHelpModal(false);
              setAcknowledgedInstructions((prev) => {
                const newer = new Set(prev);
                if (instructionKey) newer.add(instructionKey);
                return newer;
              });
            }}
            className="w-full py-4 rounded-2xl bg-zinc-900 border-b-4 border-zinc-950 text-white font-bold text-lg shadow-lg hover:bg-zinc-800 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
          >
            {language === "en" ? "Got it" : "J'ai compris"}
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
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
